
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
  
  // Check if we're using IGST or CGST+SGST based on the rates
  const useIGST = invoice.igstRate > 0;
  
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
      
      <Card className="p-6 mb-6" id="invoice-to-print" ref={invoiceRef}>
        <div className="text-center border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold">Tax Invoice</h1>
        </div>
        
        <div className="grid grid-cols-12 border-b">
          <div className="col-span-7 p-3 border-r">
            <div className="mb-4">
              <h2 className="text-lg font-bold">{invoice.seller.name}</h2>
              <p className="whitespace-pre-line text-sm">{invoice.seller.address}</p>
            </div>
            
            <div className="grid grid-cols-2 text-sm gap-1">
              <p><strong>GSTIN:</strong> {invoice.seller.gstin}</p>
              <p><strong>State Name:</strong> {invoice.seller.state}</p>
              <p><strong>Code:</strong> {invoice.seller.stateCode}</p>
              <p><strong>Contact:</strong> {invoice.seller.contact}</p>
              <p><strong>Email:</strong> {invoice.seller.email}</p>
              <p><strong>PAN:</strong> {invoice.seller.pan}</p>
            </div>
          </div>
          
          <div className="col-span-5 p-3">
            <div className="grid grid-cols-2 text-sm gap-3">
              <p><strong>Invoice No.</strong></p>
              <p>{invoice.invoiceNumber}</p>
              
              <p><strong>E-way Bill No.</strong></p>
              <p>{invoice.eWayBillNumber || '-'}</p>
              
              <p><strong>Dated</strong></p>
              <p>{new Date(invoice.date).toLocaleDateString('en-IN')}</p>
              
              <p><strong>Mode/Terms of Payment</strong></p>
              <p>{invoice.modeOfPayment || '-'}</p>
              
              <p><strong>Reference No. & Date</strong></p>
              <p>{invoice.reference || '-'}</p>
              
              <p><strong>Other References</strong></p>
              <p>{invoice.otherReferences || '-'}</p>
              
              <p><strong>Buyer's Order No.</strong></p>
              <p>{invoice.buyerOrderNo || '-'}</p>
              
              <p><strong>Dated</strong></p>
              <p>{invoice.dated || '-'}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-12 border-b">
          <div className="col-span-7 p-3 border-r">
            <h3 className="font-bold mb-2">Buyer (Bill To):</h3>
            <p className="font-medium mb-1">{invoice.buyer.name}</p>
            <p className="text-sm whitespace-pre-line mb-2">{invoice.buyer.address}</p>
            
            <div className="grid grid-cols-2 text-sm gap-1">
              <p><strong>GSTIN:</strong> {invoice.buyer.gstin}</p>
              <p><strong>State:</strong> {invoice.buyer.state}</p>
              <p><strong>Code:</strong> {invoice.buyer.stateCode}</p>
              <p><strong>Place of supply:</strong> {invoice.buyer.state}</p>
            </div>
          </div>
          
          <div className="col-span-5 p-3">
            <div className="grid grid-cols-2 text-sm gap-3">
              <p><strong>Dispatch Document No.</strong></p>
              <p>{invoice.dispatchDocumentNo || '....'}</p>
              
              <p><strong>Delivery Note Date</strong></p>
              <p>{invoice.deliveryNoteDate || new Date(invoice.date).toLocaleDateString('en-IN')}</p>
              
              <p><strong>Dispatched though</strong></p>
              <p>{invoice.dispatchedThrough || '-'}</p>
              
              <p><strong>Destination</strong></p>
              <p>{invoice.destination || '-'}</p>
              
              <p><strong>Bill of Lading/LR-RR No.</strong></p>
              <p>{invoice.billOfLading || '-'}</p>
              
              <p><strong>Motor Vehicle No.</strong></p>
              <p>{invoice.motorVehicleNo || '-'}</p>
              
              <p><strong>Terms of Delivery</strong></p>
              <p>{invoice.termsOfDelivery || '-'}</p>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2 text-left">No.</th>
                <th className="border p-2 text-left">Description of Goods</th>
                <th className="border p-2 text-center">HSN/SAC</th>
                <th className="border p-2 text-center">GST Rate</th>
                <th className="border p-2 text-center">Quantity</th>
                <th className="border p-2 text-center">Rate per Unit</th>
                <th className="border p-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={item.id}>
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2">{item.productName}</td>
                  <td className="border p-2 text-center">{item.hsnCode}</td>
                  <td className="border p-2 text-center">{item.gstRate}%</td>
                  <td className="border p-2 text-center">{Number(item.quantity).toFixed(3)}</td>
                  <td className="border p-2 text-right">{item.price}</td>
                  <td className="border p-2 text-right">{formatCurrency(item.amount).replace('₹', '')}</td>
                </tr>
              ))}
              
              <tr>
                <td colSpan={6} className="border p-2 text-right font-medium">Total</td>
                <td className="border p-2 text-right font-bold">{formatCurrency(invoice.totalAmount - invoice.totalTaxAmount).replace('₹', '')}</td>
              </tr>
              
              {/* Tax calculations */}
              {useIGST ? (
                <tr>
                  <td colSpan={3} className="border p-2 align-top">
                    <div className="text-center">
                      <p>IGST @ {invoice.igstRate}%</p>
                      <p>Round Off</p>
                    </div>
                  </td>
                  <td colSpan={3} className="border p-2 align-top text-right">
                    <div className="text-right">
                      <p>IGST @ {invoice.igstRate}%</p>
                      <p>Round Off</p>
                    </div>
                  </td>
                  <td className="border p-2 text-right">{formatCurrency(invoice.totalTaxAmount).replace('₹', '')}</td>
                </tr>
              ) : (
                <>
                  <tr>
                    <td colSpan={3} rowSpan={3} className="border p-2 align-top">
                      <div className="text-center">
                        <p>CGST @ {invoice.cgstRate}%</p>
                        <p>SGST @ {invoice.sgstRate}%</p>
                        <p>Round Off</p>
                      </div>
                    </td>
                    <td colSpan={3} className="border p-2 align-top text-right">
                      <p>CGST @ {invoice.cgstRate}%</p>
                    </td>
                    <td className="border p-2 text-right">{formatCurrency(invoice.totalTaxAmount / 2).replace('₹', '')}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="border p-2 text-right">
                      <p>SGST @ {invoice.sgstRate}%</p>
                    </td>
                    <td className="border p-2 text-right">{formatCurrency(invoice.totalTaxAmount / 2).replace('₹', '')}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="border p-2 text-right">
                      <p>Round Off</p>
                    </td>
                    <td className="border p-2 text-right">0.00</td>
                  </tr>
                </>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} className="border p-3 text-right font-bold">Total</td>
                <td className="border p-3 text-right font-bold">{formatCurrency(invoice.totalAmount).replace('₹', '')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="border-t py-3 px-2">
          <p className="font-medium">Amount Chargeable (In words)</p>
          <p className="font-bold">Rupees {invoice.totalAmountInWords} Only</p>
        </div>
        
        <div className="overflow-x-auto border-t">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th rowSpan={2} className="border p-2">HSN/SAC</th>
                <th rowSpan={2} className="border p-2">Taxable Value</th>
                {useIGST ? (
                  <th colSpan={2} className="border p-2">Integrated Tax</th>
                ) : (
                  <>
                    <th colSpan={2} className="border p-2">Central Tax</th>
                    <th colSpan={2} className="border p-2">State Tax</th>
                  </>
                )}
                <th rowSpan={2} className="border p-2">Total Tax Amount</th>
              </tr>
              <tr className="bg-gray-50">
                {useIGST ? (
                  <>
                    <th className="border p-2">Rate</th>
                    <th className="border p-2">Amount</th>
                  </>
                ) : (
                  <>
                    <th className="border p-2">Rate</th>
                    <th className="border p-2">Amount</th>
                    <th className="border p-2">Rate</th>
                    <th className="border p-2">Amount</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => {
                const taxableValue = item.amount / (1 + item.gstRate / 100);
                const totalTax = taxableValue * (item.gstRate / 100);
                const centralTaxAmount = useIGST ? 0 : totalTax / 2;
                const stateTaxAmount = useIGST ? 0 : totalTax / 2;
                const igstAmount = useIGST ? totalTax : 0;
                
                return (
                  <tr key={`tax-${item.id}`}>
                    <td className="border p-2 text-center">{item.hsnCode}</td>
                    <td className="border p-2 text-right">{formatCurrency(taxableValue).replace('₹', '')}</td>
                    
                    {useIGST ? (
                      <>
                        <td className="border p-2 text-center">{item.gstRate}%</td>
                        <td className="border p-2 text-right">{formatCurrency(igstAmount).replace('₹', '')}</td>
                      </>
                    ) : (
                      <>
                        <td className="border p-2 text-center">{item.gstRate / 2}%</td>
                        <td className="border p-2 text-right">{formatCurrency(centralTaxAmount).replace('₹', '')}</td>
                        <td className="border p-2 text-center">{item.gstRate / 2}%</td>
                        <td className="border p-2 text-right">{formatCurrency(stateTaxAmount).replace('₹', '')}</td>
                      </>
                    )}
                    
                    <td className="border p-2 text-right">{formatCurrency(totalTax).replace('₹', '')}</td>
                  </tr>
                );
              })}
              
              <tr>
                <td className="border p-2 text-right font-bold">Total</td>
                <td className="border p-2 text-right font-bold">{formatCurrency(invoice.totalAmount - invoice.totalTaxAmount).replace('₹', '')}</td>
                
                {useIGST ? (
                  <>
                    <td className="border p-2"></td>
                    <td className="border p-2 text-right font-bold">{formatCurrency(invoice.totalTaxAmount).replace('₹', '')}</td>
                  </>
                ) : (
                  <>
                    <td className="border p-2"></td>
                    <td className="border p-2 text-right font-bold">{formatCurrency(invoice.totalTaxAmount / 2).replace('₹', '')}</td>
                    <td className="border p-2"></td>
                    <td className="border p-2 text-right font-bold">{formatCurrency(invoice.totalTaxAmount / 2).replace('₹', '')}</td>
                  </>
                )}
                
                <td className="border p-2 text-right font-bold">{formatCurrency(invoice.totalTaxAmount).replace('₹', '')}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="border-t py-3 px-2">
          <p className="font-medium">Tax Amount (In words)</p>
          <p className="font-bold">Rupees {invoice.totalTaxAmountInWords} Only</p>
        </div>
        
        <div className="grid grid-cols-12 mt-4">
          <div className="col-span-7 p-3">
            <div className="text-sm">
              <p className="font-bold mb-1">Company's Bank Details</p>
              <p><strong>Bank Name:</strong> {invoice.bankDetails.bankName}</p>
              <p><strong>A/C No.:</strong> {invoice.bankDetails.accountNumber}</p>
              <p><strong>Branch:</strong> {invoice.bankDetails.branch}</p>
              <p><strong>IFS Code:</strong> {invoice.bankDetails.ifscCode}</p>
            </div>
            
            <div className="mt-6">
              <p className="font-bold mb-2">Declaration</p>
              <p className="text-sm">
                We declare that this invoice shows the actual price of the goods described 
                and that all particulars are true and correct.
              </p>
            </div>
          </div>
          
          <div className="col-span-5 p-3 text-center">
            <p className="mb-3 text-right">for {invoice.seller.name}</p>
            <div className="h-20"></div>
            <p className="mt-4 text-right">Authorized Signatory</p>
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
