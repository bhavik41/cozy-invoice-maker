
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import isDev from 'electron-is-dev';
import Database from 'better-sqlite3';
import fs from 'fs';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure user data directory exists
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'invoice-data.db');

// Create database connection
let db;

function createDatabase() {
  // Ensure the directory exists
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  console.log('Creating/opening database at:', dbPath);
  db = new Database(dbPath);
  
  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

// Create the browser window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:8080' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  
  console.log('Loading URL:', startUrl);
  mainWindow.loadURL(startUrl);

  // Add error handling for loading failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', errorCode, errorDescription, validatedURL);
  });

  mainWindow.webContents.on('dom-ready', () => {
    console.log('DOM is ready');
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  } else {
    // Also open DevTools in production to debug
    mainWindow.webContents.openDevTools();
  }
}

// Initialize the app
app.whenReady().then(() => {
  createDatabase();
  createWindow();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  
  // Database operations
  
  // Get all items
  ipcMain.handle('getItems', async (event, table) => {
    try {
      console.log(`Getting all items from ${table}...`);
      const stmt = db.prepare(`SELECT * FROM ${table}`);
      const rows = stmt.all();
      console.log(`Found ${rows.length} items in ${table}`);
      
      const items = rows.map(row => {
        try {
          const parsedData = JSON.parse(row.data);
          return { id: row.id, ...parsedData };
        } catch (error) {
          console.error(`Error parsing data for item ${row.id}:`, error);
          return { id: row.id, error: 'Invalid data format' };
        }
      });
      
      return items;
    } catch (error) {
      console.error(`Error getting items from ${table}:`, error);
      throw error;
    }
  });
  
  // Get single item
  ipcMain.handle('getItem', async (event, table, id) => {
    try {
      console.log(`Getting item ${id} from ${table}...`);
      const stmt = db.prepare(`SELECT * FROM ${table} WHERE id = ?`);
      const row = stmt.get(id);
      
      if (!row) {
        console.log(`Item ${id} not found in ${table}`);
        return null;
      }
      
      try {
        const parsedData = JSON.parse(row.data);
        return { id: row.id, ...parsedData };
      } catch (error) {
        console.error(`Error parsing data for item ${id}:`, error);
        throw new Error(`Invalid data format for item ${id}`);
      }
    } catch (error) {
      console.error(`Error getting item ${id} from ${table}:`, error);
      throw error;
    }
  });
  
  // Add item
  ipcMain.handle('addItem', async (event, table, item) => {
    try {
      console.log(`Adding item to ${table}:`, item);
      const stmt = db.prepare(`INSERT INTO ${table} (id, data) VALUES (?, ?)`);
      const { id, ...rest } = item;
      
      if (!id) {
        throw new Error('Item ID is required');
      }
      
      stmt.run(id, JSON.stringify(rest));
      console.log(`Item ${id} added to ${table}`);
      return item;
    } catch (error) {
      console.error(`Error adding item to ${table}:`, error);
      throw error;
    }
  });
  
  // Update item
  ipcMain.handle('updateItem', async (event, table, item) => {
    try {
      console.log(`Updating item in ${table}:`, item);
      const stmt = db.prepare(`UPDATE ${table} SET data = ? WHERE id = ?`);
      const { id, ...rest } = item;
      
      if (!id) {
        throw new Error('Item ID is required');
      }
      
      const result = stmt.run(JSON.stringify(rest), id);
      
      if (result.changes === 0) {
        console.warn(`No changes made to item ${id} in ${table}`);
      } else {
        console.log(`Item ${id} updated in ${table}`);
      }
      
      return item;
    } catch (error) {
      console.error(`Error updating item in ${table}:`, error);
      throw error;
    }
  });
  
  // Delete item
  ipcMain.handle('deleteItem', async (event, table, id) => {
    try {
      console.log(`Deleting item ${id} from ${table}...`);
      const stmt = db.prepare(`DELETE FROM ${table} WHERE id = ?`);
      const result = stmt.run(id);
      
      if (result.changes === 0) {
        console.warn(`Item ${id} not found in ${table}, nothing deleted`);
      } else {
        console.log(`Item ${id} deleted from ${table}`);
      }
      
      return id;
    } catch (error) {
      console.error(`Error deleting item ${id} from ${table}:`, error);
      throw error;
    }
  });
  
  // Export data
  ipcMain.handle('exportData', async () => {
    try {
      console.log('Exporting all data...');
      const products = db.prepare('SELECT * FROM products').all();
      const customers = db.prepare('SELECT * FROM customers').all();
      const invoices = db.prepare('SELECT * FROM invoices').all();
      const settings = db.prepare('SELECT * FROM settings').all();
      
      const exportData = {
        products: products.map(row => ({ id: row.id, ...JSON.parse(row.data) })),
        customers: customers.map(row => ({ id: row.id, ...JSON.parse(row.data) })),
        invoices: invoices.map(row => ({ id: row.id, ...JSON.parse(row.data) })),
        settings: settings.reduce((acc, row) => {
          try {
            acc[row.key] = JSON.parse(row.value);
          } catch (error) {
            console.error(`Error parsing setting ${row.key}:`, error);
            acc[row.key] = null;
          }
          return acc;
        }, {})
      };
      
      console.log('Data export complete');
      return exportData;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  });
  
  // Import data
  ipcMain.handle('importData', async (event, data) => {
    console.log('Importing data...');
    db.exec('BEGIN TRANSACTION');
    
    try {
      // Clear existing data
      db.exec('DELETE FROM products');
      db.exec('DELETE FROM customers');
      db.exec('DELETE FROM invoices');
      db.exec('DELETE FROM settings');
      
      // Insert new data
      const insertProduct = db.prepare('INSERT INTO products (id, data) VALUES (?, ?)');
      if (data.products && Array.isArray(data.products)) {
        data.products.forEach(product => {
          const { id, ...rest } = product;
          insertProduct.run(id, JSON.stringify(rest));
        });
      }
      
      const insertCustomer = db.prepare('INSERT INTO customers (id, data) VALUES (?, ?)');
      if (data.customers && Array.isArray(data.customers)) {
        data.customers.forEach(customer => {
          const { id, ...rest } = customer;
          insertCustomer.run(id, JSON.stringify(rest));
        });
      }
      
      const insertInvoice = db.prepare('INSERT INTO invoices (id, data) VALUES (?, ?)');
      if (data.invoices && Array.isArray(data.invoices)) {
        data.invoices.forEach(invoice => {
          const { id, ...rest } = invoice;
          insertInvoice.run(id, JSON.stringify(rest));
        });
      }
      
      const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
      if (data.currentSeller) {
        insertSetting.run('currentSeller', JSON.stringify(data.currentSeller));
      }
      
      db.exec('COMMIT');
      console.log('Data import complete');
      return { success: true };
    } catch (error) {
      db.exec('ROLLBACK');
      console.error('Error importing data:', error);
      throw error;
    }
  });
  
  // Get setting
  ipcMain.handle('getSetting', async (event, key) => {
    try {
      console.log(`Getting setting: ${key}`);
      const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
      const row = stmt.get(key);
      
      if (!row) {
        console.log(`Setting ${key} not found`);
        return null;
      }
      
      try {
        return JSON.parse(row.value);
      } catch (error) {
        console.error(`Error parsing setting ${key}:`, error);
        return null;
      }
    } catch (error) {
      console.error(`Error getting setting ${key}:`, error);
      throw error;
    }
  });
  
  // Set setting
  ipcMain.handle('setSetting', async (event, key, value) => {
    try {
      console.log(`Setting ${key}:`, value);
      const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
      stmt.run(key, JSON.stringify(value));
      console.log(`Setting ${key} saved`);
      return value;
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      throw error;
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Close database connection when app is about to quit
app.on('will-quit', () => {
  if (db) {
    console.log('Closing database connection');
    db.close();
  }
});
