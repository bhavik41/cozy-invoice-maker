
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Product, Customer, Invoice, InvoiceFilter, ProductFilter, CustomerFilter } from '@/types';

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

  // Load data from localStorage on mount
  useEffect(() => {
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
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    if (currentSeller) {
      localStorage.setItem('currentSeller', JSON.stringify(currentSeller));
    }
  }, [currentSeller]);

  const addProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const updateProduct = (product: Product) => {
    setProducts(products.map(p => p.id === product.id ? product : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const addCustomer = (customer: Customer) => {
    setCustomers([...customers, customer]);
  };

  const updateCustomer = (customer: Customer) => {
    setCustomers(customers.map(c => c.id === customer.id ? customer : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  const addInvoice = (invoice: Invoice) => {
    setInvoices([...invoices, invoice]);
  };

  const updateInvoice = (invoice: Invoice) => {
    setInvoices(invoices.map(i => i.id === invoice.id ? invoice : i));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(invoices.filter(i => i.id !== id));
  };

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

  const exportData = () => {
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
  };

  const importData = (data: any) => {
    if (data.products) setProducts(data.products);
    if (data.customers) setCustomers(data.customers);
    if (data.invoices) setInvoices(data.invoices);
    if (data.currentSeller) setCurrentSeller(data.currentSeller);
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
