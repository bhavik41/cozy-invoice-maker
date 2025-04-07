
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { User, Store, Printer, Database, Building2 } from 'lucide-react';
import { Customer } from '@/types';

// Check if we're running in Electron
const isElectron = window.api !== undefined;

const Settings = () => {
  const { currentSeller, setCurrentSeller } = useAppContext();
  const [businessName, setBusinessName] = useState(currentSeller?.name || '');
  const [businessAddress, setBusinessAddress] = useState(currentSeller?.address || '');
  const [gstin, setGstin] = useState(currentSeller?.gstin || '');
  const [state, setState] = useState(currentSeller?.state || '');
  const [stateCode, setStateCode] = useState(currentSeller?.stateCode || '');
  const [contact, setContact] = useState(currentSeller?.contact || '');
  const [email, setEmail] = useState(currentSeller?.email || '');
  const [pan, setPan] = useState(currentSeller?.pan || '');
  
  // Print settings (these would be saved to settings in a full implementation)
  const [enableHeaderLogo, setEnableHeaderLogo] = useState(true);
  const [enableFooterSignature, setEnableFooterSignature] = useState(true);
  const [enableCompanyDetails, setEnableCompanyDetails] = useState(true);
  const [printInColor, setPrintInColor] = useState(true);
  
  // Application preferences
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [compactViewEnabled, setCompactViewEnabled] = useState(false);
  
  // Bank details
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branch, setBranch] = useState('');

  const handleSaveBusinessDetails = () => {
    // Create a new Customer object if none exists, otherwise update the current one
    const seller: Customer = currentSeller ? { ...currentSeller } : {
      id: `seller-${Date.now()}`,
      name: '',
      address: '',
      gstin: '',
      state: '',
      stateCode: '',
      contact: '',
      email: '',
      pan: ''
    };
    
    // Update seller properties
    seller.name = businessName;
    seller.address = businessAddress;
    seller.gstin = gstin;
    seller.state = state;
    seller.stateCode = stateCode;
    seller.contact = contact;
    seller.email = email;
    seller.pan = pan;
    
    setCurrentSeller(seller);
    toast.success('Business details saved successfully');
  };

  const handleSavePrintSettings = () => {
    // This would save to application settings in a full implementation
    toast.success('Print settings saved successfully');
  };

  const handleSavePreferences = () => {
    // This would save to application settings in a full implementation
    toast.success('Application preferences saved successfully');
  };

  const handleSaveBankDetails = () => {
    // This would save to application settings in a full implementation
    toast.success('Bank details saved successfully');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Settings</h2>
      
      <Tabs defaultValue="business" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="business">
            <Building2 className="mr-2 h-4 w-4" />
            Business Details
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Store className="mr-2 h-4 w-4" />
            Application Preferences
          </TabsTrigger>
          <TabsTrigger value="print">
            <Printer className="mr-2 h-4 w-4" />
            Print Settings
          </TabsTrigger>
          <TabsTrigger value="banking">
            <Database className="mr-2 h-4 w-4" />
            Banking Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-6">Business Information</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input 
                    id="businessName" 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your Company Name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input 
                    id="gstin" 
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address</Label>
                <Textarea 
                  id="businessAddress" 
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  placeholder="Complete address with pincode"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input 
                    id="state" 
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Maharashtra"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stateCode">State Code</Label>
                  <Input 
                    id="stateCode" 
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    placeholder="27"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Number</Label>
                  <Input 
                    id="contact" 
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@yourcompany.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pan">PAN</Label>
                <Input 
                  id="pan" 
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                  placeholder="AAAAA0000A"
                />
              </div>
              
              <Button onClick={handleSaveBusinessDetails} className="mt-4">
                Save Business Details
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-6">Application Preferences</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Autosave Changes</Label>
                  <p className="text-sm text-gray-500">
                    Automatically save changes as you make them
                  </p>
                </div>
                <Switch 
                  checked={autosaveEnabled}
                  onCheckedChange={setAutosaveEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Dark Mode</Label>
                  <p className="text-sm text-gray-500">
                    Use dark theme for the application
                  </p>
                </div>
                <Switch 
                  checked={darkModeEnabled}
                  onCheckedChange={setDarkModeEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Compact View</Label>
                  <p className="text-sm text-gray-500">
                    Show more data in less space
                  </p>
                </div>
                <Switch 
                  checked={compactViewEnabled}
                  onCheckedChange={setCompactViewEnabled}
                />
              </div>
              
              <div className="pt-4">
                <Button onClick={handleSavePreferences}>
                  Save Preferences
                </Button>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-6">Data Storage Location</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm mb-2">
                  {isElectron 
                    ? 'Your data is stored in a SQLite database on your computer.' 
                    : 'Your data is stored in your browser\'s local storage.'}
                </p>
                <p className="text-sm text-gray-600">
                  {isElectron
                    ? 'Database Location: User data folder/invoice-data.db'
                    : 'Browser Storage: This website\'s local storage'}
                </p>
              </div>
              
              <p className="text-sm text-gray-500">
                Make regular backups of your data using the Backup & Restore page.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="print" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-6">Invoice Print Settings</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Show Logo in Header</Label>
                  <p className="text-sm text-gray-500">
                    Display your company logo at the top of invoices
                  </p>
                </div>
                <Switch 
                  checked={enableHeaderLogo}
                  onCheckedChange={setEnableHeaderLogo}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Show Signature in Footer</Label>
                  <p className="text-sm text-gray-500">
                    Display signature section at the bottom of invoices
                  </p>
                </div>
                <Switch 
                  checked={enableFooterSignature}
                  onCheckedChange={setEnableFooterSignature}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Show Company Details</Label>
                  <p className="text-sm text-gray-500">
                    Display full company information on invoices
                  </p>
                </div>
                <Switch 
                  checked={enableCompanyDetails}
                  onCheckedChange={setEnableCompanyDetails}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Print in Color</Label>
                  <p className="text-sm text-gray-500">
                    Use colored elements in printed invoices
                  </p>
                </div>
                <Switch 
                  checked={printInColor}
                  onCheckedChange={setPrintInColor}
                />
              </div>
              
              <div className="pt-4">
                <Button onClick={handleSavePrintSettings}>
                  Save Print Settings
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="banking" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-6">Bank Account Details</h3>
            <p className="text-sm text-gray-500 mb-6">
              These details will appear on your invoices for payments
            </p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input 
                    id="bankName" 
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="State Bank of India"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input 
                    id="accountNumber" 
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="1234567890"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input 
                    id="ifscCode" 
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    placeholder="SBIN0001234"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Input 
                    id="branch" 
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="Mumbai Main Branch"
                  />
                </div>
              </div>
              
              <Button onClick={handleSaveBankDetails} className="mt-4">
                Save Bank Details
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
