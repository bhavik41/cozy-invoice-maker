
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, Database, RefreshCw, HardDrive, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { handleFileUpload } from '@/utils/helpers';

// Check if we're running in Electron
const isElectron = window.api !== undefined;

const Backup = () => {
  const { exportData, importData, products, customers, invoices } = useAppContext();

  const handleBackup = () => {
    exportData();
    toast.success('Backup file generated successfully');
  };

  const handleRestore = () => {
    handleFileUpload((data) => {
      try {
        importData(data);
        toast.success('Data restored successfully');
      } catch (error) {
        console.error('Error importing data:', error);
        toast.error('Failed to restore data. Invalid backup file.');
      }
    });
  };

  const totalDataSize = JSON.stringify({ products, customers, invoices }).length;
  const formatDataSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">Backup & Restore</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6 flex flex-col">
          <div className="p-3 rounded-full bg-blue-100 self-start mb-3">
            <Database className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium mb-1">Total Data</h3>
          <p className="text-sm text-gray-500 mb-2">
            Size: {formatDataSize(totalDataSize)}
          </p>
          <div className="mt-auto pt-3 text-sm">
            <ul className="space-y-1 text-gray-500">
              <li>{products.length} Products</li>
              <li>{customers.length} Customers</li>
              <li>{invoices.length} Invoices</li>
            </ul>
          </div>
        </Card>

        <Card className="p-6 flex flex-col">
          <div className="p-3 rounded-full bg-green-100 self-start mb-3">
            <RefreshCw className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium mb-1">{isElectron ? 'SQLite Database' : 'Auto Backup'}</h3>
          <p className="text-sm text-gray-500 mb-2">
            {isElectron 
              ? 'Data is stored in a local SQLite database on your computer.' 
              : 'Data is automatically backed up to your device as you make changes.'}
          </p>
          <div className="mt-auto pt-3">
            <p className="text-xs text-gray-400">
              Last auto-save: {new Date().toLocaleString()}
            </p>
          </div>
        </Card>

        <Card className="p-6 flex flex-col">
          <div className="p-3 rounded-full bg-purple-100 self-start mb-3">
            <Shield className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium mb-1">Data Security</h3>
          <p className="text-sm text-gray-500 mb-2">
            {isElectron 
              ? 'All data is stored locally in a SQLite database on your computer. Make regular backups to prevent data loss.' 
              : 'All data is stored locally on your device. Make regular backups to prevent data loss.'}
          </p>
          <div className="mt-auto pt-3">
            <p className="text-xs text-gray-400">
              {isElectron 
                ? 'Desktop app with local database. No data sent to external servers.' 
                : 'Offline operation. No data sent to external servers.'}
            </p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Backup & Restore Options</h3>

        <div className="space-y-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-blue-50 mr-4">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Backup Data</h4>
                <p className="text-sm text-gray-500 mb-3">
                  Export all your data to a JSON file. This includes your products, customers, and invoices.
                </p>
                <Button onClick={handleBackup}>
                  <Download className="mr-2 h-4 w-4" />
                  Create Backup
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-amber-50 mr-4">
                <Upload className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Restore Data</h4>
                <p className="text-sm text-gray-500 mb-3">
                  Import data from a previous backup file. This will replace your current data.
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleRestore}>
                    <Upload className="mr-2 h-4 w-4" />
                    Restore from Backup
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-gray-100 mr-4">
                <HardDrive className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">{isElectron ? 'SQLite Storage' : 'Local Storage'}</h4>
                <p className="text-sm text-gray-500 mb-3">
                  {isElectron 
                    ? 'All your data is saved automatically in a SQLite database on your computer.' 
                    : 'All your data is saved automatically in your browser\'s local storage.'}
                </p>
                <div className="text-xs text-gray-400">
                  {isElectron 
                    ? <p>Note: The database file is located in your application data folder.</p> 
                    : <p>Note: Clearing browser data will erase your invoice data.</p>}
                  <p className="mt-1">Make sure to create regular backups and store them safely.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Best Practices for Data Management</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
              Create regular backups and store them in multiple locations
            </li>
            <li className="flex items-start">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
              Label your backup files with dates to stay organized
            </li>
            <li className="flex items-start">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
              Verify your backup files by checking their contents before relying on them
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default Backup;
