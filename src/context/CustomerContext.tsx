
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, CustomerFilter } from '@/types';
import { toast } from 'sonner';
import { useBaseData } from './BaseDataContext';
import * as storage from '@/utils/storage';

interface CustomerContextProps {
  customers: Customer[];
  currentSeller: Customer | null;
  setCurrentSeller: (seller: Customer) => void;
  addCustomer: (customer: Customer) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getCustomer: (id: string) => Customer | undefined;
  filterCustomers: (filter: CustomerFilter) => Customer[];
}

const CustomerContext = createContext<CustomerContextProps | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [currentSeller, setCurrentSeller] = useState<Customer | null>(null);
  const { filterByCompany, addCompanyId } = useBaseData();
  
  // Filtered customers based on current user's company
  const customers = filterByCompany(allCustomers);

  // Load customers and current seller on mount
  useEffect(() => {
    const loadData = async () => {
      const loadedCustomers = await storage.getItems<Customer>('customers');
      setAllCustomers(loadedCustomers);
      
      const loadedSeller = await storage.getSetting<Customer>('currentSeller');
      if (loadedSeller) {
        setCurrentSeller(loadedSeller);
      }
    };
    
    loadData();
  }, []);

  // Save customers when they change (localStorage only)
  useEffect(() => {
    if (!storage.isElectron) {
      storage.saveItems('customers', allCustomers);
    }
  }, [allCustomers]);

  // Save current seller when it changes
  useEffect(() => {
    if (currentSeller) {
      storage.saveSetting('currentSeller', currentSeller);
    }
  }, [currentSeller]);

  // Add a customer
  const addCustomer = async (customer: Customer): Promise<void> => {
    try {
      // Add company ID
      const customerWithCompany = addCompanyId(customer);
      
      // Add to storage
      await storage.addItem('customers', customerWithCompany);
      
      // Update state
      setAllCustomers(prev => [...prev, customerWithCompany]);
      toast.success('Customer added successfully');
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Failed to add customer');
    }
  };

  // Update a customer
  const updateCustomer = async (customer: Customer): Promise<void> => {
    try {
      // Get existing customer
      const existingCustomer = allCustomers.find(c => c.id === customer.id);
      if (!existingCustomer) {
        throw new Error('Customer not found');
      }
      
      // Ensure customer has the same companyId as before
      const companyId = (existingCustomer as any)?.companyId || 'company-1';
      const updatedCustomer = {
        ...customer,
        companyId
      } as Customer & { companyId: string };
      
      // Update in storage
      await storage.updateItem('customers', updatedCustomer);
      
      // Update state
      setAllCustomers(prev => prev.map(c => c.id === customer.id ? updatedCustomer : c));
      
      // Update current seller if it's the same customer
      if (currentSeller && currentSeller.id === customer.id) {
        setCurrentSeller(updatedCustomer);
      }
      
      toast.success('Customer updated successfully');
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
    }
  };

  // Delete a customer
  const deleteCustomer = async (id: string): Promise<void> => {
    try {
      // Delete from storage
      await storage.deleteItem<Customer>('customers', id);
      
      // Update state
      setAllCustomers(prev => prev.filter(c => c.id !== id));
      
      // Clear current seller if it's the deleted customer
      if (currentSeller && currentSeller.id === id) {
        setCurrentSeller(null);
      }
      
      toast.success('Customer deleted successfully');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    }
  };

  // Get a customer by ID
  const getCustomer = (id: string): Customer | undefined => {
    // First check filtered customers (which respect company isolation)
    return customers.find(c => c.id === id);
  };

  // Filter customers
  const filterCustomers = (filter: CustomerFilter): Customer[] => {
    let filtered = [...customers];

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchLower) || 
        c.gstin.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower)
      );
    }

    if (filter.state) {
      filtered = filtered.filter(c => c.state.toLowerCase() === filter.state!.toLowerCase());
    }

    return filtered;
  };

  return (
    <CustomerContext.Provider value={{
      customers,
      currentSeller,
      setCurrentSeller,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      getCustomer,
      filterCustomers
    }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
};
