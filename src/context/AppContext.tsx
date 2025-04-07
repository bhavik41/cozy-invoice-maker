
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Product, Customer, Invoice, InvoiceFilter, ProductFilter, CustomerFilter } from '@/types';

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

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      if (isElectron) {
        // Load from SQLite via Electron IPC
        try {
          const loadedProducts = await window.api!.getItems('products');
          if (loadedProducts && loadedProducts.length > 0) {
            setProducts(loadedProducts);
          }

          const loadedCustomers = await window.api!.getItems('customers');
          if (loadedCustomers && loadedCustomers.length > 0) {
            setCustomers(loadedCustomers);
          }

          const loadedInvoices = await window.api!.getItems('invoices');
          if (loadedInvoices && loadedInvoices.length > 0) {
            setInvoices(loadedInvoices);
          }

          const loadedSeller = await window.api!.getSetting('currentSeller');
          if (loadedSeller) {
            setCurrentSeller(loadedSeller);
          }
        } catch (error) {
          console.error('Error loading data:', error);
        }
      } else {
        // Fallback to localStorage for web browser development
        const loadedProducts = localStorage.getItem('products');
        if (loadedProducts) {
          setProducts(JSON.parse(loadedProducts));
        }

        const loadedCustomers = localStorage.getItem('customers');
        if (loadedCustomers) {
          setCustomers(JSON.parse(loadedCustomers));
        }

        const loadedInvoices = localStorage.getItem('invoices');
        if (loadedInvoices) {
          setInvoices(JSON.parse(loadedInvoices));
        }

        const loadedSeller = localStorage.getItem('currentSeller');
        if (loadedSeller) {
          setCurrentSeller(JSON.parse(loadedSeller));
        }
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
        window.api!.setSetting('currentSeller', currentSeller).catch(console.error);
      } else {
        localStorage.setItem('currentSeller', JSON.stringify(currentSeller));
      }
    }
  }, [currentSeller]);

  // Product operations
  const addProduct = async (product: Product) => {
    if (isElectron) {
      try {
        await window.api!.addItem('products', product);
        setProducts([...products, product]);
      } catch (error) {
        console.error('Error adding product:', error);
      }
    } else {
      setProducts([...products, product]);
    }
  };

  const updateProduct = async (product: Product) => {
    if (isElectron) {
      try {
        await window.api!.updateItem('products', product);
        setProducts(products.map(p => p.id === product.id ? product : p));
      } catch (error) {
        console.error('Error updating product:', error);
      }
    } else {
      setProducts(products.map(p => p.id === product.id ? product : p));
    }
  };

  const deleteProduct = async (id: string) => {
    if (isElectron) {
      try {
        await window.api!.deleteItem('products', id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    } else {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // Customer operations
  const addCustomer = async (customer: Customer) => {
    if (isElectron) {
      try {
        await window.api!.addItem('customers', customer);
        setCustomers([...customers, customer]);
      } catch (error) {
        console.error('Error adding customer:', error);
      }
    } else {
      setCustomers([...customers, customer]);
    }
  };

  const updateCustomer = async (customer: Customer) => {
    if (isElectron) {
      try {
        await window.api!.updateItem('customers', customer);
        setCustomers(customers.map(c => c.id === customer.id ? customer : c));
      } catch (error) {
        console.error('Error updating customer:', error);
      }
    } else {
      setCustomers(customers.map(c => c.id === customer.id ? customer : c));
    }
  };

  const deleteCustomer = async (id: string) => {
    if (isElectron) {
      try {
        await window.api!.deleteItem('customers', id);
        setCustomers(customers.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    } else {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  // Invoice operations
  const addInvoice = async (invoice: Invoice) => {
    if (isElectron) {
      try {
        await window.api!.addItem('invoices', invoice);
        setInvoices([...invoices, invoice]);
      } catch (error) {
        console.error('Error adding invoice:', error);
      }
    } else {
      setInvoices([...invoices, invoice]);
    }
  };

  const updateInvoice = async (invoice: Invoice) => {
    if (isElectron) {
      try {
        await window.api!.updateItem('invoices', invoice);
        setInvoices(invoices.map(i => i.id === invoice.id ? invoice : i));
      } catch (error) {
        console.error('Error updating invoice:', error);
      }
    } else {
      setInvoices(invoices.map(i => i.id === invoice.id ? invoice : i));
    }
  };

  const deleteInvoice = async (id: string) => {
    if (isElectron) {
      try {
        await window.api!.deleteItem('invoices', id);
        setInvoices(invoices.filter(i => i.id !== id));
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    } else {
      setInvoices(invoices.filter(i => i.id !== id));
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
      } catch (error) {
        console.error('Error exporting data:', error);
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
      } catch (error) {
        console.error('Error importing data:', error);
      }
    } else {
      // Web browser fallback
      if (data.products) setProducts(data.products);
      if (data.customers) setCustomers(data.customers);
      if (data.invoices) setInvoices(data.invoices);
      if (data.currentSeller) setCurrentSeller(data.currentSeller);
    }
  };

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
