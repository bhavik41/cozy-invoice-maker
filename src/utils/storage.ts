
// Utility for interacting with localStorage storage

// Generic getItems function for localStorage
export const getItems = async <T>(table: string): Promise<T[]> => {
  try {
    const items = localStorage.getItem(table);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error(`Error parsing ${table} from localStorage:`, error);
    return [];
  }
};

// Generic saveItems function
export const saveItems = async <T>(table: string, items: T[]): Promise<void> => {
  localStorage.setItem(table, JSON.stringify(items));
};

// Generic addItem function
export const addItem = async <T>(table: string, item: T): Promise<T> => {
  const items = await getItems<T>(table);
  const newItems = [...items, item];
  await saveItems(table, newItems);
  return item;
};

// Generic updateItem function
export const updateItem = async <T extends { id: string }>(table: string, item: T): Promise<T> => {
  const items = await getItems<T>(table);
  const newItems = items.map(i => (i as any).id === item.id ? item : i);
  await saveItems(table, newItems);
  return item;
};

// Generic deleteItem function
export const deleteItem = async <T extends { id: string }>(table: string, id: string): Promise<string> => {
  const items = await getItems<T>(table);
  const newItems = items.filter(i => (i as any).id !== id);
  await saveItems(table, newItems);
  return id;
};

// Get a single setting
export const getSetting = async <T>(key: string): Promise<T | null> => {
  try {
    const setting = localStorage.getItem(key);
    return setting ? JSON.parse(setting) : null;
  } catch (error) {
    console.error(`Error parsing setting ${key} from localStorage:`, error);
    return null;
  }
};

// Save a single setting
export const saveSetting = async <T>(key: string, value: T): Promise<void> => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Functions for export/import
export const exportAppData = async (): Promise<any> => {
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
};

export const importAppData = async (data: any): Promise<void> => {
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
};
