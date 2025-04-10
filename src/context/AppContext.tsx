
import React from 'react';
import { toast } from 'sonner';
import { BaseDataProvider } from './BaseDataContext';
import { ProductProvider, useProducts } from './ProductContext';
import { CustomerProvider, useCustomers } from './CustomerContext';
import { InvoiceProvider, useInvoices } from './InvoiceContext';
import { useBaseData } from './BaseDataContext';
import * as storage from '@/utils/storage';

// Main AppProvider that combines all the individual providers
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BaseDataProvider
      exportDataFn={storage.exportAppData}
      importDataFn={storage.importAppData}
    >
      <ProductProvider>
        <CustomerProvider>
          <InvoiceProvider>
            {children}
          </InvoiceProvider>
        </CustomerProvider>
      </ProductProvider>
    </BaseDataProvider>
  );
};

// Export a combined hook for backwards compatibility
export const useAppContext = () => {
  // Get the contexts directly using the imported hooks
  const productContext = useProducts();
  const customerContext = useCustomers();
  const invoiceContext = useInvoices();
  const baseContext = useBaseData();
  
  // Combine all contexts into one interface for backward compatibility
  return {
    // Products
    products: productContext.products,
    addProduct: productContext.addProduct,
    updateProduct: productContext.updateProduct,
    deleteProduct: productContext.deleteProduct,
    getProduct: productContext.getProduct,
    filterProducts: productContext.filterProducts,
    
    // Customers
    customers: customerContext.customers,
    addCustomer: customerContext.addCustomer,
    updateCustomer: customerContext.updateCustomer,
    deleteCustomer: customerContext.deleteCustomer,
    getCustomer: customerContext.getCustomer,
    filterCustomers: customerContext.filterCustomers,
    currentSeller: customerContext.currentSeller,
    setCurrentSeller: customerContext.setCurrentSeller,
    
    // Invoices
    invoices: invoiceContext.invoices,
    addInvoice: invoiceContext.addInvoice,
    updateInvoice: invoiceContext.updateInvoice,
    deleteInvoice: invoiceContext.deleteInvoice,
    getInvoice: invoiceContext.getInvoice,
    filterInvoices: invoiceContext.filterInvoices,
    getNextInvoiceNumber: invoiceContext.getNextInvoiceNumber,
    
    // Data operations
    exportData: baseContext.exportData,
    importData: baseContext.importData
  };
};
