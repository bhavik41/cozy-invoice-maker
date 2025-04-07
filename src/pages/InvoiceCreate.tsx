
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

    setInvoiceItems([...invoiceItems, newItem]);
  };

  const removeItem = (id: string) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id));
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
            updatedItem.hsnCode = selectedProduct.hsnCode;
            updatedItem.gstRate = selectedProduct.gstRate;
            updatedItem.price = selectedProduct.price;
            updatedItem.amount = updatedItem.quantity * selectedProduct.price;
          }
        }
        
        // If changing quantity or price, recalculate amount
        if (field === 'quantity' || field === 'price') {
          updatedItem.amount = updatedItem.quantity * updatedItem.price;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setInvoiceItems(updatedItems);
  };

  // Calculate totals whenever invoice items change
  useEffect(() => {
    const amount = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
    setTotalAmount(amount);
    
    const taxAmount = invoiceItems.reduce((sum, item) => {
      return sum + (item.amount * item.gstRate / 100);
    }, 0);
    setTotalTaxAmount(taxAmount);
  }, [invoiceItems]);

  const onSubmit = (values: InvoiceFormValues) => {
    if (!currentSeller) {
      toast.error('Please set a seller in Settings before creating an invoice.');
      return;
    }

    if (invoiceItems.length === 0) {
      toast.error('Please add at least one item to the invoice.');
      return;
    }

    // Find selected buyer
    const buyer = customers.find(c => c.id === values.buyerId);
    if (!buyer) {
      toast.error('Selected customer not found.');
      return;
    }

    // Convert total amounts to words (placeholder for actual implementation)
    const totalAmountInWords = `${totalAmount} Rupees Only`;
    const totalTaxAmountInWords = `${totalTaxAmount} Rupees Only`;

    const newInvoice = {
      id: uuidv4(),
      ...values,
      items: invoiceItems,
      sellerId: currentSeller.id,
      seller: currentSeller,
      buyer,
      buyerId: buyer.id,
      cgstRate: 0, // These would be calculated based on item GST rates
      sgstRate: 0,
      igstRate: 0,
      totalAmount,
      totalTaxAmount,
      totalAmountInWords,
      totalTaxAmountInWords,
      bankDetails: {
        bankName: '',
        accountNumber: '',
        branch: '',
        ifscCode: '',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addInvoice(newInvoice);
    toast.success('Invoice created successfully!');
    navigate('/invoices');
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
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
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
              
              {/* Additional Fields (Collapsible) */}
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
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-2">
                          <Input
                            value={item.hsnCode}
                            onChange={(e) => updateItem(item.id, 'hsnCode', e.target.value)}
                            disabled
                          />
                        </div>
                        
                        <div className="col-span-1">
                          <Input
                            value={item.gstRate}
                            type="number"
                            onChange={(e) => updateItem(item.id, 'gstRate', parseFloat(e.target.value))}
                            disabled
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <Input
                            value={item.quantity}
                            type="number"
                            min="1"
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value, 10))}
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <Input
                            value={item.price}
                            type="number"
                            min="0"
                            step="0.01"
                            onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))}
                          />
                        </div>
                        
                        <div className="col-span-1">
                          <Input
                            value={item.amount}
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
                  <div className="flex justify-between">
                    <span className="font-medium">GST:</span>
                    <span>{formatCurrency(totalTaxAmount)}</span>
                  </div>
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
