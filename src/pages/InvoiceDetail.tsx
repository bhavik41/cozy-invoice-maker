
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit2, Printer, Download, Share2, ArrowLeft, Trash2, FileDown } from 'lucide-react';
import { formatCurrency, printInvoice, exportInvoiceToJson, exportInvoiceToPdf } from '@/utils/helpers';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// CSS for the invoice print - updated to match the provided format
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    #invoice-to-print, #invoice-to-print * {
      visibility: visible;
    }
    #invoice-to-print {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      padding: 0 !important;
      margin: 0 !important;
      font-size: 10px !important;
    }
    #invoice-to-print .no-print {
      display: none;
    }
    #invoice-to-print table {
      width: 100%;
      border-collapse: collapse;
      page-break-inside: avoid;
    }
    #invoice-to-print th, #invoice-to-print td {
      border: 1px solid black;
      padding: 2px;
      font-size: 10px;
    }
    #invoice-to-print h1 {
      font-size: 16px;
      text-align: center;
      margin: 4px 0;
    }
    #invoice-to-print h2, #invoice-to-print h3 {
      font-size: 12px;
      margin: 2px 0;
    }
    #invoice-to-print .grid {
      display: block;
    }
    @page {
      size: A4;
      margin: 5mm;
    }
    #invoice-to-print .tax-summary-table {
      font-size: 10px;
    }
    #invoice-to-print .seller-details, #invoice-to-print .buyer-details {
      padding: 2px !important;
    }
    #invoice-to-print .invoice-heading {
      font-size: 15px !important;
      padding: 2px !important;
      margin: 2px 0 !important;
    }
    #invoice-to-print .company-name {
      font-size: 14px !important;
    }
    #invoice-to-print .logo-container {
      text-align: center;
      margin-bottom: 5px;
    }
    #invoice-to-print .logo-container img {
      height: 60px;
      max-width: 150px;
    }
  }
`;

const InvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getInvoice, deleteInvoice } = useAppContext();
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const invoice = id ? getInvoice(id) : null;
  
  // Check if we're in print mode (from URL)
  useEffect(() => {
    if (location.search.includes('print=true')) {
      setTimeout(() => {
        printInvoice();
      }, 500); // Short delay to ensure rendering is complete
    }
  }, [location]);
  
  const confirmDelete = () => {
    if (id) {
      deleteInvoice(id);
      toast.success('Invoice deleted successfully');
      navigate('/invoices');
    }
  };
  
  const handlePrint = () => {
    printInvoice();
  };
  
  const handleExportJson = () => {
    if (invoice) {
      exportInvoiceToJson(invoice);
      toast.success('Invoice exported as JSON');
    }
  };
  
  const handleExportPdf = () => {
    if (invoice && invoiceRef.current) {
      exportInvoiceToPdf(
        'invoice-to-print', 
        `invoice-${invoice.invoiceNumber}-${new Date().toISOString().slice(0, 10)}.pdf`
      );
      toast.success('Invoice exported as PDF');
    }
  };
  
  if (!invoice) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Invoice Not Found</h2>
          <p className="text-gray-500 mb-6">The requested invoice could not be found.</p>
          <Button asChild>
            <Link to="/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoices
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Create a buyer object with either existing buyer data or from direct invoice fields for one-time customers
  const buyer = invoice.useExistingBuyer ? (invoice.buyer || {
    name: 'N/A',
    address: 'N/A',
    gstin: 'N/A',
    state: 'N/A',
    stateCode: 'N/A',
    contact: 'N/A',
    email: 'N/A',
    pan: 'N/A'
  }) : {
    name: invoice.buyerName || 'N/A',
    address: invoice.buyerAddress || 'N/A',
    gstin: invoice.buyerGstin || 'N/A',
    state: invoice.buyerState || 'N/A',
    stateCode: invoice.buyerStateCode || 'N/A',
    contact: invoice.buyerContact || 'N/A',
    email: invoice.buyerEmail || 'N/A',
    pan: 'N/A'
  };
  
  // Ensure seller object exists with default values if needed
  const seller = invoice.seller || {
    name: 'N/A',
    address: 'N/A',
    gstin: 'N/A',
    state: 'N/A',
    stateCode: 'N/A',
    contact: 'N/A',
    email: 'N/A',
    pan: 'N/A',
    logo: ''
  };
  
  // Check if we're using IGST or CGST+SGST based on the rates
  const useIGST = invoice.igstRate > 0;
  
  // Format date for display
  const formatDisplayDate = (date: Date | string) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Ensure bank details exist
  const bankDetails = invoice.bankDetails || {
    bankName: '',
    accountNumber: '',
    branch: '',
    ifscCode: ''
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <style>{printStyles}</style>
      
      <div className="flex items-center justify-between mb-6 no-print">
        <Button variant="ghost" onClick={() => navigate('/invoices')} className="no-print">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>
        
        <div className="flex gap-2 no-print">
          <Button variant="outline" onClick={() => navigate(`/invoices/edit/${invoice.id}`)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportJson}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPdf}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      <Card className="p-2 mb-6 border" id="invoice-to-print" ref={invoiceRef}>
        {/* Header with centered Tax Invoice title */}
        <div className="text-center border-b pb-2 mb-2">
          <h1 className="text-2xl font-bold invoice-heading">Tax Invoice</h1>
        </div>
        
        {/* Seller and Invoice Details */}
        <div className="grid grid-cols-12 border-b">
          {/* Left column - Seller details */}
          <div className="col-span-6 p-1 border-r seller-details">
            {/* Centered logo in its own row */}
            {seller.logo && (
              <div className="logo-container mb-1">
                <img 
                  src={seller.logo} 
                  alt="Company Logo" 
                  className="h-12 w-auto object-contain mx-auto"
                />
              </div>
            )}
            <h2 className="text-base font-bold company-name mb-1">{seller.name}</h2>
            <p className="text-xs mb-1"><strong>Address:</strong> {seller.address}</p>
            <p className="text-xs mb-1"><strong>GSTIN:</strong> {seller.gstin}</p>
            <p className="text-xs mb-1"><strong>State Name:</strong> {seller.state} <strong>Code:</strong> {seller.stateCode}</p>
            <p className="text-xs mb-1"><strong>Contact:</strong> {seller.contact}</p>
            <p className="text-xs mb-1"><strong>Email:</strong> {seller.email}</p>
            <p className="text-xs"><strong>PAN:</strong> {seller.pan}</p>
          </div>
          
          {/* Right column - Invoice details in grid format */}
          <div className="col-span-6 p-1">
            <div className="grid grid-cols-6 text-xs border-collapse">
              {/* Row 1 */}
              <div className="col-span-2 border p-1 font-semibold">Invoice No.</div>
              <div className="col-span-2 border p-1">{invoice.invoiceNumber || 'N/A'}</div>
              <div className="col-span-1 border p-1 font-semibold">E-way Bill No.</div>
              <div className="col-span-1 border p-1">{invoice.eWayBillNumber || '.....'}</div>
              
              {/* Row 2 */}
              <div className="col-span-2 border p-1 font-semibold">Delivery Note</div>
              <div className="col-span-2 border p-1">{invoice.deliveryNote || '.....'}</div>
              <div className="col-span-1 border p-1 font-semibold">Dated:</div>
              <div className="col-span-1 border p-1">{formatDisplayDate(invoice.date)}</div>
              
              {/* Row 3 */}
              <div className="col-span-2 border p-1 font-semibold">Reference No. & Date</div>
              <div className="col-span-2 border p-1">{invoice.reference || '.....'}</div>
              <div className="col-span-2 border p-1 font-semibold">Mode/Terms of Payment</div>
              
              {/* Row 4 */}
              <div className="col-span-2 border p-1 font-semibold">Other References</div>
              <div className="col-span-2 border p-1">{invoice.otherReferences || '.....'}</div>
              <div className="col-span-2 border p-1">{invoice.modeOfPayment || '.....'}</div>
              
              {/* Row 5 */}
              <div className="col-span-2 border p-1 font-semibold">Buyer's Order No.</div>
              <div className="col-span-2 border p-1">{invoice.buyerOrderNo || '.....'}</div>
              <div className="col-span-1 border p-1 font-semibold">Dated</div>
              <div className="col-span-1 border p-1">{invoice.dated || '.....'}</div>
            </div>
          </div>
        </div>
        
        {/* Buyer and Shipping Details */}
        <div className="grid grid-cols-12 border-b">
          {/* Left column - Buyer details */}
          <div className="col-span-6 p-1 border-r buyer-details">
            <h3 className="font-bold text-xs mb-1">Buyer (Bill To):</h3>
            <p className="font-medium text-xs mb-1"><strong>Buyer Name:</strong> {buyer.name}</p>
            <p className="text-xs mb-1"><strong>Address:</strong> {buyer.address}</p>
            <p className="text-xs mb-1"><strong>GSTIN:</strong> {buyer.gstin}</p>
            <p className="text-xs mb-1"><strong>State:</strong> {buyer.state} <strong>Code:</strong> {buyer.stateCode}</p>
            <p className="text-xs"><strong>Place of supply:</strong> {buyer.state}</p>
          </div>
          
          {/* Right column - Shipping details in grid format */}
          <div className="col-span-6 p-1">
            <div className="grid grid-cols-4 text-xs border-collapse">
              {/* Row 1 */}
              <div className="col-span-2 border p-1 font-semibold">Dispatch Document No.</div>
              <div className="col-span-2 border p-1 font-semibold">Delivery Note Date</div>
              <div className="col-span-2 border p-1">{invoice.dispatchDocumentNo || '.....'}</div>
              <div className="col-span-2 border p-1">{invoice.deliveryNoteDate || formatDisplayDate(invoice.date)}</div>
              
              {/* Row 2 */}
              <div className="col-span-2 border p-1 font-semibold">Dispatched through</div>
              <div className="col-span-2 border p-1 font-semibold">Destination</div>
              <div className="col-span-2 border p-1">{invoice.dispatchedThrough || '.....'}</div>
              <div className="col-span-2 border p-1">{invoice.destination || '.....'}</div>
              
              {/* Row 3 */}
              <div className="col-span-2 border p-1 font-semibold">Bill of Landing/LR-RR No.</div>
              <div className="col-span-2 border p-1 font-semibold">Motor Vehicle No.</div>
              <div className="col-span-2 border p-1">{invoice.billOfLading || '.....'}</div>
              <div className="col-span-2 border p-1">{invoice.motorVehicleNo || '.....'}</div>
              
              {/* Row 4 */}
              <div className="col-span-4 border p-1 font-semibold">Terms of Delivery</div>
              <div className="col-span-4 border p-1">{invoice.termsOfDelivery || '.....'}</div>
            </div>
          </div>
        </div>
        
        {/* Invoice Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-1 text-center text-xs">No.</th>
                <th className="border p-1 text-left text-xs">Description of Goods</th>
                <th className="border p-1 text-center text-xs">HSN/SAC</th>
                <th className="border p-1 text-center text-xs">CGST %</th>
                <th className="border p-1 text-center text-xs">SGST %</th>
                <th className="border p-1 text-center text-xs">IGST %</th>
                <th className="border p-1 text-center text-xs">Quantity</th>
                <th className="border p-1 text-center text-xs">Rate per Unit</th>
                <th className="border p-1 text-right text-xs">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.items || []).map((item, index) => (
                <tr key={item.id}>
                  <td className="border p-1 text-center text-xs">{index + 1}</td>
                  <td className="border p-1 text-xs">{item.productName || 'N/A'}</td>
                  <td className="border p-1 text-center text-xs">{item.hsnCode || 'N/A'}</td>
                  <td className="border p-1 text-center text-xs">{item.cgst || 0}%</td>
                  <td className="border p-1 text-center text-xs">{item.sgst || 0}%</td>
                  <td className="border p-1 text-center text-xs">{item.igst || 0}%</td>
                  <td className="border p-1 text-center text-xs">{Number(item.quantity || 0).toFixed(3)}</td>
                  <td className="border p-1 text-right text-xs">{item.price || 0}</td>
                  <td className="border p-1 text-right text-xs">{formatCurrency(item.amount || 0).replace('₹', '')}</td>
                </tr>
              ))}
              
              {/* Subtotal row */}
              <tr>
                <td colSpan={8} className="border p-1 text-right text-xs font-medium">Total</td>
                <td className="border p-1 text-right text-xs font-bold">{formatCurrency((invoice.totalAmount || 0) - (invoice.totalTaxAmount || 0)).replace('₹', '')}</td>
              </tr>
              
              {/* Tax calculations */}
              <tr>
                <td colSpan={5} className="border p-1">
                  {useIGST ? (
                    <p className="text-center">IGST @ {invoice.igstRate || 0}%</p>
                  ) : (
                    <>
                      <p className="text-center">CGST @ {invoice.cgstRate || 0}%</p>
                      <p className="text-center">SGST @ {invoice.sgstRate || 0}%</p>
                    </>
                  )}
                  <p className="text-center">Round Off</p>
                </td>
                <td colSpan={3} className="border p-1 text-right">
                  {useIGST ? (
                    <p>IGST @ {invoice.igstRate || 0}%</p>
                  ) : (
                    <>
                      <p>CGST @ {invoice.cgstRate || 0}%</p>
                      <p>SGST @ {invoice.sgstRate || 0}%</p>
                    </>
                  )}
                  <p>Round Off</p>
                </td>
                <td className="border p-1 text-right">
                  {useIGST ? (
                    <p>{formatCurrency(invoice.igstAmount || 0).replace('₹', '')}</p>
                  ) : (
                    <>
                      <p>{formatCurrency(invoice.cgstAmount || 0).replace('₹', '')}</p>
                      <p>{formatCurrency(invoice.sgstAmount || 0).replace('₹', '')}</p>
                    </>
                  )}
                  <p>0.00</p>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-gray-100">
                <td colSpan={8} className="border p-1 text-right font-bold">Total Amount</td>
                <td className="border p-1 text-right font-bold">{formatCurrency(invoice.totalAmount || 0).replace('₹', '')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {/* Amount in Words */}
        <div className="border-t p-1">
          <p className="font-medium">Amount Chargeable (In words):</p>
          <p className="font-bold">INR {invoice.totalAmountInWords || 'N/A'} Rupees Only</p>
        </div>
        
        {/* Tax Summary Table */}
        <div className="overflow-x-auto border-t">
          <table className="w-full border-collapse tax-summary-table">
            <thead>
              <tr className="bg-gray-50">
                <th rowSpan={2} className="border p-1 text-center">HSN/SAC</th>
                <th rowSpan={2} className="border p-1 text-center">Taxable Value</th>
                {useIGST ? (
                  <th colSpan={2} className="border p-1 text-center">Integrated Tax</th>
                ) : (
                  <>
                    <th colSpan={2} className="border p-1 text-center">Central Tax</th>
                    <th colSpan={2} className="border p-1 text-center">State Tax</th>
                  </>
                )}
                <th rowSpan={2} className="border p-1 text-center">Total Tax Amount</th>
              </tr>
              <tr className="bg-gray-50">
                {useIGST ? (
                  <>
                    <th className="border p-1 text-center">Rate</th>
                    <th className="border p-1 text-center">Amount</th>
                  </>
                ) : (
                  <>
                    <th className="border p-1 text-center">Rate</th>
                    <th className="border p-1 text-center">Amount</th>
                    <th className="border p-1 text-center">Rate</th>
                    <th className="border p-1 text-center">Amount</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {(invoice.items || []).map((item) => {
                const amount = item.amount || 0;
                // Use individual tax rates from the item if available
                const cgstRate = (item as any)?.cgst || 0;
                const sgstRate = (item as any)?.sgst || 0;
                const igstRate = (item as any)?.igst || 0;
                
                const cgstAmount = amount * cgstRate / 100;
                const sgstAmount = amount * sgstRate / 100;
                const igstAmount = amount * igstRate / 100;
                const totalTax = cgstAmount + sgstAmount + igstAmount;
                
                return (
                  <tr key={`tax-${item.id}`}>
                    <td className="border p-1 text-center">{item.hsnCode || 'N/A'}</td>
                    <td className="border p-1 text-center">{formatCurrency(amount).replace('₹', '')}</td>
                    
                    {useIGST ? (
                      <>
                        <td className="border p-1 text-center">{igstRate}%</td>
                        <td className="border p-1 text-center">{formatCurrency(igstAmount).replace('₹', '')}</td>
                      </>
                    ) : (
                      <>
                        <td className="border p-1 text-center">{cgstRate}%</td>
                        <td className="border p-1 text-center">{formatCurrency(cgstAmount).replace('₹', '')}</td>
                        <td className="border p-1 text-center">{sgstRate}%</td>
                        <td className="border p-1 text-center">{formatCurrency(sgstAmount).replace('₹', '')}</td>
                      </>
                    )}
                    
                    <td className="border p-1 text-center">{formatCurrency(totalTax).replace('₹', '')}</td>
                  </tr>
                );
              })}
              
              {/* Tax summary total row */}
              <tr>
                <td className="border p-1 text-center font-bold">Total</td>
                <td className="border p-1 text-center font-bold">{formatCurrency((invoice.totalAmount || 0) - (invoice.totalTaxAmount || 0)).replace('₹', '')}</td>
                
                {useIGST ? (
                  <>
                    <td className="border p-1"></td>
                    <td className="border p-1 text-center font-bold">{formatCurrency(invoice.igstAmount || 0).replace('₹', '')}</td>
                  </>
                ) : (
                  <>
                    <td className="border p-1"></td>
                    <td className="border p-1 text-center font-bold">{formatCurrency(invoice.cgstAmount || 0).replace('₹', '')}</td>
                    <td className="border p-1"></td>
                    <td className="border p-1 text-center font-bold">{formatCurrency(invoice.sgstAmount || 0).replace('₹', '')}</td>
                  </>
                )}
                
                <td className="border p-1 text-center font-bold">{formatCurrency(invoice.totalTaxAmount || 0).replace('₹', '')}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Tax Amount in Words */}
        <div className="border-t p-1">
          <p className="font-medium">Tax Amount (In words):</p>
          <p className="font-bold">INR {invoice.totalTaxAmountInWords || 'N/A'} Rupees Only</p>
        </div>
        
        {/* Bank Details and Declaration */}
        <div className="grid grid-cols-12 mt-2 border-t">
          <div className="col-span-7 p-2">
            <div className="text-sm">
              <p className="font-bold mb-1">Company's Bank Details</p>
              <p><strong>Bank Name:</strong> {bankDetails.bankName || 'N/A'}</p>
              <p><strong>A/C No.:</strong> {bankDetails.accountNumber || 'N/A'}</p>
              <p><strong>Branch:</strong> {bankDetails.branch || 'N/A'}</p>
              <p><strong>IFS Code:</strong> {bankDetails.ifscCode || 'N/A'}</p>
            </div>
            
            <div className="mt-2">
              <p className="font-bold mb-1">Declaration</p>
              <p className="text-sm">
                We declare that this invoice shows the actual price of the goods described 
                and that all particulars are true and correct.
              </p>
            </div>
          </div>
          
          <div className="col-span-5 p-2 text-right">
            <p className="mb-2">for {seller.name}</p>
            <div className="h-12"></div>
            <p className="mt-2">Authorized Signatory</p>
          </div>
        </div>
      </Card>
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice <span className="font-medium">{invoice.invoiceNumber}</span>? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
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

export default InvoiceDetail;
