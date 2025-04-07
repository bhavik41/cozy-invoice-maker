
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react';
import { exportToCsv, formatCurrency, formatDate } from '@/utils/helpers';

const Reports = () => {
  const { invoices, customers, products } = useAppContext();
  const [activeTab, setActiveTab] = useState('sales');

  // Generate monthly sales data for the current year
  const generateMonthlySalesData = () => {
    const currentYear = new Date().getFullYear();
    const monthData = Array(12).fill(0).map((_, i) => ({
      month: new Date(currentYear, i).toLocaleString('default', { month: 'short' }),
      sales: 0,
      invoiceCount: 0,
    }));
    
    invoices.forEach(invoice => {
      const date = new Date(invoice.date);
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        monthData[monthIndex].sales += invoice.totalAmount;
        monthData[monthIndex].invoiceCount += 1;
      }
    });
    
    return monthData;
  };

  // Generate top customer data
  const generateTopCustomersData = () => {
    const customerSales: Record<string, { customerId: string, customerName: string, totalSales: number, invoiceCount: number }> = {};
    
    invoices.forEach(invoice => {
      const customerId = invoice.buyerId;
      const customerName = customers.find(c => c.id === customerId)?.name || 'Unknown';
      
      if (!customerSales[customerId]) {
        customerSales[customerId] = {
          customerId,
          customerName,
          totalSales: 0,
          invoiceCount: 0
        };
      }
      
      customerSales[customerId].totalSales += invoice.totalAmount;
      customerSales[customerId].invoiceCount += 1;
    });
    
    return Object.values(customerSales)
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10);
  };

  // Generate top products data
  const generateTopProductsData = () => {
    const productSales: Record<string, { productId: string, productName: string, quantity: number, revenue: number }> = {};
    
    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productId: item.productId,
            productName: item.productName,
            quantity: 0,
            revenue: 0
          };
        }
        
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.amount;
      });
    });
    
    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  // Generate recent invoices data
  const generateRecentInvoicesData = () => {
    return [...invoices]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
      .map(invoice => {
        const customer = customers.find(c => c.id === invoice.buyerId);
        return {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          date: formatDate(invoice.date),
          customerName: customer?.name || 'Unknown',
          amount: invoice.totalAmount,
          formattedAmount: formatCurrency(invoice.totalAmount)
        };
      });
  };

  const monthlySalesData = generateMonthlySalesData();
  const topCustomersData = generateTopCustomersData();
  const topProductsData = generateTopProductsData();
  const recentInvoicesData = generateRecentInvoicesData();

  const handleExportSales = () => {
    exportToCsv('monthly-sales.csv', monthlySalesData);
  };

  const handleExportCustomers = () => {
    exportToCsv('top-customers.csv', topCustomersData);
  };

  const handleExportProducts = () => {
    exportToCsv('top-products.csv', topProductsData);
  };

  const handleExportInvoices = () => {
    exportToCsv('recent-invoices.csv', recentInvoicesData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Reports</h2>
      </div>
      
      <Tabs defaultValue="sales" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="sales">
            <LineChartIcon className="mr-2 h-4 w-4" />
            Sales Reports
          </TabsTrigger>
          <TabsTrigger value="customers">
            <BarChart3 className="mr-2 h-4 w-4" />
            Customer Reports
          </TabsTrigger>
          <TabsTrigger value="products">
            <PieChartIcon className="mr-2 h-4 w-4" />
            Product Reports
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <BarChart3 className="mr-2 h-4 w-4" />
            Invoice List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Monthly Sales</h3>
              <Button variant="outline" size="sm" onClick={handleExportSales}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            
            {monthlySalesData.some(d => d.sales > 0) ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line type="monotone" dataKey="sales" name="Sales Amount" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No sales data available for this year</p>
                <p className="text-gray-500 mt-2">Create invoices to view monthly sales trends</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Top Customers</h3>
              <Button variant="outline" size="sm" onClick={handleExportCustomers}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            
            {topCustomersData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCustomersData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="customerName" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="totalSales" name="Total Sales" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No customer data available</p>
                <p className="text-gray-500 mt-2">Create invoices to view customer reports</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Top Products</h3>
              <Button variant="outline" size="sm" onClick={handleExportProducts}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            
            {topProductsData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="productName" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(Number(value)) : value,
                      name === 'revenue' ? 'Revenue' : 'Quantity Sold'
                    ]} />
                    <Legend />
                    <Bar dataKey="quantity" name="Quantity Sold" fill="#82ca9d" />
                    <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No product sales data available</p>
                <p className="text-gray-500 mt-2">Create invoices to view product reports</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Recent Invoices</h3>
              <Button variant="outline" size="sm" onClick={handleExportInvoices}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            
            {recentInvoicesData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Invoice #</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Customer</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvoicesData.map((invoice) => (
                      <tr key={invoice.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{invoice.invoiceNumber}</td>
                        <td className="px-4 py-2">{invoice.date}</td>
                        <td className="px-4 py-2">{invoice.customerName}</td>
                        <td className="px-4 py-2 text-right">{invoice.formattedAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No invoices available</p>
                <p className="text-gray-500 mt-2">Create invoices to view them here</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
