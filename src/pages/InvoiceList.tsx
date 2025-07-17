
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Search, FileText, Printer, Trash2, Download, Filter, Calendar, FileSpreadsheet, FileDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useAppContext } from '@/context/AppContext';
import { formatCurrency, formatDate, exportToCsv } from '@/utils/helpers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

const InvoiceList = () => {
  const { invoices, filterInvoices, deleteInvoice, getCustomer, customers } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [displayedInvoices, setDisplayedInvoices] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  
  // Selection states
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    console.log('Current invoices:', invoices);
    
    // Apply all filters
    const filtered = filterInvoices({
      startDate,
      endDate,
      customerId: selectedCustomer && selectedCustomer !== 'all' ? selectedCustomer : undefined,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined
    });
    
    // Apply search query if present
    let searchFiltered = filtered;
    if (searchQuery) {
      searchFiltered = filtered.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.buyerName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    const processed = searchFiltered.map(invoice => {
      // Get customer name from different sources based on if it's a one-time customer
      let buyerName = 'Unknown';
      
      if (invoice.useExistingBuyer && invoice.buyerId) {
        // For existing customers
        const buyerData = getCustomer(invoice.buyerId);
        buyerName = buyerData?.name || 'Unknown Customer';
      } else {
        // For one-time customers
        buyerName = invoice.buyerName || 'One-time Customer';
      }
      
      return {
        ...invoice,
        buyerName
      };
    });
    
    console.log('Filtered and processed invoices:', processed);
    setDisplayedInvoices(processed);
  }, [invoices, searchQuery, filterInvoices, getCustomer, startDate, endDate, selectedCustomer, minAmount, maxAmount]);
  
  const handleDeleteClick = (id: string) => {
    setInvoiceToDelete(id);
  };
  
  const confirmDelete = () => {
    if (invoiceToDelete) {
      deleteInvoice(invoiceToDelete);
      setInvoiceToDelete(null);
      toast.success('Invoice deleted successfully');
    }
  };
  
  const cancelDelete = () => {
    setInvoiceToDelete(null);
  };
  
  const handlePrint = (invoiceId: string) => {
    // Open in the same tab to avoid popup blockers
    window.open(`/invoices/${invoiceId}?print=true`, '_blank');
  };

  const handleExport = () => {
    const exportData = displayedInvoices.map(invoice => ({
      'Invoice Number': invoice.invoiceNumber,
      'Date': formatDate(invoice.date),
      'Customer': invoice.buyerName,
      'Amount': invoice.totalAmount,
      'Tax Amount': invoice.taxAmount || 0,
      'Total Amount': invoice.totalAmount,
      'Payment Terms': invoice.paymentTerms || '',
      'Due Date': invoice.dueDate ? formatDate(invoice.dueDate) : '',
      'Status': 'Generated'
    }));

    const filename = `invoices_export_${format(new Date(), 'yyyy-MM-dd')}`;
    exportToCsv(filename, exportData);
    toast.success('Invoices exported successfully');
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedCustomer('all');
    setMinAmount('');
    setMaxAmount('');
    setSearchQuery('');
  };

  const handleSelectInvoice = (invoiceId: string, checked: boolean) => {
    const newSelected = new Set(selectedInvoices);
    if (checked) {
      newSelected.add(invoiceId);
    } else {
      newSelected.delete(invoiceId);
    }
    setSelectedInvoices(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(new Set(displayedInvoices.map(invoice => invoice.id)));
    } else {
      setSelectedInvoices(new Set());
    }
  };

  const exportSelectedToExcel = () => {
    const selectedData = displayedInvoices
      .filter(invoice => selectedInvoices.has(invoice.id))
      .map(invoice => ({
        'Invoice Number': invoice.invoiceNumber,
        'Date': formatDate(invoice.date),
        'Customer': invoice.buyerName,
        'Amount': invoice.totalAmount,
        'Tax Amount': invoice.taxAmount || 0,
        'Total Amount': invoice.totalAmount,
        'Payment Terms': invoice.paymentTerms || '',
        'Due Date': invoice.dueDate ? formatDate(invoice.dueDate) : '',
        'Status': 'Generated'
      }));

    const filename = `selected_invoices_${format(new Date(), 'yyyy-MM-dd')}`;
    exportToCsv(filename, selectedData);
    toast.success(`${selectedData.length} invoices exported to Excel successfully`);
  };

  const exportSelectedToPdf = () => {
    const selectedInvoiceIds = Array.from(selectedInvoices);
    if (selectedInvoiceIds.length === 0) {
      toast.error('Please select invoices to export');
      return;
    }
    
    // For now, open each invoice in a new tab for PDF printing
    selectedInvoiceIds.forEach((invoiceId, index) => {
      setTimeout(() => {
        window.open(`/invoices/${invoiceId}?print=true`, '_blank');
      }, index * 500); // Stagger opening to avoid browser blocking
    });
    
    toast.success(`Opening ${selectedInvoiceIds.length} invoices for PDF export`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Invoices</h2>
        <Button asChild>
          <Link to="/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search invoices..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button 
            onClick={handleExport}
            className="flex items-center gap-2"
            disabled={displayedInvoices.length === 0}
          >
            <Download className="h-4 w-4" />
            Export All ({displayedInvoices.length})
          </Button>
        </div>
        
        {selectedInvoices.size > 0 && (
          <div className="flex gap-2 items-center p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">
              {selectedInvoices.size} invoice(s) selected
            </span>
            <Button 
              onClick={exportSelectedToExcel}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export to Excel
            </Button>
            <Button 
              onClick={exportSelectedToPdf}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Export to PDF
            </Button>
            <Button 
              onClick={() => setSelectedInvoices(new Set())}
              variant="ghost"
              size="sm"
            >
              Clear Selection
            </Button>
          </div>
        )}
        
        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Min Amount</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Max Amount</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </Card>
        )}
      </div>
      
      <Card className="p-6">
        {displayedInvoices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchQuery ? 'No invoices match your search' : 'No invoices created yet'}
            </p>
            {!searchQuery && (
              <Button variant="outline" className="mt-4" asChild>
                <Link to="/invoices/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Invoice
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={displayedInvoices.length > 0 && selectedInvoices.size === displayedInvoices.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all invoices"
                  />
                </TableHead>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedInvoices.has(invoice.id)}
                      onCheckedChange={(checked) => handleSelectInvoice(invoice.id, checked as boolean)}
                      aria-label={`Select invoice ${invoice.invoiceNumber}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link to={`/invoices/${invoice.id}`} className="hover:underline">
                      {invoice.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(invoice.date)}</TableCell>
                  <TableCell>{invoice.buyerName}</TableCell>
                  <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/invoices/${invoice.id}`}>
                          <FileText className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handlePrint(invoice.id)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteClick(invoice.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      
      <Dialog open={!!invoiceToDelete} onOpenChange={(open) => !open && setInvoiceToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceList;
