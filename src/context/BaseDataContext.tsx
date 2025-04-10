
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// Base context for company data filtering
export interface BaseDataContextProps {
  isLoading: boolean;
  filterByCompany: <T extends Record<string, any>>(items: T[]) => T[];
  addCompanyId: <T>(item: T) => T & { companyId: string };
  exportData: () => Promise<void>;
  importData: (data: any) => Promise<void>;
}

const BaseDataContext = createContext<BaseDataContextProps | undefined>(undefined);

export const BaseDataProvider: React.FC<{ 
  children: React.ReactNode,
  exportDataFn: () => Promise<any>,
  importDataFn: (data: any) => Promise<void>
}> = ({ children, exportDataFn, importDataFn }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Filter items based on user's companyId
  const filterByCompany = <T extends Record<string, any>>(items: T[]): T[] => {
    if (!user) return [];
    
    return items.filter(item => {
      // For demo user, return all items
      if (user.email === 'demo@example.com') return true;
      
      // For other users, filter by companyId
      const companyId = item.companyId || 'company-1';
      return companyId === user.companyId;
    });
  };

  // Add company ID to new items
  const addCompanyId = <T,>(item: T): T & { companyId: string } => {
    return {
      ...item,
      companyId: user?.companyId || 'company-1'
    } as T & { companyId: string };
  };

  // Export data function
  const exportData = async (): Promise<void> => {
    try {
      // Get data from storage
      const data = await exportDataFn();
      
      // Filter data to only include the current user's company data
      const filteredData = {
        products: filterByCompany(data.products || []),
        customers: filterByCompany(data.customers || []),
        invoices: filterByCompany(data.invoices || []),
        currentSeller: data.currentSeller
      };
      
      // Save to file
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
  };

  // Import data function
  const importData = async (data: any): Promise<void> => {
    try {
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
      
      // Import the data
      await importDataFn(data);
      toast.success('Data imported successfully');
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Failed to import data');
    }
  };

  useEffect(() => {
    // Just to track initial loading
    setIsLoading(false);
  }, []);

  return (
    <BaseDataContext.Provider value={{
      isLoading,
      filterByCompany,
      addCompanyId,
      exportData,
      importData
    }}>
      {children}
    </BaseDataContext.Provider>
  );
};

export const useBaseData = () => {
  const context = useContext(BaseDataContext);
  if (context === undefined) {
    throw new Error('useBaseData must be used within a BaseDataProvider');
  }
  return context;
};
