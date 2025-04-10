import React, { createContext, useState, useContext, useEffect } from 'react';
import { Product, Customer, Invoice, InvoiceFilter, ProductFilter, CustomerFilter } from '@/types';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [currentSeller, setCurrentSeller] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get the authenticated user
  const { user } = useAuth();
  
  // Filter data based on user's companyId
  const products = React.useMemo(() => {
    if (!user) return [];
    
    // In a real app, products would have a companyId field
    // For this demo, we'll filter based on some example structure
    return allProducts.filter(product => {
      // For demo user, return all products
      if (user.email === 'demo@example.com') return true;
      
      // For demo, we'll assume products have a metadata field with companyId
      // In a real app, you would have a proper schema with companyId
      const companyId = (product as any).companyId || 'company-1';
      return companyId === user.companyId;
    });
  }, [user, allProducts]);
  
  const customers = React.useMemo(() => {
    if (!user) return [];
    
    return allCustomers.filter(customer => {
      // For demo user, return all customers
      if (user.email === 'demo@example.com') return true;
      
      // For demo, we'll use a similar approach to products
      const companyId = (customer as any).companyId || 'company-1';
      return companyId === user.companyId;
    });
  }, [user, allCustomers]);
  
  const invoices = React.useMemo(() => {
    if (!user) return [];
    
    return allInvoices.filter(invoice => {
      // For demo user, return all invoices
      if (user.email === 'demo@example.com') return true;
      
      // For demo, use the same approach
      const companyId = (invoice as any).companyId || 'company-1';
      return companyId === user.companyId;
    });
  }, [user, allInvoices]);

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
              setAllProducts(loadedProducts);
            }

            const loadedCustomers = await window.api!.getItems('customers');
            console.log('Loaded customers:', loadedCustomers);
            if (loadedCustomers && Array.isArray(loadedCustomers)) {
              setAllCustomers(loadedCustomers);
            }

            const loadedInvoices = await window.api!.getItems('invoices');
            console.log('Loaded invoices:', loadedInvoices);
            if (loadedInvoices && Array.isArray(loadedInvoices)) {
              setAllInvoices(loadedInvoices);
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
              setAllProducts(JSON.parse(loadedProducts));
            } catch (error) {
              console.error('Error parsing products:', error);
            }
          }

          const loadedCustomers = localStorage.getItem('customers');
          if (loadedCustomers) {
            try {
              setAllCustomers(JSON.parse(loadedCustomers));
            } catch (error) {
              console.error('Error parsing customers:', error);
            }
          }

          const loadedInvoices = localStorage.getItem('invoices');
          if (loadedInvoices) {
            try {
              setAllInvoices(JSON.parse(loadedInvoices));
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
  useEffect(() => {
    if (isElectron) {
      // No need to save on every change in Electron, as we'll save directly on CRUD operations
    } else {
      // Fallback to localStorage for web browser development
      localStorage.setItem('products', JSON.stringify(allProducts));
    }
  }, [allProducts]);

  useEffect(() => {
    if (!isElectron) {
      localStorage.setItem('customers', JSON.stringify(allCustomers));
    }
  }, [allCustomers]);

  useEffect(() => {
    if (!isElectron) {
      localStorage.setItem('invoices', JSON.stringify(allInvoices));
    }
  }, [allInvoices]);

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

  // When adding new items, include the user's companyId
  const addProduct = async (product: Product) => {
    // Add company ID to the product
    const productWithCompany = {
      ...product,
      companyId: user?.companyId || 'company-1'
    };
    
    if (isElectron) {
      try {
        console.log('Adding product:', productWithCompany);
        await window.api!.addItem('products', productWithCompany);
        setAllProducts(prevProducts => [...prevProducts, productWithCompany as Product]);
        toast.success('Product added successfully');
      } catch (error) {
        console.error('Error adding product:', error);
        toast.error('Failed to add product');
      }
    } else {
      setAllProducts(prevProducts => [...prevProducts, productWithCompany as Product]);
      toast.success('Product added successfully');
    }
  };

  // Update operations now check if user has access to the item
  const updateProduct = async (product: Product) => {
    // Verify user can access this product
    const existingProduct = allProducts.find(p => p.id === product.id);
    const companyId = (existingProduct as any)?.companyId || 'company-1';
    
    if (user && user.email !== 'demo@example.com' && companyId !== user.companyId) {
      toast.error('You do not have permission to modify this product');
      return;
    }
    
    // Maintain the companyId when updating
    const updatedProduct = {
      ...product,
      companyId: companyId
    };
    
    if (isElectron) {
      try {
        await window.api!.updateItem('products', updatedProduct);
        setAllProducts(allProducts.map(p => p.id === product.id ? updatedProduct as Product : p));
        toast.success('Product updated successfully');
      } catch (error) {
        console.error('Error updating product:', error);
        toast.error('Failed to update product');
      }
    } else {
      setAllProducts(allProducts.map(p => p.id === product.id ? updatedProduct as Product : p));
      toast.success('Product updated successfully');
    }
  };

  // Delete operations also check for permission
  const deleteProduct = async (id: string) => {
    // Verify user can access this product
    const existingProduct = allProducts.find(p => p.id === id);
    const companyId = (existingProduct as any)?.companyId || 'company-1';
    
    if (user && user.email !== 'demo@example.com' && companyId !== user.companyId) {
      toast.error('You do not have permission to delete this product');
      return;
    }
    
    if (isElectron) {
      try {
        await window.api!.deleteItem('products', id);
        setAllProducts(allProducts.filter(p => p.id !== id));
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    } else {
      setAllProducts(allProducts.filter(p => p.id !== id));
      toast.success('Product deleted successfully');
    }
  };

  // Customer operations - similar pattern with company filtering
  const addCustomer = async (customer: Customer) => {
    const customerWithCompany = {
      ...customer,
      companyId: user?.companyId || 'company-1'
    };
    
    if (isElectron) {
      try {
        console.log('Adding customer:', customerWithCompany);
        await window.api!.addItem('customers', customerWithCompany);
        setAllCustomers(prevCustomers => [...prevCustomers, customerWithCompany as Customer]);
        toast.success('Customer added successfully');
      } catch (error) {
        console.error('Error adding customer:', error);
        toast.error('Failed to add customer');
      }
    } else {
      setAllCustomers(prevCustomers => [...prevCustomers, customerWithCompany as Customer]);
      toast.success('Customer added successfully');
    }
  };

  const updateCustomer = async (customer: Customer) => {
    const existingCustomer = allCustomers.find(c => c.id === customer.id);
    const companyId = (existingCustomer as any)?.companyId || 'company-1';
    
    if (user && user.email !== 'demo@example.com' && companyId !== user.companyId) {
      toast.error('You do not have permission to modify this customer');
      return;
    }
    
    const updatedCustomer = {
      ...customer,
      companyId: companyId
    };
    
    if (isElectron) {
      try {
        await window.api!.updateItem('customers', updatedCustomer);
        setAllCustomers(allCustomers.map(c => c.id === customer.id ? updatedCustomer as Customer : c));
        toast.success('Customer updated successfully');
      } catch (error) {
        console.error('Error updating customer:', error);
        toast.error('Failed to update customer');
      }
    } else {
      setAllCustomers(allCustomers.map(c => c.id === customer.id ? updatedCustomer as Customer : c));
      toast.success('Customer updated successfully');
    }
  };

  const deleteCustomer = async (id: string) => {
    const existingCustomer = allCustomers.find(c => c.id === id);
    const companyId = (existingCustomer as any)?.companyId || 'company-1';
    
    if (user && user.email !== 'demo@example.com' && companyId !== user.companyId) {
      toast.error('You do not have permission to delete this customer');
      return;
    }
    
    if (isElectron) {
      try {
        await window.api!.deleteItem('customers', id);
        setAllCustomers(allCustomers.filter(c => c.id !== id));
        toast.success('Customer deleted successfully');
      } catch (error) {
        console.error('Error deleting customer:', error);
        toast.error('Failed to delete customer');
      }
    } else {
      setAllCustomers(allCustomers.filter(c => c.id !== id));
      toast.success('Customer deleted successfully');
    }
  };

  // Invoice operations - similar pattern
  const addInvoice = async (invoice: Invoice) => {
    const invoiceWithCompany = {
      ...invoice,
      companyId: user?.companyId || 'company-1'
    };
    
    if (isElectron) {
      try {
        console.log('Adding invoice:', invoiceWithCompany);
        await window.api!.addItem('invoices', invoiceWithCompany);
        setAllInvoices(prevInvoices => [...prevInvoices, invoiceWithCompany as Invoice]);
        toast.success('Invoice created successfully');
      } catch (error) {
        console.error('Error adding invoice:', error);
        toast.error('Failed to create invoice');
      }
    } else {
      setAllInvoices(prevInvoices => [...prevInvoices, invoiceWithCompany as Invoice]);
      toast.success('Invoice created successfully');
    }
  };

  const updateInvoice = async (invoice: Invoice) => {
    const existingInvoice = allInvoices.find(i => i.id === invoice.id);
    const companyId = (existingInvoice as any)?.companyId || 'company-1';
    
    if (user && user.email !== 'demo@example.com' && companyId !== user.companyId) {
      toast.error('You do not have permission to modify this invoice');
      return;
    }
    
    const updatedInvoice = {
      ...invoice,
      companyId: companyId
    };
    
    if (isElectron) {
      try {
        await window.api!.updateItem('invoices', updatedInvoice);
        setAllInvoices(allInvoices.map(i => i.id === invoice.id ? updatedInvoice as Invoice : i));
        toast.success('Invoice updated successfully');
      } catch (error) {
        console.error('Error updating invoice:', error);
        toast.error('Failed to update invoice');
      }
    } else {
      setAllInvoices(allInvoices.map(i => i.id === invoice.id ? updatedInvoice as Invoice : i));
      toast.success('Invoice updated successfully');
    }
  };

  const deleteInvoice = async (id: string) => {
    const existingInvoice = allInvoices.find(i => i.id === id);
    const companyId = (existingInvoice as any)?.companyId || 'company-1';
    
    if (user && user.email !== 'demo@example.com' && companyId !== user.companyId) {
      toast.error('You do not have permission to delete this invoice');
      return;
    }
    
    if (isElectron) {
      try {
        await window.api!.deleteItem('invoices', id);
        setAllInvoices(allInvoices.filter(i => i.id !== id));
        toast.success('Invoice deleted successfully');
      } catch (error) {
        console.error('Error deleting invoice:', error);
        toast.error('Failed to delete invoice');
      }
    } else {
      setAllInvoices(allInvoices.filter(i => i.id !== id));
      toast.success('Invoice deleted successfully');
    }
  };

  // Filter operations (these run client-side regardless of storage method)
  // These will work on the already-filtered collections
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

  // Getter functions now also verify company access
  const getProduct = (id: string): Product | undefined => {
    // First check filtered products (which respect company isolation)
    const product = products.find(p => p.id === id);
    if (product) return product;
    
    // If not found and user is admin, try from all products
    if (user?.role === 'admin') {
      return allProducts.find(p => p.id === id);
    }
    
    return undefined;
  };

  const getCustomer = (id: string): Customer | undefined => {
    const customer = customers.find(c => c.id === id);
    if (customer) return customer;
    
    if (user?.role === 'admin') {
      return allCustomers.find(c => c.id === id);
    }
    
    return undefined;
  };

  const getInvoice = (id: string): Invoice | undefined => {
    const invoice = invoices.find(i => i.id === id);
    if (invoice) return invoice;
    
    if (user?.role === 'admin') {
      return allInvoices.find(i => i.id === id);
    }
    
    return undefined;
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

  // Export/Import functions now filter by company
  const exportData = async () => {
    // Filter data to only include the current user's company data
    const dataToExport = {
      products: products,
      customers: customers,
      invoices: invoices,
      currentSeller
    };
    
    if (isElectron) {
      try {
        // In a real app, you would filter server-side
        const data = await window.api!.exportData();
        
        // Filter data to only include current company
        const filteredData = {
          products: data.products.filter((p: any) => {
            const companyId = p.companyId || 'company-1';
            return user?.email === 'demo@example.com' || companyId === user?.companyId;
          }),
          customers: data.customers.filter((c: any) => {
            const companyId = c.companyId || 'company-1';
            return user?.email === 'demo@example.com' || companyId === user?.companyId;
          }),
          invoices: data.invoices.filter((i: any) => {
            const companyId = i.companyId || 'company-1';
            return user?.email === 'demo@example.com' || companyId === user?.companyId;
          }),
          currentSeller: data.currentSeller
        };
        
        // Save the data to a file using Electron's dialog
        const dataStr = JSON.stringify(filteredData);
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
      const dataStr = JSON.stringify(dataToExport);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `invoice-data-backup-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Data exported successfully');
    }
  };

  // Import should respect company boundaries
  const importData = async (data: any) => {
    // Add companyId to all items if it doesn't exist
    const companyId = user?.companyId || 'company-1';
    
    if (data.products) {
      data.products = data.products.map((p: any) => ({
        ...p,
        companyId: p.companyId || companyId
      }));
    }
    
    if (data.customers) {
      data.customers = data.customers.map((c: any) => ({
        ...c,
        companyId: c.companyId || companyId
      }));
    }
    
    if (data.invoices) {
      data.invoices = data.invoices.map((i: any) => ({
        ...i,
        companyId: i.companyId || companyId
      }));
    }
    
    if (isElectron) {
      try {
        await window.api!.importData(data);
        
        // Reload data from database
        const loadedProducts = await window.api!.getItems('products');
        if (loadedProducts) setAllProducts(loadedProducts);
        
        const loadedCustomers = await window.api!.getItems('customers');
        if (loadedCustomers) setAllCustomers(loadedCustomers);
        
        const loadedInvoices = await window.api!.getItems('invoices');
        if (loadedInvoices) setAllInvoices(loadedInvoices);
        
        const loadedSeller = await window.api!.getSetting('currentSeller');
        if (loadedSeller) setCurrentSeller(loadedSeller);
        
        toast.success('Data imported successfully');
      } catch (error) {
        console.error('Error importing data:', error);
        toast.error('Failed to import data');
      }
    } else {
      // Web browser fallback - overwrite only the current company's data
      
      // For existing products, keep those from other companies
      const otherCompanyProducts = allProducts.filter((p: any) => {
        const pCompanyId = p.companyId || 'company-1';
        return user?.email !== 'demo@example.com' && pCompanyId !== user?.companyId;
      });
      
      if (data.products) {
        setAllProducts([...otherCompanyProducts, ...data.products]);
      }
      
      // Same for customers
      const otherCompanyCustomers = allCustomers.filter((c: any) => {
        const cCompanyId = c.companyId || 'company-1';
        return user?.email !== 'demo@example.com' && cCompanyId !== user?.companyId;
      });
      
      if (data.customers) {
        setAllCustomers([...otherCompanyCustomers, ...data.customers]);
      }
      
      // Same for invoices
      const otherCompanyInvoices = allInvoices.filter((i: any) => {
        const iCompanyId = i.companyId || 'company-1';
        return user?.email !== 'demo@example.com' && iCompanyId !== user?.companyId;
      });
      
      if (data.invoices) {
        setAllInvoices([...otherCompanyInvoices, ...data.invoices]);
      }
      
      if (data.currentSeller) {
        setCurrentSeller(data.currentSeller);
      }
      
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
