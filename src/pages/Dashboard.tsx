
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { 
  FileText, 
  Users, 
  ShoppingBag, 
  TrendingUp,
  Printer,
  Plus,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { invoices, customers, products } = useAppContext();
  
  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const recentInvoices = [...invoices].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5);
  
  const topCustomers = [...customers]
    .map(customer => {
      const customerInvoices = invoices.filter(invoice => invoice.buyerId === customer.id);
      const totalSpent = customerInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
      return {
        ...customer,
        totalSpent,
        invoiceCount: customerInvoices.length
      };
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Dashboard Overview</h2>
        
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/invoices/new">
              <FileText className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 flex items-center">
          <div className="p-3 rounded-full bg-blue-100 mr-4">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Invoices</p>
            <h3 className="text-2xl font-bold">{invoices.length}</h3>
          </div>
        </Card>
        
        <Card className="p-6 flex items-center">
          <div className="p-3 rounded-full bg-green-100 mr-4">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <h3 className="text-2xl font-bold">{formatCurrency(totalRevenue)}</h3>
          </div>
        </Card>
        
        <Card className="p-6 flex items-center">
          <div className="p-3 rounded-full bg-purple-100 mr-4">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Customers</p>
            <h3 className="text-2xl font-bold">{customers.length}</h3>
          </div>
        </Card>
        
        <Card className="p-6 flex items-center">
          <div className="p-3 rounded-full bg-amber-100 mr-4">
            <ShoppingBag className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Products</p>
            <h3 className="text-2xl font-bold">{products.length}</h3>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Recent Invoices</h3>
            <Button variant="ghost" asChild>
              <Link to="/invoices">View All</Link>
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentInvoices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No invoices created yet</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to="/invoices/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Invoice
                  </Link>
                </Button>
              </div>
            ) : (
              recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Link 
                      to={`/invoices/${invoice.id}`}
                      className="font-medium text-invoice-primary hover:underline"
                    >
                      {invoice.invoiceNumber}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {new Date(invoice.date).toLocaleDateString()} - {invoice.buyer.name}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">{formatCurrency(invoice.totalAmount)}</span>
                    <div className="flex ml-4">
                      <Link 
                        to={`/invoices/${invoice.id}`}
                        className="p-1.5 text-gray-500 hover:text-invoice-primary"
                      >
                        <FileText className="h-4 w-4" />
                      </Link>
                      <button className="p-1.5 text-gray-500 hover:text-invoice-primary">
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Top Customers</h3>
            <Button variant="ghost" asChild>
              <Link to="/customers">View All</Link>
            </Button>
          </div>
          
          <div className="space-y-4">
            {topCustomers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No customers added yet</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to="/customers/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Customer
                  </Link>
                </Button>
              </div>
            ) : (
              topCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <span className="font-medium text-gray-600">
                        {customer.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <Link 
                        to={`/customers/${customer.id}`}
                        className="font-medium hover:text-invoice-primary"
                      >
                        {customer.name}
                      </Link>
                      <p className="text-sm text-gray-500">{customer.gstin}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(customer.totalSpent)}</p>
                    <p className="text-xs text-gray-500">{customer.invoiceCount} invoices</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
