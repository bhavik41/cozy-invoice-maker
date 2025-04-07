
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    getItems: (table) => ipcRenderer.invoke('getItems', table),
    getItem: (table, id) => ipcRenderer.invoke('getItem', table, id),
    addItem: (table, item) => ipcRenderer.invoke('addItem', table, item),
    updateItem: (table, item) => ipcRenderer.invoke('updateItem', table, item),
    deleteItem: (table, id) => ipcRenderer.invoke('deleteItem', table, id),
    exportData: () => ipcRenderer.invoke('exportData'),
    importData: (data) => ipcRenderer.invoke('importData', data),
    getSetting: (key) => ipcRenderer.invoke('getSetting', key),
    setSetting: (key, value) => ipcRenderer.invoke('setSetting', key, value),
  }
);
