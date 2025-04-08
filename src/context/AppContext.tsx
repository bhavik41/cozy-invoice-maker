
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Product, Customer, Invoice, InvoiceFilter, ProductFilter, CustomerFilter } from '@/types';
import { toast } from 'sonner';

// Define the window.api type
declare global {
  interface Window {
    api?: {
      getItems: (table: string) => Promise<any[]>;
      getItem: (table: string, id: string) => Promise<any>;
      addItem: (table: string, item: any) => Promise<any>;
      updateItem: (table: string, item: any) => Promise<any>;
      deleteItem: (table: string, id: string) => Promise<string>;
      exportData: () => Promise<any>;
      importData: (data: any) => Promise<{success: boolean}>;
      getSetting: (key: string) => Promise<any>;
      setSetting: (key: string, value: any) => Promise<any>;
    };
  }
}

// Check if we're running in Electron
const isElectron = window.api !== undefined;

interface AppContextProps {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  filterProducts: (filter: ProductFilter) => Product[];
  filterCustomers: (filter: CustomerFilter) => Customer[];
  filterInvoices: (filter: InvoiceFilter) => Invoice[];
  getProduct: (id: string) => Product | undefined;
  getCustomer: (id: string) => Customer | undefined;
  getInvoice: (id: string) => Invoice | undefined;
  getNextInvoiceNumber: () => string;
  exportData: () => void;
  importData: (data: any) => void;
  currentSeller: Customer | null;
  setCurrentSeller: (seller: Customer) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentSeller, setCurrentSeller] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        if (isElectron) {
          // Load from SQLite via Electron IPC
          console.log('Loading data from Electron...');
          
          try {
            const loadedProducts = await window.api!.getItems('products');
            console.log('Loaded products:', loadedProducts);
            if (loadedProducts && Array.isArray(loadedProducts)) {
              setProducts(loadedProducts);
            }

            const loadedCustomers = await window.api!.getItems('customers');
            console.log('Loaded customers:', loadedCustomers);
            if (loadedCustomers && Array.isArray(loadedCustomers)) {
              setCustomers(loadedCustomers);
            }

            const loadedInvoices = await window.api!.getItems('invoices');
            console.log('Loaded invoices:', loadedInvoices);
            if (loadedInvoices && Array.isArray(loadedInvoices)) {
              setInvoices(loadedInvoices);
            }

            const loadedSeller = await window.api!.getSetting('currentSeller');
            console.log('Loaded seller:', loadedSeller);
            if (loadedSeller) {
              setCurrentSeller(loadedSeller);
            }
          } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load data from database.');
          }
        } else {
          // Fallback to localStorage for web browser development
          console.log('Loading data from localStorage...');
          
          const loadedProducts = localStorage.getItem('products');
          if (loadedProducts) {
            try {
              setProducts(JSON.parse(loadedProducts));
            } catch (error) {
              console.error('Error parsing products:', error);
            }
          }

          const loadedCustomers = localStorage.getItem('customers');
          if (loadedCustomers) {
            try {
              setCustomers(JSON.parse(loadedCustomers));
            } catch (error) {
              console.error('Error parsing customers:', error);
            }
          }

          const loadedInvoices = localStorage.getItem('invoices');
          if (loadedInvoices) {
            try {
              setInvoices(JSON.parse(loadedInvoices));
            } catch (error) {
              console.error('Error parsing invoices:', error);
            }
          }

          const loadedSeller = localStorage.getItem('currentSeller');
          if (loadedSeller) {
            try {
              setCurrentSeller(JSON.parse(loadedSeller));
            } catch (error) {
              console.error('Error parsing currentSeller:', error);
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save data whenever it changes
  // Using useEffect to handle both Electron and web browser environments
  useEffect(() => {
    if (isElectron) {
      // No need to save on every change in Electron, as we'll save directly on CRUD operations
    } else {
      // Fallback to localStorage for web browser development
      localStorage.setItem('products', JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    if (!isElectron) {
      localStorage.setItem('customers', JSON.stringify(customers));
    }
  }, [customers]);

  useEffect(() => {
    if (!isElectron) {
      localStorage.setItem('invoices', JSON.stringify(invoices));
    }
  }, [invoices]);

  useEffect(() => {
    if (currentSeller) {
      if (isElectron) {
        window.api!.setSetting('currentSeller', currentSeller).catch(error => {
          console.error('Error saving currentSeller:', error);
        });
      } else {
        localStorage.setItem('currentSeller', JSON.stringify(currentSeller));
      }
    }
  }, [currentSeller]);

  // Product operations
  const addProduct = async (product: Product) => {
    if (isElectron) {
      try {
        console.log('Adding product:', product);
        await window.api!.addItem('products', product);
        setProducts(prevProducts => [...prevProducts, product]);
        toast.success('Product added successfully');
      } catch (error) {
        console.error('Error adding product:', error);
        toast.error('Failed to add product');
      }
    } else {
      setProducts(prevProducts => [...prevProducts, product]);
      toast.success('Product added successfully');
    }
  };

  const updateProduct = async (product: Product) => {
    if (isElectron) {
      try {
        await window.api!.updateItem('products', product);
        setProducts(products.map(p => p.id === product.id ? product : p));
        toast.success('Product updated successfully');
      } catch (error) {
        console.error('Error updating product:', error);
        toast.error('Failed to update product');
      }
    } else {
      setProducts(products.map(p => p.id === product.id ? product : p));
      toast.success('Product updated successfully');
    }
  };

  const deleteProduct = async (id: string) => {
    if (isElectron) {
      try {
        await window.api!.deleteItem('products', id);
        setProducts(products.filter(p => p.id !== id));
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    } else {
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted successfully');
    }
  };

  // Customer operations
  const addCustomer = async (customer: Customer) => {
    if (isElectron) {
      try {
        console.log('Adding customer:', customer);
        await window.api!.addItem('customers', customer);
        setCustomers(prevCustomers => [...prevCustomers, customer]);
        toast.success('Customer added successfully');
      } catch (error) {
        console.error('Error adding customer:', error);
        toast.error('Failed to add customer');
      }
    } else {
      setCustomers(prevCustomers => [...prevCustomers, customer]);
      toast.success('Customer added successfully');
    }
  };

  const updateCustomer = async (customer: Customer) => {
    if (isElectron) {
      try {
        await window.api!.updateItem('customers', customer);
        setCustomers(customers.map(c => c.id === customer.id ? customer : c));
        toast.success('Customer updated successfully');
      } catch (error) {
        console.error('Error updating customer:', error);
        toast.error('Failed to update customer');
      }
    } else {
      setCustomers(customers.map(c => c.id === customer.id ? customer : c));
      toast.success('Customer updated successfully');
    }
  };

  const deleteCustomer = async (id: string) => {
    if (isElectron) {
      try {
        await window.api!.deleteItem('customers', id);
        setCustomers(customers.filter(c => c.id !== id));
        toast.success('Customer deleted successfully');
      } catch (error) {
        console.error('Error deleting customer:', error);
        toast.error('Failed to delete customer');
      }
    } else {
      setCustomers(customers.filter(c => c.id !== id));
      toast.success('Customer deleted successfully');
    }
  };

  // Invoice operations
  const addInvoice = async (invoice: Invoice) => {
    if (isElectron) {
      try {
        console.log('Adding invoice:', invoice);
        await window.api!.addItem('invoices', invoice);
        setInvoices(prevInvoices => [...prevInvoices, invoice]);
        toast.success('Invoice created successfully');
      } catch (error) {
        console.error('Error adding invoice:', error);
        toast.error('Failed to create invoice');
      }
    } else {
      setInvoices(prevInvoices => [...prevInvoices, invoice]);
      toast.success('Invoice created successfully');
    }
  };

  const updateInvoice = async (invoice: Invoice) => {
    if (isElectron) {
      try {
        await window.api!.updateItem('invoices', invoice);
        setInvoices(invoices.map(i => i.id === invoice.id ? invoice : i));
        toast.success('Invoice updated successfully');
      } catch (error) {
        console.error('Error updating invoice:', error);
        toast.error('Failed to update invoice');
      }
    } else {
      setInvoices(invoices.map(i => i.id === invoice.id ? invoice : i));
      toast.success('Invoice updated successfully');
    }
  };

  const deleteInvoice = async (id: string) => {
    if (isElectron) {
      try {
        await window.api!.deleteItem('invoices', id);
        setInvoices(invoices.filter(i => i.id !== id));
        toast.success('Invoice deleted successfully');
      } catch (error) {
        console.error('Error deleting invoice:', error);
        toast.error('Failed to delete invoice');
      }
    } else {
      setInvoices(invoices.filter(i => i.id !== id));
      toast.success('Invoice deleted successfully');
    }
  };

  // Filter operations (these run client-side regardless of storage method)
  const filterProducts = (filter: ProductFilter): Product[] => {
    let filtered = [...products];

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower)
      );
    }

    if (filter.gstRate !== undefined) {
      filtered = filtered.filter(p => p.gstRate === filter.gstRate);
    }

    if (filter.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= filter.minPrice!);
    }

    if (filter.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= filter.maxPrice!);
    }

    return filtered;
  };

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

  // Getter functions
  const getProduct = (id: string): Product | undefined => {
    return products.find(p => p.id === id);
  };

  const getCustomer = (id: string): Customer | undefined => {
    return customers.find(c => c.id === id);
  };

  const getInvoice = (id: string): Invoice | undefined => {
    return invoices.find(i => i.id === id);
  };

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

  // Export/Import functions
  const exportData = async () => {
    if (isElectron) {
      try {
        const data = await window.api!.exportData();
        
        // Save the data to a file using Electron's dialog
        const dataStr = JSON.stringify(data);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `invoice-data-backup-${new Date().toISOString().slice(0, 10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        toast.success('Data exported successfully');
      } catch (error) {
        console.error('Error exporting data:', error);
        toast.error('Failed to export data');
      }
    } else {
      // Web browser fallback
      const data = {
        products,
        customers,
        invoices,
        currentSeller
      };

      const dataStr = JSON.stringify(data);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `invoice-data-backup-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Data exported successfully');
    }
  };

  const importData = async (data: any) => {
    if (isElectron) {
      try {
        await window.api!.importData(data);
        
        // Reload data from database
        const loadedProducts = await window.api!.getItems('products');
        if (loadedProducts) setProducts(loadedProducts);
        
        const loadedCustomers = await window.api!.getItems('customers');
        if (loadedCustomers) setCustomers(loadedCustomers);
        
        const loadedInvoices = await window.api!.getItems('invoices');
        if (loadedInvoices) setInvoices(loadedInvoices);
        
        const loadedSeller = await window.api!.getSetting('currentSeller');
        if (loadedSeller) setCurrentSeller(loadedSeller);
        
        toast.success('Data imported successfully');
      } catch (error) {
        console.error('Error importing data:', error);
        toast.error('Failed to import data');
      }
    } else {
      // Web browser fallback
      if (data.products) setProducts(data.products);
      if (data.customers) setCustomers(data.customers);
      if (data.invoices) setInvoices(data.invoices);
      if (data.currentSeller) setCurrentSeller(data.currentSeller);
      
      toast.success('Data imported successfully');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading data...</div>;
  }

  return (
    <AppContext.Provider value={{
      products,
      customers,
      invoices,
      addProduct,
      updateProduct,
      deleteProduct,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      filterProducts,
      filterCustomers,
      filterInvoices,
      getProduct,
      getCustomer,
      getInvoice,
      getNextInvoiceNumber,
      exportData,
      importData,
      currentSeller,
      setCurrentSeller
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
