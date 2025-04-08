
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { ArrowLeft, CalendarIcon, Plus, Trash2 } from 'lucide-react';

import { useAppContext } from '@/context/AppContext';
import { formatCurrency, generateId } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { InvoiceItem, Customer } from '@/types';
import { cn } from '@/lib/utils';

const InvoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, { message: 'Invoice number is required' }),
  date: z.date({ required_error: 'Date is required' }),
  buyerId: z.string().min(1, { message: 'Customer is required' }),
  eWayBillNumber: z.string().optional(),
  deliveryNote: z.string().optional(),
  modeOfPayment: z.string().optional(),
  reference: z.string().optional(),
  otherReferences: z.string().optional(),
  buyerOrderNo: z.string().optional(),
  dated: z.string().optional(),
  dispatchDocumentNo: z.string().optional(),
  deliveryNoteDate: z.string().optional(),
  dispatchedThrough: z.string().optional(),
  destination: z.string().optional(),
  billOfLading: z.string().optional(),
  motorVehicleNo: z.string().optional(),
  termsOfDelivery: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof InvoiceFormSchema>;

const InvoiceCreate = () => {
  const navigate = useNavigate();
  const { customers, products, addInvoice, currentSeller, getNextInvoiceNumber, getProduct } = useAppContext();
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalTaxAmount, setTotalTaxAmount] = useState(0);
  const [cgstAmount, setCgstAmount] = useState(0);
  const [sgstAmount, setSgstAmount] = useState(0);
  const [igstAmount, setIgstAmount] = useState(0);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('');

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(InvoiceFormSchema),
    defaultValues: {
      invoiceNumber: getNextInvoiceNumber(),
      date: new Date(),
      eWayBillNumber: '',
      deliveryNote: '',
      modeOfPayment: '',
      reference: '',
      otherReferences: '',
      buyerOrderNo: '',
      dated: '',
      dispatchDocumentNo: '',
      deliveryNoteDate: '',
      dispatchedThrough: '',
      destination: '',
      billOfLading: '',
      motorVehicleNo: '',
      termsOfDelivery: '',
    },
  });

  // Handle buyer selection change
  const handleBuyerChange = (buyerId: string) => {
    form.setValue('buyerId', buyerId);
    setSelectedBuyerId(buyerId);
    recalculateTaxes(invoiceItems, buyerId);
  };

  const addItem = () => {
    if (products.length === 0) {
      toast.error('No products available. Please add products first.');
      return;
    }

    const newItem: InvoiceItem = {
      id: generateId(),
      productId: '',
      productName: '',
      hsnCode: '',
      gstRate: 0,
      quantity: 1,
      price: 0,
      amount: 0
    };

    const updatedItems = [...invoiceItems, newItem];
    setInvoiceItems(updatedItems);
    recalculateTaxes(updatedItems, selectedBuyerId);
  };

  const removeItem = (id: string) => {
    const updatedItems = invoiceItems.filter(item => item.id !== id);
    setInvoiceItems(updatedItems);
    recalculateTaxes(updatedItems, selectedBuyerId);
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const updatedItems = invoiceItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // If changing product, update related fields
        if (field === 'productId') {
          const selectedProduct = getProduct(value);
          if (selectedProduct) {
            updatedItem.productName = selectedProduct.name;
            updatedItem.hsnCode = selectedProduct.hsnCode || '';
            updatedItem.gstRate = selectedProduct.gstRate || 0;
            updatedItem.price = selectedProduct.price || 0;
            updatedItem.amount = updatedItem.quantity * (selectedProduct.price || 0);
          }
        }
        
        // If changing quantity or price, recalculate amount
        if (field === 'quantity' || field === 'price') {
          updatedItem.amount = parseFloat((updatedItem.quantity * updatedItem.price).toFixed(2));
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setInvoiceItems(updatedItems);
    recalculateTaxes(updatedItems, selectedBuyerId);
  };

  // Recalculate taxes and total based on items
  const recalculateTaxes = (items: InvoiceItem[], buyerId: string) => {
    const amount = parseFloat(items.reduce((sum, item) => sum + (item.amount || 0), 0).toFixed(2));
    setTotalAmount(amount);
    
    let totalTax = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    
    // Split tax calculations based on whether customer is in same state as seller
    items.forEach(item => {
      const itemTaxAmount = parseFloat((item.amount * item.gstRate / 100).toFixed(2));
      totalTax += itemTaxAmount;
      
      // Determine if we need to apply IGST or CGST+SGST
      if (buyerId && currentSeller) {
        const buyer = customers.find(c => c.id === buyerId);
        if (buyer && buyer.stateCode === currentSeller.stateCode) {
          cgst += parseFloat((itemTaxAmount / 2).toFixed(2));
          sgst += parseFloat((itemTaxAmount / 2).toFixed(2));
        } else {
          igst += itemTaxAmount;
        }
      }
    });
    
    setTotalTaxAmount(parseFloat(totalTax.toFixed(2)));
    setCgstAmount(parseFloat(cgst.toFixed(2)));
    setSgstAmount(parseFloat(sgst.toFixed(2)));
    setIgstAmount(parseFloat(igst.toFixed(2)));
  };

  const onSubmit = (values: InvoiceFormValues) => {
    if (!currentSeller) {
      toast.error('Please set a seller in Settings before creating an invoice.');
      return;
    }

    if (invoiceItems.length === 0) {
      toast.error('Please add at least one item to the invoice.');
      return;
    }
    
    // Check if any item is missing product selection
    const missingProductItem = invoiceItems.find(item => !item.productId);
    if (missingProductItem) {
      toast.error('Please select a product for all items.');
      return;
    }

    // Find selected buyer
    const buyer = customers.find(c => c.id === values.buyerId);
    if (!buyer) {
      toast.error('Selected customer not found.');
      return;
    }

    // Calculate GST rates
    const cgstRate = buyer.stateCode === currentSeller.stateCode ? 
      Math.max(...invoiceItems.map(item => item.gstRate / 2)) : 0;
    const sgstRate = cgstRate;
    const igstRate = buyer.stateCode !== currentSeller.stateCode ? 
      Math.max(...invoiceItems.map(item => item.gstRate)) : 0;

    // Convert total amounts to words - placeholder for now
    const totalAmountInWords = `${totalAmount + totalTaxAmount} Rupees Only`;
    const totalTaxAmountInWords = `${totalTaxAmount} Rupees Only`;

    const newInvoice = {
      id: uuidv4(),
      invoiceNumber: values.invoiceNumber,
      eWayBillNumber: values.eWayBillNumber || '',
      date: values.date,
      deliveryNote: values.deliveryNote || '',
      modeOfPayment: values.modeOfPayment || '',
      reference: values.reference || '',
      otherReferences: values.otherReferences || '',
      buyerOrderNo: values.buyerOrderNo || '',
      dated: values.dated || '',
      dispatchDocumentNo: values.dispatchDocumentNo || '',
      deliveryNoteDate: values.deliveryNoteDate || '',
      dispatchedThrough: values.dispatchedThrough || '',
      destination: values.destination || '',
      billOfLading: values.billOfLading || '',
      motorVehicleNo: values.motorVehicleNo || '',
      termsOfDelivery: values.termsOfDelivery || '',
      items: invoiceItems,
      sellerId: currentSeller.id,
      seller: currentSeller,
      buyer,
      buyerId: buyer.id,
      cgstRate,
      sgstRate,
      igstRate,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalAmount,
      totalTaxAmount,
      totalAmountInWords,
      totalTaxAmountInWords,
      grandTotal: totalAmount + totalTaxAmount,
      bankDetails: {
        bankName: currentSeller.bankDetails?.bankName || '',
        accountNumber: currentSeller.bankDetails?.accountNumber || '',
        branch: currentSeller.bankDetails?.branch || '',
        ifscCode: currentSeller.bankDetails?.ifscCode || '',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      addInvoice(newInvoice);
      toast.success('Invoice created successfully!');
      navigate('/invoices');
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/invoices')} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-semibold">Create New Invoice</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Invoice Number Field */}
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Date Field */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Customer Field */}
                <FormField
                  control={form.control}
                  name="buyerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select
                        onValueChange={(value) => handleBuyerChange(value)}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.length === 0 ? (
                            <SelectItem value="no-customers" disabled>
                              No customers available
                            </SelectItem>
                          ) : (
                            customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* E-Way Bill Number Field */}
                <FormField
                  control={form.control}
                  name="eWayBillNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-Way Bill Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Additional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deliveryNote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Note</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="modeOfPayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mode of Payment</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="otherReferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other References</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Invoice Items */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Items</h3>
                  <Button type="button" onClick={addItem} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                
                {invoiceItems.length === 0 ? (
                  <div className="text-center py-8 border rounded-md">
                    <p className="text-gray-500">No items added yet</p>
                    <Button type="button" onClick={addItem} variant="outline" className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-500 px-2">
                      <div className="col-span-3">Product</div>
                      <div className="col-span-2">HSN Code</div>
                      <div className="col-span-1">GST%</div>
                      <div className="col-span-2">Quantity</div>
                      <div className="col-span-2">Price</div>
                      <div className="col-span-1">Amount</div>
                      <div className="col-span-1"></div>
                    </div>
                    
                    {invoiceItems.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-3">
                          <Select
                            value={item.productId}
                            onValueChange={(value) => updateItem(item.id, 'productId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.length === 0 ? (
                                <SelectItem value="no-products" disabled>
                                  No products available
                                </SelectItem>
                              ) : (
                                products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-2">
                          <Input
                            value={item.hsnCode || ''}
                            onChange={(e) => updateItem(item.id, 'hsnCode', e.target.value)}
                            disabled
                          />
                        </div>
                        
                        <div className="col-span-1">
                          <Input
                            value={item.gstRate || 0}
                            type="number"
                            onChange={(e) => updateItem(item.id, 'gstRate', parseFloat(e.target.value))}
                            disabled
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <Input
                            value={item.quantity || 0}
                            type="number"
                            min="0.001"
                            step="0.001"
                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))}
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <Input
                            value={item.price || 0}
                            type="number"
                            min="0"
                            step="0.01"
                            onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))}
                          />
                        </div>
                        
                        <div className="col-span-1">
                          <Input
                            value={item.amount || 0}
                            disabled
                          />
                        </div>
                        
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Totals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <FormField
                    control={form.control}
                    name="termsOfDelivery"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms of Delivery</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal:</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                  
                  {cgstAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="font-medium">CGST @ {cgstAmount > 0 ? (cgstAmount / totalAmount * 100).toFixed(1) : 0}%:</span>
                      <span>{formatCurrency(cgstAmount)}</span>
                    </div>
                  )}
                  
                  {sgstAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="font-medium">SGST @ {sgstAmount > 0 ? (sgstAmount / totalAmount * 100).toFixed(1) : 0}%:</span>
                      <span>{formatCurrency(sgstAmount)}</span>
                    </div>
                  )}
                  
                  {igstAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="font-medium">IGST @ {igstAmount > 0 ? (igstAmount / totalAmount * 100).toFixed(1) : 0}%:</span>
                      <span>{formatCurrency(igstAmount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(totalAmount + totalTaxAmount)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/invoices')}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Create Invoice
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceCreate;
