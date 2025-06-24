
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  Archive, 
  Download, 
  FileText, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getCurrentFinancialYear, 
  formatFinancialYear, 
  getFinancialYearDates 
} from '@/utils/financialYear';
import * as storage from '@/utils/storage';
import { formatCurrency, exportToCsv } from '@/utils/helpers';

const FinancialYear = () => {
  const [currentFY, setCurrentFY] = useState<string>(getCurrentFinancialYear());
  const [archivedYears, setArchivedYears] = useState<string[]>([]);
  const [yearData, setYearData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedExportYear, setSelectedExportYear] = useState<string>('');
  const [exportStartMonth, setExportStartMonth] = useState<string>('4'); // April
  const [exportEndMonth, setExportEndMonth] = useState<string>('3'); // March
  const [exportStartYear, setExportStartYear] = useState<string>('');
  const [exportEndYear, setExportEndYear] = useState<string>('');

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  useEffect(() => {
    loadArchivedYears();
    // Set default export years based on current FY
    const [startYear] = currentFY.split('-').map(Number);
    setExportStartYear(startYear.toString());
    setExportEndYear((startYear + 1).toString());
  }, [currentFY]);

  const loadArchivedYears = async () => {
    try {
      const years = await storage.getAllFinancialYears();
      setArchivedYears(years);
      
      // Load summary data for each year
      const data = await Promise.all(
        years.map(async (year) => {
          const archiveData = await storage.getFinancialYearData(year);
          return {
            year,
            ...archiveData
          };
        })
      );
      setYearData(data);
    } catch (error) {
      console.error('Error loading archived years:', error);
      toast.error('Failed to load financial year data');
    }
  };

  const handleStartNewFinancialYear = async () => {
    setLoading(true);
    try {
      // Archive current financial year
      await storage.archiveCurrentFinancialYear(currentFY);
      
      // Clear current invoices
      await storage.saveItems('invoices', []);
      
      // Update to new financial year
      const newFY = getCurrentFinancialYear();
      setCurrentFY(newFY);
      
      // Reload archived years
      await loadArchivedYears();
      
      toast.success(`Financial Year ${formatFinancialYear(newFY)} started successfully!`);
    } catch (error) {
      console.error('Error starting new financial year:', error);
      toast.error('Failed to start new financial year');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndStartNewYear = async () => {
    setLoading(true);
    try {
      // Archive current financial year with all data
      await storage.archiveCurrentFinancialYear(currentFY);
      
      // Clear current invoices for new year
      await storage.saveItems('invoices', []);
      
      // Generate new financial year string
      const [currentStartYear] = currentFY.split('-').map(Number);
      const newFY = `${currentStartYear + 1}-${currentStartYear + 2}`;
      setCurrentFY(newFY);
      
      // Reload archived years
      await loadArchivedYears();
      
      toast.success(`Data saved and Financial Year ${formatFinancialYear(newFY)} started successfully!`);
    } catch (error) {
      console.error('Error saving and starting new financial year:', error);
      toast.error('Failed to save and start new financial year');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadYearData = async (year: string) => {
    try {
      const data = await storage.getFinancialYearData(year);
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `financial-year-${year}-backup.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success(`Financial year ${formatFinancialYear(year)} data downloaded`);
    } catch (error) {
      console.error('Error downloading year data:', error);
      toast.error('Failed to download year data');
    }
  };

  const handleExportToExcel = async () => {
    try {
      if (!exportStartYear || !exportEndYear) {
        toast.error('Please select start and end years');
        return;
      }

      const startDate = new Date(parseInt(exportStartYear), parseInt(exportStartMonth) - 1, 1);
      const endDate = new Date(parseInt(exportEndYear), parseInt(exportEndMonth), 0); // Last day of end month

      let invoicesToExport: any[] = [];

      if (selectedExportYear) {
        // Export from archived year
        const yearData = await storage.getFinancialYearData(selectedExportYear);
        if (yearData.invoices) {
          invoicesToExport = yearData.invoices;
        }
      } else {
        // Export from current invoices
        const currentInvoices = await storage.getItems('invoices');
        invoicesToExport = currentInvoices;
      }

      // Filter invoices by date range
      const filteredInvoices = invoicesToExport.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });

      if (filteredInvoices.length === 0) {
        toast.error('No invoices found for the selected period');
        return;
      }

      // Prepare data for CSV export
      const csvData = filteredInvoices.map(invoice => ({
        'Invoice Number': invoice.invoiceNumber,
        'Date': new Date(invoice.date).toLocaleDateString('en-IN'),
        'Customer Name': invoice.buyerName || invoice.buyer?.name || 'N/A',
        'Customer GSTIN': invoice.buyerGstin || invoice.buyer?.gstin || 'N/A',
        'Items': invoice.items?.map((item: any) => `${item.description} (${item.quantity} x ${item.rate})`).join('; ') || 'N/A',
        'Subtotal': invoice.subtotal || 0,
        'Tax Amount': invoice.taxAmount || 0,
        'Total Amount': invoice.totalAmount || 0,
        'Payment Status': invoice.paymentStatus || 'Pending'
      }));

      const filename = `invoices-${startDate.toISOString().slice(0, 7)}-to-${endDate.toISOString().slice(0, 7)}.csv`;
      exportToCsv(filename, csvData);
      
      toast.success(`Exported ${filteredInvoices.length} invoices to Excel`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel');
    }
  };

  const { startDate, endDate } = getFinancialYearDates(currentFY);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">Financial Year Management</h2>

      {/* Current Financial Year */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium">Current Financial Year</h3>
              <p className="text-sm text-gray-500">
                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            {formatFinancialYear(currentFY)}
          </Badge>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-800 mb-1">
                Financial Year Transition
              </h4>
              <p className="text-sm text-yellow-700 mb-3">
                When you start a new financial year, all current data will be archived and invoice numbering will reset to 1.
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={handleStartNewFinancialYear}
                  disabled={loading}
                  size="sm"
                  variant="outline"
                  className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  {loading ? 'Processing...' : 'Start New Financial Year'}
                </Button>
                <Button 
                  onClick={handleSaveAndStartNewYear}
                  disabled={loading}
                  size="sm"
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Processing...' : 'Save & Start New Year'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Excel Export Section */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <FileSpreadsheet className="h-5 w-5 mr-2" />
          Export Invoices to Excel
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="export-year">Financial Year (Optional)</Label>
            <Select value={selectedExportYear} onValueChange={setSelectedExportYear}>
              <SelectTrigger>
                <SelectValue placeholder="Current year data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Current Year Data</SelectItem>
                {archivedYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {formatFinancialYear(year)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <Label htmlFor="start-month">Start Month</Label>
            <Select value={exportStartMonth} onValueChange={setExportStartMonth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="start-year">Start Year</Label>
            <Input
              value={exportStartYear}
              onChange={(e) => setExportStartYear(e.target.value)}
              placeholder="2024"
              type="number"
            />
          </div>
          
          <div>
            <Label htmlFor="end-month">End Month</Label>
            <Select value={exportEndMonth} onValueChange={setExportEndMonth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="end-year">End Year</Label>
            <Input
              value={exportEndYear}
              onChange={(e) => setExportEndYear(e.target.value)}
              placeholder="2025"
              type="number"
            />
          </div>
        </div>

        <Button onClick={handleExportToExcel} className="w-full md:w-auto">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export to Excel (CSV)
        </Button>
      </Card>

      {/* Archived Financial Years */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Archived Financial Years</h3>
        
        {archivedYears.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Archive className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No archived financial years yet</p>
            <p className="text-sm">Archived data will appear here when you start a new financial year</p>
          </div>
        ) : (
          <div className="space-y-4">
            {yearData.map((data) => (
              <div key={data.year} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="font-medium">{formatFinancialYear(data.year)}</span>
                    <Badge variant="secondary" className="ml-2">Archived</Badge>
                  </div>
                  <Button
                    onClick={() => handleDownloadYearData(data.year)}
                    size="sm"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
                
                {data.summary && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-blue-600 mr-2" />
                      <span>{data.summary.totalInvoices} Invoices</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                      <span>{formatCurrency(data.summary.totalAmount)}</span>
                    </div>
                  </div>
                )}
                
                {data.archivedDate && (
                  <p className="text-xs text-gray-500 mt-2">
                    Archived on: {new Date(data.archivedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default FinancialYear;
