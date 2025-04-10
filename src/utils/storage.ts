
// Utility for interacting with storage (localStorage or Electron API)

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
export const isElectron = window.api !== undefined;

// Generic getItems function that works with both localStorage and Electron
export const getItems = async <T>(table: string): Promise<T[]> => {
  if (isElectron) {
    try {
      const items = await window.api!.getItems(table);
      return items as T[];
    } catch (error) {
      console.error(`Error loading ${table} from Electron:`, error);
      return [];
    }
  } else {
    try {
      const items = localStorage.getItem(table);
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error(`Error parsing ${table} from localStorage:`, error);
      return [];
    }
  }
};

// Generic saveItems function
export const saveItems = async <T>(table: string, items: T[]): Promise<void> => {
  if (!isElectron) {
    localStorage.setItem(table, JSON.stringify(items));
  }
  // In Electron mode, we don't need to save all items at once
};

// Generic addItem function
export const addItem = async <T>(table: string, item: T): Promise<T> => {
  if (isElectron) {
    try {
      return await window.api!.addItem(table, item) as T;
    } catch (error) {
      console.error(`Error adding ${table} item in Electron:`, error);
      throw error;
    }
  } else {
    // For localStorage, we'll get all items, add the new one, and save back
    const items = await getItems<T>(table);
    const newItems = [...items, item];
    await saveItems(table, newItems);
    return item;
  }
};

// Generic updateItem function
export const updateItem = async <T extends { id: string }>(table: string, item: T): Promise<T> => {
  if (isElectron) {
    try {
      return await window.api!.updateItem(table, item) as T;
    } catch (error) {
      console.error(`Error updating ${table} item in Electron:`, error);
      throw error;
    }
  } else {
    // For localStorage, we'll get all items, update the matching one, and save back
    const items = await getItems<T>(table);
    const newItems = items.map(i => (i as any).id === item.id ? item : i);
    await saveItems(table, newItems);
    return item;
  }
};

// Generic deleteItem function
export const deleteItem = async <T extends { id: string }>(table: string, id: string): Promise<string> => {
  if (isElectron) {
    try {
      return await window.api!.deleteItem(table, id);
    } catch (error) {
      console.error(`Error deleting ${table} item in Electron:`, error);
      throw error;
    }
  } else {
    // For localStorage, we'll get all items, remove the matching one, and save back
    const items = await getItems<T>(table);
    const newItems = items.filter(i => (i as any).id !== id);
    await saveItems(table, newItems);
    return id;
  }
};

// Get a single setting
export const getSetting = async <T>(key: string): Promise<T | null> => {
  if (isElectron) {
    try {
      return await window.api!.getSetting(key) as T;
    } catch (error) {
      console.error(`Error getting setting ${key} from Electron:`, error);
      return null;
    }
  } else {
    try {
      const setting = localStorage.getItem(key);
      return setting ? JSON.parse(setting) : null;
    } catch (error) {
      console.error(`Error parsing setting ${key} from localStorage:`, error);
      return null;
    }
  }
};

// Save a single setting
export const saveSetting = async <T>(key: string, value: T): Promise<void> => {
  if (isElectron) {
    try {
      await window.api!.setSetting(key, value);
    } catch (error) {
      console.error(`Error saving setting ${key} to Electron:`, error);
    }
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Functions for export/import
export const exportAppData = async (): Promise<any> => {
  if (isElectron) {
    try {
      return await window.api!.exportData();
    } catch (error) {
      console.error('Error exporting data from Electron:', error);
      throw error;
    }
  } else {
    // For localStorage, we'll return a combination of the tables
    const products = await getItems('products');
    const customers = await getItems('customers');
    const invoices = await getItems('invoices');
    const currentSeller = await getSetting('currentSeller');
    
    return {
      products,
      customers,
      invoices,
      currentSeller
    };
  }
};

export const importAppData = async (data: any): Promise<void> => {
  if (isElectron) {
    try {
      await window.api!.importData(data);
    } catch (error) {
      console.error('Error importing data in Electron:', error);
      throw error;
    }
  } else {
    // For localStorage, we'll save each table
    if (data.products) {
      await saveItems('products', data.products);
    }
    if (data.customers) {
      await saveItems('customers', data.customers);
    }
    if (data.invoices) {
      await saveItems('invoices', data.invoices);
    }
    if (data.currentSeller) {
      await saveSetting('currentSeller', data.currentSeller);
    }
  }
};
