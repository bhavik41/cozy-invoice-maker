
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { 
  FileText, 
  Users, 
  ShoppingBag,
  UserCircle,
  Settings,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

const Index = () => {
  const { currentSeller } = useAppContext();
  const navigate = useNavigate();
  
  // Redirect to dashboard if app is already set up
  useEffect(() => {
    if (currentSeller) {
      navigate('/');
    }
  }, [currentSeller, navigate]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex flex-col">
      <header className="w-full py-4 px-6 bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-invoice-primary">Invoice Pro</h1>
          <div className="space-x-2">
            <Button variant="ghost" asChild>
              <Link to="/backup">Backup</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/settings">Settings</Link>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Invoice Pro</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your complete desktop billing solution with GST support
          </p>
        </div>
        
        {!currentSeller ? (
          <div className="max-w-2xl mx-auto">
            <Card className="mb-8 border-2 border-invoice-primary shadow-lg">
              <CardHeader>
                <CardTitle className="text-center text-xl">Get Started</CardTitle>
                <CardDescription className="text-center">
                  Set up your business profile to start creating invoices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-invoice-muted rounded-lg">
                  <div className="flex items-center text-invoice-primary mb-2">
                    <UserCircle className="w-5 h-5 mr-2" />
                    <h3 className="font-semibold">Business Profile</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Add your business details including GSTIN, address, and contact information.
                    This will appear on all invoices you create.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="justify-center">
                <Button asChild size="lg">
                  <Link to="/customers/new">
                    Set Up Business Profile
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-invoice-primary" />
                  Invoices
                </CardTitle>
                <CardDescription>
                  Create and manage invoices with GST support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-invoice-primary mt-1.5 mr-2"></span>
                    Create detailed GST invoices
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-invoice-primary mt-1.5 mr-2"></span>
                    Print or export invoices as PDF
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-invoice-primary mt-1.5 mr-2"></span>
                    Track payment status
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/invoices">
                    Manage Invoices
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="mr-2 h-5 w-5 text-invoice-primary" />
                  Products
                </CardTitle>
                <CardDescription>
                  Manage your product catalog with HSN codes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-invoice-primary mt-1.5 mr-2"></span>
                    Add products with HSN codes and GST rates
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-invoice-primary mt-1.5 mr-2"></span>
                    Set pricing and manage inventory
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-invoice-primary mt-1.5 mr-2"></span>
                    Quickly add products to invoices
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/products">
                    Manage Products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-invoice-primary" />
                  Customers
                </CardTitle>
                <CardDescription>
                  Organize your customer database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-invoice-primary mt-1.5 mr-2"></span>
                    Store customer details with GSTIN
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-invoice-primary mt-1.5 mr-2"></span>
                    Track transaction history
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-invoice-primary mt-1.5 mr-2"></span>
                    Quickly select customers for invoices
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/customers">
                    Manage Customers
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-invoice-primary" />
                  Settings
                </CardTitle>
                <CardDescription>
                  Customize your invoice settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-invoice-primary mt-1.5 mr-2"></span>
                    Update business profile
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-invoice-primary mt-1.5 mr-2"></span>
                    Configure invoice numbering
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-invoice-primary mt-1.5 mr-2"></span>
                    Set default tax rates
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/settings">
                    Open Settings
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow col-span-1 md:col-span-2 lg:col-span-3">
              <CardHeader className="bg-invoice-muted rounded-t-lg">
                <CardTitle>Ready to create your first invoice?</CardTitle>
                <CardDescription>
                  With your business profile set up, you're ready to start creating invoices
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center py-6">
                <Button size="lg" asChild>
                  <Link to="/invoices/new">
                    Create New Invoice
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
        
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>All data is stored locally on your device.</p>
          <p className="mt-1">Make regular backups to prevent data loss.</p>
        </div>
      </main>
      
      <footer className="w-full py-4 px-6 bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>Invoice Pro &copy; {new Date().getFullYear()} - Desktop Billing System</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
