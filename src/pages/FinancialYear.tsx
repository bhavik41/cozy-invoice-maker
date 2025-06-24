
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Archive, 
  Download, 
  FileText, 
  DollarSign,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getCurrentFinancialYear, 
  formatFinancialYear, 
  getFinancialYearDates 
} from '@/utils/financialYear';
import * as storage from '@/utils/storage';
import { formatCurrency } from '@/utils/helpers';

const FinancialYear = () => {
  const [currentFY, setCurrentFY] = useState<string>(getCurrentFinancialYear());
  const [archivedYears, setArchivedYears] = useState<string[]>([]);
  const [yearData, setYearData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadArchivedYears();
  }, []);

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
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-1">
                Financial Year Transition
              </h4>
              <p className="text-sm text-yellow-700 mb-3">
                When you start a new financial year, all current data will be archived and invoice numbering will reset to 1.
              </p>
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
            </div>
          </div>
        </div>
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
