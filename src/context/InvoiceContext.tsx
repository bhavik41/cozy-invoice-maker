
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Invoice, InvoiceFilter } from '@/types';
import { toast } from 'sonner';
import { useBaseData } from './BaseDataContext';
import * as storage from '@/utils/storage';

interface InvoiceContextProps {
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => Promise<void>;
  updateInvoice: (invoice: Invoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  getInvoice: (id: string) => Invoice | undefined;
  filterInvoices: (filter: InvoiceFilter) => Invoice[];
  getNextInvoiceNumber: () => string;
}

const InvoiceContext = createContext<InvoiceContextProps | undefined>(undefined);

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const { filterByCompany, addCompanyId } = useBaseData();
  
  // Filtered invoices based on current user's company
  const invoices = filterByCompany(allInvoices);

  // Load invoices on mount
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const loadedInvoices = await storage.getItems<Invoice>('invoices');
        if (Array.isArray(loadedInvoices)) {
          setAllInvoices(loadedInvoices);
        } else {
          console.error('Loaded invoices is not an array:', loadedInvoices);
          setAllInvoices([]);
        }
      } catch (error) {
        console.error('Error loading invoices:', error);
        setAllInvoices([]);
      }
    };
    
    loadInvoices();
  }, []);

  // Save invoices when they change (localStorage only)
  useEffect(() => {
    if (!storage.isElectron) {
      storage.saveItems('invoices', allInvoices);
    }
  }, [allInvoices]);

  // Add an invoice
  const addInvoice = async (invoice: Invoice): Promise<void> => {
    try {
      // Add company ID
      const invoiceWithCompany = addCompanyId(invoice);
      
      // Check if this is an update operation (if invoice has an id)
      if (invoice.id && allInvoices.some(i => i.id === invoice.id)) {
        // If the invoice exists, update it instead of adding
        return updateInvoice(invoice);
      }
      
      // Add to storage
      await storage.addItem('invoices', invoiceWithCompany);
      
      // Update state
      setAllInvoices(prev => [...prev, invoiceWithCompany]);
      toast.success('Invoice created successfully');
    } catch (error) {
      console.error('Error adding invoice:', error);
      toast.error('Failed to create invoice');
    }
  };

  // Update an invoice
  const updateInvoice = async (invoice: Invoice): Promise<void> => {
    try {
      console.log("Updating invoice with ID:", invoice.id);
      
      // Get existing invoice
      const existingInvoice = allInvoices.find(i => i.id === invoice.id);
      if (!existingInvoice) {
        throw new Error('Invoice not found');
      }
      
      // Ensure invoice has the same companyId as before
      const companyId = (existingInvoice as any)?.companyId || 'company-1';
      
      // Preserve one-time customer data if the updated invoice still uses a one-time customer
      // or if we're switching from an existing customer to a one-time customer
      const updatedInvoice = {
        ...invoice,
        companyId
      } as Invoice & { companyId: string };
      
      console.log("Full updated invoice:", updatedInvoice);
      
      // Update in storage
      await storage.updateItem('invoices', updatedInvoice);
      
      // Update state
      setAllInvoices(prev => prev.map(i => i.id === invoice.id ? updatedInvoice : i));
      toast.success('Invoice updated successfully');
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice');
      throw error; // Re-throw to handle in component if needed
    }
  };

  // Delete an invoice
  const deleteInvoice = async (id: string): Promise<void> => {
    try {
      // Delete from storage
      await storage.deleteItem<Invoice>('invoices', id);
      
      // Update state
      setAllInvoices(prev => prev.filter(i => i.id !== id));
      toast.success('Invoice deleted successfully');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    }
  };

  // Get an invoice by ID
  const getInvoice = (id: string): Invoice | undefined => {
    try {
      // First check filtered invoices (which respect company isolation)
      const invoice = invoices.find(i => i.id === id);
      
      if (!invoice) return undefined;
      
      // Make sure seller is defined
      if (!invoice.seller) {
        console.warn(`Invoice ${id} has no seller data, providing default empty object`);
        invoice.seller = {
          id: '',
          name: 'N/A',
          address: 'N/A',
          gstin: 'N/A',
          state: 'N/A',
          stateCode: 'N/A',
          contact: 'N/A',
          email: 'N/A',
          pan: 'N/A'
        };
      }
      
      // Handle buyer data differently based on whether it's a one-time customer
      if (invoice.useExistingBuyer) {
        // For existing customers, ensure buyer is defined
        if (!invoice.buyer) {
          console.warn(`Invoice ${id} has no buyer data, providing default empty object`);
          invoice.buyer = {
            id: '',
            name: 'N/A',
            address: 'N/A',
            gstin: 'N/A',
            state: 'N/A', 
            stateCode: 'N/A',
            contact: 'N/A',
            email: 'N/A',
            pan: 'N/A'
          };
        }
      } else {
        // For one-time customers, create a buyer object from invoice fields
        // This ensures the buyer data is available in the same format regardless of customer type
        invoice.buyer = {
          id: 'one-time',
          name: invoice.buyerName || 'N/A',
          address: invoice.buyerAddress || 'N/A',
          gstin: invoice.buyerGstin || 'N/A',
          state: invoice.buyerState || 'N/A',
          stateCode: invoice.buyerStateCode || 'N/A',
          contact: invoice.buyerContact || 'N/A',
          email: invoice.buyerEmail || 'N/A',
          pan: invoice.buyerPan || 'N/A'
        };
      }
      
      return invoice;
    } catch (error) {
      console.error('Error getting invoice:', error);
      return undefined;
    }
  };

  // Generate next invoice number
  const getNextInvoiceNumber = (): string => {
    if (invoices.length === 0) {
      return 'INV-0001';
    }

    const invoiceNumbers = invoices.map(i => {
      const match = i.invoiceNumber.match(/INV-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });

    const maxNumber = Math.max(...invoiceNumbers);
    return `INV-${String(maxNumber + 1).padStart(4, '0')}`;
  };

  // Filter invoices
  const filterInvoices = (filter: InvoiceFilter): Invoice[] => {
    let filtered = [...invoices];

    if (filter.startDate) {
      filtered = filtered.filter(i => new Date(i.date) >= filter.startDate!);
    }

    if (filter.endDate) {
      filtered = filtered.filter(i => new Date(i.date) <= filter.endDate!);
    }

    if (filter.customerId) {
      filtered = filtered.filter(i => i.buyerId === filter.customerId);
    }

    if (filter.minAmount !== undefined) {
      filtered = filtered.filter(i => i.totalAmount >= filter.minAmount!);
    }

    if (filter.maxAmount !== undefined) {
      filtered = filtered.filter(i => i.totalAmount <= filter.maxAmount!);
    }

    return filtered;
  };

  return (
    <InvoiceContext.Provider value={{
      invoices,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      getInvoice,
      filterInvoices,
      getNextInvoiceNumber
    }}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoices = () => {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
};
