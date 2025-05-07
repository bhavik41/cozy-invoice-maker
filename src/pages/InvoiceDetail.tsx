
import React, { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

// CSS for the invoice print
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
    }
    #invoice-to-print .no-print {
      display: none;
    }
    #invoice-to-print table {
      width: 100%;
      border-collapse: collapse;
    }
    #invoice-to-print th, #invoice-to-print td {
      border: 1px solid black;
      padding: 4px;
    }
  }
`;

const InvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInvoice, deleteInvoice } = useAppContext();
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const invoice = id ? getInvoice(id) : null;
  
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

  // Ensure seller and buyer objects exist before accessing their properties
  const seller = invoice.seller || {};
  const buyer = invoice.buyer || {};
  
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
      
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/invoices')} className="no-print">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>
        
        <div className="flex gap-2 no-print">
          <Button variant="outline" asChild>
            <Link to={`/invoices/edit/${invoice.id}`}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Link>
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
        <div className="text-center border-b pb-2 mb-2">
          <h1 className="text-2xl font-bold">Tax Invoice</h1>
        </div>
        
        <div className="grid grid-cols-12 border-b">
          <div className="col-span-7 p-2 border-r flex">
            {seller.logo && (
              <div className="mr-4 flex-shrink-0">
                <img 
                  src={seller.logo} 
                  alt="Company Logo" 
                  className="h-16 w-auto object-contain"
                />
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold">{seller.name || 'Seller'}</h2>
              <p className="whitespace-pre-line text-sm"><strong>Address:</strong> {seller.address || 'N/A'}</p>
              
              <div className="grid grid-cols-2 text-sm gap-1 mt-1">
                <p><strong>GSTIN:</strong> {seller.gstin || 'N/A'}</p>
                <p><strong>State Name:</strong> {seller.state || 'N/A'}</p>
                <p><strong>Code:</strong> {seller.stateCode || 'N/A'}</p>
                <p><strong>Contact:</strong> {seller.contact || 'N/A'}</p>
                <p><strong>Email:</strong> {seller.email || 'N/A'}</p>
                <p><strong>PAN:</strong> {seller.pan || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <div className="col-span-5 p-2">
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b">
                  <td className="py-1 font-semibold">Invoice No.</td>
                  <td className="py-1">{invoice.invoiceNumber || 'N/A'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-1 font-semibold">E-way Bill No.</td>
                  <td className="py-1">{invoice.eWayBillNumber || '....'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-1 font-semibold">Dated</td>
                  <td className="py-1">{formatDisplayDate(invoice.date)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-1 font-semibold">Mode/Terms of Payment</td>
                  <td className="py-1">{invoice.modeOfPayment || '....'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-1 font-semibold">Reference No. & Date</td>
                  <td className="py-1">{invoice.reference || '....'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-1 font-semibold">Other References</td>
                  <td className="py-1">{invoice.otherReferences || '....'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-1 font-semibold">Buyer's Order No.</td>
                  <td className="py-1">{invoice.buyerOrderNo || '....'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-1 font-semibold">Dated</td>
                  <td className="py-1">{invoice.dated || '....'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="grid grid-cols-12 border-b">
          <div className="col-span-7 p-2 border-r">
            <h3 className="font-bold mb-1">Buyer (Bill To):</h3>
            <p className="font-medium mb-1">{buyer.name || 'N/A'}</p>
            <p className="text-sm mb-1"><strong>Address:</strong> {buyer.address || 'N/A'}</p>
            
            <div className="grid grid-cols-2 text-sm gap-1">
              <p><strong>GSTIN:</strong> {buyer.gstin || 'N/A'}</p>
              <p><strong>State:</strong> {buyer.state || 'N/A'}</p>
              <p><strong>Code:</strong> {buyer.stateCode || 'N/A'}</p>
              <p><strong>Place of supply:</strong> {buyer.state || 'N/A'}</p>
            </div>
          </div>
          
          <div className="col-span-5 p-2">
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b">
                  <td className="py-1 font-semibold">Dispatch Document No.</td>
                  <td className="py-1">{invoice.dispatchDocumentNo || '....'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-1 font-semibold">Delivery Note Date</td>
                  <td className="py-1">{invoice.deliveryNoteDate || formatDisplayDate(invoice.date)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-1 font-semibold">Dispatched through</td>
                  <td className="py-1">{invoice.dispatchedThrough || '....'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-1 font-semibold">Destination</td>
                  <td className="py-1">{invoice.destination || '....'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-1 font-semibold">Bill of Lading/LR-RR No.</td>
                  <td className="py-1">{invoice.billOfLading || '....'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-1 font-semibold">Motor Vehicle No.</td>
                  <td className="py-1">{invoice.motorVehicleNo || '....'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-1 font-semibold">Terms of Delivery</td>
                  <td className="py-1">{invoice.termsOfDelivery || '....'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-1 text-left">No.</th>
                <th className="border p-1 text-left">Description of Goods</th>
                <th className="border p-1 text-center">HSN/SAC</th>
                <th className="border p-1 text-center">GST Rate</th>
                <th className="border p-1 text-center">Quantity</th>
                <th className="border p-1 text-center">Rate per Unit</th>
                <th className="border p-1 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.items || []).map((item, index) => (
                <tr key={item.id}>
                  <td className="border p-1 text-center">{index + 1}</td>
                  <td className="border p-1">{item.productName || 'N/A'}</td>
                  <td className="border p-1 text-center">{item.hsnCode || 'N/A'}</td>
                  <td className="border p-1 text-center">{item.gstRate || 0}%</td>
                  <td className="border p-1 text-center">{Number(item.quantity || 0).toFixed(3)}</td>
                  <td className="border p-1 text-right">{item.price || 0}</td>
                  <td className="border p-1 text-right">{formatCurrency(item.amount || 0).replace('₹', '')}</td>
                </tr>
              ))}
              
              {/* Empty rows to match template */}
              {Array(Math.max(0, 5 - (invoice.items || []).length)).fill(0).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td className="border p-1">&nbsp;</td>
                  <td className="border p-1">&nbsp;</td>
                  <td className="border p-1">&nbsp;</td>
                  <td className="border p-1">&nbsp;</td>
                  <td className="border p-1">&nbsp;</td>
                  <td className="border p-1">&nbsp;</td>
                  <td className="border p-1">&nbsp;</td>
                </tr>
              ))}
              
              <tr>
                <td colSpan={6} className="border p-1 text-right font-medium">Total</td>
                <td className="border p-1 text-right font-bold">{formatCurrency((invoice.totalAmount || 0) - (invoice.totalTaxAmount || 0)).replace('₹', '')}</td>
              </tr>
              
              {/* Tax calculations */}
              {useIGST ? (
                <tr>
                  <td colSpan={3} className="border p-1 text-center">
                    <p>IGST @ {invoice.igstRate || 0}%</p>
                    <p>Round Off</p>
                  </td>
                  <td colSpan={3} className="border p-1 align-top text-right">
                    <p>IGST @ {invoice.igstRate || 0}%</p>
                    <p>Round Off</p>
                  </td>
                  <td className="border p-1 text-right">{formatCurrency(invoice.totalTaxAmount || 0).replace('₹', '')}</td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={3} className="border p-1 text-center">
                    <p>CGST @ {invoice.cgstRate || 0}%</p>
                    <p>SGST @ {invoice.sgstRate || 0}%</p>
                    <p>Round Off</p>
                  </td>
                  <td colSpan={3} className="border p-1 text-right">
                    <p>CGST @ {invoice.cgstRate || 0}%</p>
                    <p>SGST @ {invoice.sgstRate || 0}%</p>
                    <p>Round Off</p>
                  </td>
                  <td className="border p-1 text-right">{formatCurrency(invoice.totalTaxAmount || 0).replace('₹', '')}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} className="border p-2 text-right font-bold">Total</td>
                <td className="border p-2 text-right font-bold">{formatCurrency(invoice.totalAmount || 0).replace('₹', '')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="border-t p-2">
          <p className="font-medium">Amount Chargeable (In words)</p>
          <p className="font-bold">Rupees {invoice.totalAmountInWords || 'N/A'} Only</p>
        </div>
        
        <div className="overflow-x-auto border-t">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th rowSpan={2} className="border p-1">HSN/SAC</th>
                <th rowSpan={2} className="border p-1">Taxable Value</th>
                {useIGST ? (
                  <th colSpan={2} className="border p-1">Integrated Tax</th>
                ) : (
                  <>
                    <th colSpan={2} className="border p-1">Central Tax</th>
                    <th colSpan={2} className="border p-1">State Tax</th>
                  </>
                )}
                <th rowSpan={2} className="border p-1">Total Tax Amount</th>
              </tr>
              <tr className="bg-gray-50">
                {useIGST ? (
                  <>
                    <th className="border p-1">Rate</th>
                    <th className="border p-1">Amount</th>
                  </>
                ) : (
                  <>
                    <th className="border p-1">Rate</th>
                    <th className="border p-1">Amount</th>
                    <th className="border p-1">Rate</th>
                    <th className="border p-1">Amount</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {(invoice.items || []).map((item) => {
                const gstRate = item.gstRate || 0;
                const amount = item.amount || 0;
                const taxableValue = amount / (1 + gstRate / 100);
                const totalTax = taxableValue * (gstRate / 100);
                const centralTaxAmount = useIGST ? 0 : totalTax / 2;
                const stateTaxAmount = useIGST ? 0 : totalTax / 2;
                const igstAmount = useIGST ? totalTax : 0;
                
                return (
                  <tr key={`tax-${item.id}`}>
                    <td className="border p-1 text-center">{item.hsnCode || 'N/A'}</td>
                    <td className="border p-1 text-right">{formatCurrency(taxableValue).replace('₹', '')}</td>
                    
                    {useIGST ? (
                      <>
                        <td className="border p-1 text-center">{gstRate}%</td>
                        <td className="border p-1 text-right">{formatCurrency(igstAmount).replace('₹', '')}</td>
                      </>
                    ) : (
                      <>
                        <td className="border p-1 text-center">{gstRate / 2}%</td>
                        <td className="border p-1 text-right">{formatCurrency(centralTaxAmount).replace('₹', '')}</td>
                        <td className="border p-1 text-center">{gstRate / 2}%</td>
                        <td className="border p-1 text-right">{formatCurrency(stateTaxAmount).replace('₹', '')}</td>
                      </>
                    )}
                    
                    <td className="border p-1 text-right">{formatCurrency(totalTax).replace('₹', '')}</td>
                  </tr>
                );
              })}
              
              <tr>
                <td className="border p-1 text-right font-bold">Total</td>
                <td className="border p-1 text-right font-bold">{formatCurrency((invoice.totalAmount || 0) - (invoice.totalTaxAmount || 0)).replace('₹', '')}</td>
                
                {useIGST ? (
                  <>
                    <td className="border p-1"></td>
                    <td className="border p-1 text-right font-bold">{formatCurrency(invoice.totalTaxAmount || 0).replace('₹', '')}</td>
                  </>
                ) : (
                  <>
                    <td className="border p-1"></td>
                    <td className="border p-1 text-right font-bold">{formatCurrency((invoice.totalTaxAmount || 0) / 2).replace('₹', '')}</td>
                    <td className="border p-1"></td>
                    <td className="border p-1 text-right font-bold">{formatCurrency((invoice.totalTaxAmount || 0) / 2).replace('₹', '')}</td>
                  </>
                )}
                
                <td className="border p-1 text-right font-bold">{formatCurrency(invoice.totalTaxAmount || 0).replace('₹', '')}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="border-t p-2">
          <p className="font-medium">Tax Amount (In words)</p>
          <p className="font-bold">Rupees {invoice.totalTaxAmountInWords || 'N/A'} Only</p>
        </div>
        
        <div className="grid grid-cols-12 mt-2 border-t">
          <div className="col-span-7 p-2">
            <div className="text-sm">
              <p className="font-bold mb-1">Company's Bank Details</p>
              <p><strong>Bank Name:</strong> {bankDetails.bankName || 'N/A'}</p>
              <p><strong>A/C No.:</strong> {bankDetails.accountNumber || 'N/A'}</p>
              <p><strong>Branch:</strong> {bankDetails.branch || 'N/A'}</p>
              <p><strong>IFS Code:</strong> {bankDetails.ifscCode || 'N/A'}</p>
            </div>
            
            <div className="mt-4">
              <p className="font-bold mb-1">Declaration</p>
              <p className="text-sm">
                We declare that this invoice shows the actual price of the goods described 
                and that all particulars are true and correct.
              </p>
            </div>
          </div>
          
          <div className="col-span-5 p-2 text-right">
            <p className="mb-2">for {seller.name || 'Company'}</p>
            <div className="h-16"></div>
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
