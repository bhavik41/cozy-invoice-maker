
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const Database = require('better-sqlite3');
const fs = require('fs');

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
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load the app
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:8080' // Dev server URL
      : `file://${path.join(__dirname, '../dist/index.html')}` // Production build
  );

  // Open DevTools in development
  if (isDev) {
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
  ipcMain.handle('getItems', (event, table) => {
    const stmt = db.prepare(`SELECT * FROM ${table}`);
    const rows = stmt.all();
    return rows.map(row => ({ id: row.id, ...JSON.parse(row.data) }));
  });
  
  // Get single item
  ipcMain.handle('getItem', (event, table, id) => {
    const stmt = db.prepare(`SELECT * FROM ${table} WHERE id = ?`);
    const row = stmt.get(id);
    return row ? { id: row.id, ...JSON.parse(row.data) } : null;
  });
  
  // Add item
  ipcMain.handle('addItem', (event, table, item) => {
    const stmt = db.prepare(`INSERT INTO ${table} (id, data) VALUES (?, ?)`);
    const { id, ...rest } = item;
    stmt.run(id, JSON.stringify(rest));
    return item;
  });
  
  // Update item
  ipcMain.handle('updateItem', (event, table, item) => {
    const stmt = db.prepare(`UPDATE ${table} SET data = ? WHERE id = ?`);
    const { id, ...rest } = item;
    stmt.run(JSON.stringify(rest), id);
    return item;
  });
  
  // Delete item
  ipcMain.handle('deleteItem', (event, table, id) => {
    const stmt = db.prepare(`DELETE FROM ${table} WHERE id = ?`);
    stmt.run(id);
    return id;
  });
  
  // Export data
  ipcMain.handle('exportData', async () => {
    const products = db.prepare('SELECT * FROM products').all();
    const customers = db.prepare('SELECT * FROM customers').all();
    const invoices = db.prepare('SELECT * FROM invoices').all();
    const settings = db.prepare('SELECT * FROM settings').all();
    
    return {
      products: products.map(row => ({ id: row.id, ...JSON.parse(row.data) })),
      customers: customers.map(row => ({ id: row.id, ...JSON.parse(row.data) })),
      invoices: invoices.map(row => ({ id: row.id, ...JSON.parse(row.data) })),
      settings: settings.reduce((acc, row) => {
        acc[row.key] = JSON.parse(row.value);
        return acc;
      }, {})
    };
  });
  
  // Import data
  ipcMain.handle('importData', async (event, data) => {
    db.exec('BEGIN TRANSACTION');
    
    try {
      // Clear existing data
      db.exec('DELETE FROM products');
      db.exec('DELETE FROM customers');
      db.exec('DELETE FROM invoices');
      db.exec('DELETE FROM settings');
      
      // Insert new data
      const insertProduct = db.prepare('INSERT INTO products (id, data) VALUES (?, ?)');
      data.products.forEach(product => {
        const { id, ...rest } = product;
        insertProduct.run(id, JSON.stringify(rest));
      });
      
      const insertCustomer = db.prepare('INSERT INTO customers (id, data) VALUES (?, ?)');
      data.customers.forEach(customer => {
        const { id, ...rest } = customer;
        insertCustomer.run(id, JSON.stringify(rest));
      });
      
      const insertInvoice = db.prepare('INSERT INTO invoices (id, data) VALUES (?, ?)');
      data.invoices.forEach(invoice => {
        const { id, ...rest } = invoice;
        insertInvoice.run(id, JSON.stringify(rest));
      });
      
      const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
      if (data.currentSeller) {
        insertSetting.run('currentSeller', JSON.stringify(data.currentSeller));
      }
      
      db.exec('COMMIT');
      return { success: true };
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  });
  
  // Get setting
  ipcMain.handle('getSetting', (event, key) => {
    const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
    const row = stmt.get(key);
    return row ? JSON.parse(row.value) : null;
  });
  
  // Set setting
  ipcMain.handle('setSetting', (event, key, value) => {
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    stmt.run(key, JSON.stringify(value));
    return value;
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Close database connection when app is about to quit
app.on('will-quit', () => {
  if (db) {
    db.close();
  }
});
