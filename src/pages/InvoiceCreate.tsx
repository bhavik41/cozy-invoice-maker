import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { ArrowLeft, CalendarIcon, Plus, Trash2, UserPlus } from 'lucide-react';

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
import { Customer, InvoiceItem } from '@/types';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

interface InvoiceCreateProps {
  isEditMode?: boolean;
}

const InvoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, { message: 'Invoice number is required' }),
  date: z.date({ required_error: 'Date is required' }),
  buyerId: z.string().optional(),
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
  
  buyerName: z.string().optional(),
  buyerAddress: z.string().optional(),
  buyerGstin: z.string().optional(),
  buyerState: z.string().optional(),
  buyerStateCode: z.string().optional(),
  buyerContact: z.string().optional(),
  buyerEmail: z.string().optional(),
  buyerPan: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof InvoiceFormSchema>;

const InvoiceCreate: React.FC<InvoiceCreateProps> = ({ isEditMode = false }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { customers, products, addInvoice, currentSeller, getNextInvoiceNumber, getProduct, getCustomer, getInvoice } = useAppContext();
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalTaxAmount, setTotalTaxAmount] = useState(0);
  const [cgstAmount, setCgstAmount] = useState(0);
  const [sgstAmount, setSgstAmount] = useState(0);
  const [igstAmount, setIgstAmount] = useState(0);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('');
  const [buyerType, setBuyerType] = useState<'existing' | 'new'>('existing');
  const [useExistingBuyer, setUseExistingBuyer] = useState(true);
  const [invoiceId, setInvoiceId] = useState<string | undefined>(undefined);

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
      
      buyerName: '',
      buyerAddress: '',
      buyerGstin: '',
      buyerState: '',
      buyerStateCode: '',
      buyerContact: '',
      buyerEmail: '',
      buyerPan: '',
    },
  });

  // Load invoice data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const invoice = getInvoice(id);
      if (invoice) {
        console.log('Loading invoice for edit:', invoice);
        console.log('Invoice useExistingBuyer:', invoice.useExistingBuyer);
        
        setInvoiceId(invoice.id);
        
        // Basic invoice fields
        form.setValue('invoiceNumber', invoice.invoiceNumber);
        form.setValue('date', new Date(invoice.date));
        form.setValue('eWayBillNumber', invoice.eWayBillNumber || '');
        form.setValue('deliveryNote', invoice.deliveryNote || '');
        form.setValue('modeOfPayment', invoice.modeOfPayment || '');
        form.setValue('reference', invoice.reference || '');
        form.setValue('otherReferences', invoice.otherReferences || '');
        form.setValue('buyerOrderNo', invoice.buyerOrderNo || '');
        form.setValue('dated', invoice.dated || '');
        form.setValue('dispatchDocumentNo', invoice.dispatchDocumentNo || '');
        form.setValue('deliveryNoteDate', invoice.deliveryNoteDate || '');
        form.setValue('dispatchedThrough', invoice.dispatchedThrough || '');
        form.setValue('destination', invoice.destination || '');
        form.setValue('billOfLading', invoice.billOfLading || '');
        form.setValue('motorVehicleNo', invoice.motorVehicleNo || '');
        form.setValue('termsOfDelivery', invoice.termsOfDelivery || '');
        
        // Customer/buyer information - Use the useExistingBuyer field from the invoice
        if (invoice.useExistingBuyer) {
          console.log('Setting up existing customer mode');
          setUseExistingBuyer(true);
          setBuyerType('existing');
          if (invoice.buyerId) {
            setSelectedBuyerId(invoice.buyerId);
            form.setValue('buyerId', invoice.buyerId);
            // Auto-populate buyer fields from existing customer
            const customer = getCustomer(invoice.buyerId);
            if (customer) {
              form.setValue('buyerName', customer.name);
              form.setValue('buyerAddress', customer.address);
              form.setValue('buyerGstin', customer.gstin);
              form.setValue('buyerState', customer.state);
              form.setValue('buyerStateCode', customer.stateCode);
              form.setValue('buyerContact', customer.contact);
              form.setValue('buyerEmail', customer.email || '');
              form.setValue('buyerPan', customer.pan || '');
            }
          }
        } else {
          console.log('Setting up one-time customer mode');
          setUseExistingBuyer(false);
          setBuyerType('new');
          // Load one-time customer data
          form.setValue('buyerName', invoice.buyerName || '');
          form.setValue('buyerAddress', invoice.buyerAddress || '');
          form.setValue('buyerGstin', invoice.buyerGstin || '');
          form.setValue('buyerState', invoice.buyerState || '');
          form.setValue('buyerStateCode', invoice.buyerStateCode || '');
          form.setValue('buyerContact', invoice.buyerContact || '');
          form.setValue('buyerEmail', invoice.buyerEmail || '');
          form.setValue('buyerPan', invoice.buyerPan || '');
        }
        
        // Load invoice items
        if (invoice.items && Array.isArray(invoice.items)) {
          setInvoiceItems(invoice.items);
          recalculateTaxes(invoice.items, invoice.buyerId || '');
        }
      } else {
        toast.error('Invoice not found');
        navigate('/invoices');
      }
    }
  }, [isEditMode, id, getInvoice]);

  const toggleBuyerType = (useExisting: boolean) => {
    setUseExistingBuyer(useExisting);
    setBuyerType(useExisting ? 'existing' : 'new');
    
    if (useExisting) {
      form.setValue('buyerName', '');
      form.setValue('buyerAddress', '');
      form.setValue('buyerGstin', '');
      form.setValue('buyerState', '');
      form.setValue('buyerStateCode', '');
      form.setValue('buyerContact', '');
      form.setValue('buyerEmail', '');
      form.setValue('buyerPan', '');
    } else {
      form.setValue('buyerId', '');
      setSelectedBuyerId('');
    }
  };

  const handleBuyerChange = (buyerId: string) => {
    form.setValue('buyerId', buyerId);
    setSelectedBuyerId(buyerId);
    
    const customer = getCustomer(buyerId);
    if (customer) {
      form.setValue('buyerName', customer.name);
      form.setValue('buyerAddress', customer.address);
      form.setValue('buyerGstin', customer.gstin);
      form.setValue('buyerState', customer.state);
      form.setValue('buyerStateCode', customer.stateCode);
      form.setValue('buyerContact', customer.contact);
      form.setValue('buyerEmail', customer.email || '');
      form.setValue('buyerPan', customer.pan || '');
    }
    
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
        
        if (field === 'productId') {
          const selectedProduct = getProduct(value);
          if (selectedProduct) {
            updatedItem.productName = selectedProduct.name;
            updatedItem.hsnCode = selectedProduct.hsnCode || '';
            // Use individual tax rates if available, otherwise use total gstRate
            updatedItem.gstRate = selectedProduct.gstRate || 0;
            updatedItem.cgst = selectedProduct.cgst || 0;
            updatedItem.sgst = selectedProduct.sgst || 0;
            updatedItem.igst = selectedProduct.igst || 0;
            updatedItem.price = selectedProduct.price || 0;
            updatedItem.amount = updatedItem.quantity * (selectedProduct.price || 0);
          }
        }
        
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

  const recalculateTaxes = (items: InvoiceItem[], buyerId: string) => {
    const amount = parseFloat(items.reduce((sum, item) => sum + (item.amount || 0), 0).toFixed(2));
    setTotalAmount(amount);
    
    let totalTax = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    
    items.forEach(item => {
      // Use individual tax rates from the product if available
      const itemCgst = (item.cgst || 0) * item.amount / 100;
      const itemSgst = (item.sgst || 0) * item.amount / 100;
      const itemIgst = (item.igst || 0) * item.amount / 100;
      
      // Add individual tax amounts
      cgst += itemCgst;
      sgst += itemSgst;
      igst += itemIgst;
      
      // Total tax is sum of all three
      totalTax += itemCgst + itemSgst + itemIgst;
    });
    
    setTotalTaxAmount(parseFloat(totalTax.toFixed(2)));
    setCgstAmount(parseFloat(cgst.toFixed(2)));
    setSgstAmount(parseFloat(sgst.toFixed(2)));
    setIgstAmount(parseFloat(igst.toFixed(2)));
  };

  useEffect(() => {
    if (!useExistingBuyer) {
      recalculateTaxes(invoiceItems, '');
    }
  }, [form.watch('buyerStateCode')]);

  const onSubmit = (values: InvoiceFormValues) => {
    if (!currentSeller) {
      toast.error('Please set a seller in Settings before creating an invoice.');
      return;
    }

    if (invoiceItems.length === 0) {
      toast.error('Please add at least one item to the invoice.');
      return;
    }
    
    const missingProductItem = invoiceItems.find(item => !item.productId);
    if (missingProductItem) {
      toast.error('Please select a product for all items.');
      return;
    }

    if (useExistingBuyer && !values.buyerId) {
      toast.error('Please select a customer.');
      return;
    }
    
    if (!useExistingBuyer && !values.buyerName) {
      toast.error('Please enter customer name.');
      return;
    }

    let buyer: any;
    let buyerId: string | undefined;
    
    if (useExistingBuyer && values.buyerId) {
      const existingBuyer = getCustomer(values.buyerId);
      if (!existingBuyer) {
        toast.error('Selected customer not found.');
        return;
      }
      buyer = existingBuyer;
      buyerId = existingBuyer.id;
    }

    const buyerStateCode = useExistingBuyer ? 
      buyer?.stateCode : 
      values.buyerStateCode;

    const cgstRate = buyerStateCode === currentSeller.stateCode ? 
      Math.max(...invoiceItems.map(item => item.gstRate / 2), 0) : 0;
    const sgstRate = cgstRate;
    const igstRate = buyerStateCode !== currentSeller.stateCode ? 
      Math.max(...invoiceItems.map(item => item.gstRate), 0) : 0;

    const totalAmountInWords = `${Math.round(totalAmount + totalTaxAmount)} Rupees Only`;
    const totalTaxAmountInWords = `${Math.round(totalTaxAmount)} Rupees Only`;

    const newInvoice = {
      id: isEditMode && invoiceId ? invoiceId : uuidv4(),
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
      
      useExistingBuyer,
      buyerId,
      buyer,
      buyerName: useExistingBuyer ? buyer?.name : values.buyerName,
      buyerAddress: useExistingBuyer ? buyer?.address : values.buyerAddress,
      buyerGstin: useExistingBuyer ? buyer?.gstin : values.buyerGstin,
      buyerState: useExistingBuyer ? buyer?.state : values.buyerState,
      buyerStateCode: useExistingBuyer ? buyer?.stateCode : values.buyerStateCode,
      buyerContact: useExistingBuyer ? buyer?.contact : values.buyerContact,
      buyerEmail: useExistingBuyer ? buyer?.email : values.buyerEmail,
      buyerPan: useExistingBuyer ? buyer?.pan : values.buyerPan,
      
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
      
      createdAt: isEditMode ? new Date() : new Date(),
      updatedAt: new Date(),
    };

    try {
      addInvoice(newInvoice);
      toast.success(isEditMode ? 'Invoice updated successfully!' : 'Invoice created successfully!');
      navigate('/invoices');
    } catch (error) {
      console.error('Error creating/updating invoice:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} invoice. Please try again.`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/invoices')} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-semibold">{isEditMode ? 'Edit Invoice' : 'Create New Invoice'}</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Invoice' : 'Invoice Details'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              
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
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference No. & Date</FormLabel>
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
                
                <FormField
                  control={form.control}
                  name="buyerOrderNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buyer's Order No.</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dated"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dated</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dispatchDocumentNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dispatch Document No.</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="deliveryNoteDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Note Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dispatchedThrough"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dispatched Through</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="billOfLading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bill of Landing/LR-RR No.</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="motorVehicleNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motor Vehicle No.</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="border p-4 rounded-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Buyer Details</h3>
                  <div className="flex items-center space-x-2">
                    <span className={!useExistingBuyer ? "font-medium" : "text-gray-500"}>One-time Customer</span>
                    <Switch
                      checked={useExistingBuyer}
                      onCheckedChange={toggleBuyerType}
                      aria-label="Toggle buyer type"
                    />
                    <span className={useExistingBuyer ? "font-medium" : "text-gray-500"}>Existing Customer</span>
                  </div>
                </div>
                
                {useExistingBuyer ? (
                  <>
                    <FormField
                      control={form.control}
                      name="buyerId"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Customer</FormLabel>
                          <Select
                            onValueChange={(value) => handleBuyerChange(value)}
                            value={field.value}
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
                    
                    {selectedBuyerId && (
                      <div className="mt-4 grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">Name:</p>
                          <p className="font-medium">{form.getValues('buyerName')}</p>
                          
                          <p className="text-sm text-gray-500">Address:</p>
                          <p className="font-medium">{form.getValues('buyerAddress')}</p>
                          
                          <p className="text-sm text-gray-500">GSTIN:</p>
                          <p className="font-medium">{form.getValues('buyerGstin')}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">State:</p>
                          <p className="font-medium">{form.getValues('buyerState')} ({form.getValues('buyerStateCode')})</p>
                          
                          <p className="text-sm text-gray-500">Contact:</p>
                          <p className="font-medium">{form.getValues('buyerContact')}</p>
                          
                          <p className="text-sm text-gray-500">Email:</p>
                          <p className="font-medium">{form.getValues('buyerEmail') || 'N/A'}</p>
                          
                          <p className="text-sm text-gray-500">PAN:</p>
                          <p className="font-medium">{form.getValues('buyerPan') || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="buyerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="buyerAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea rows={2} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="buyerGstin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GSTIN</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="buyerState"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="buyerStateCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State Code</FormLabel>
                              <FormControl>
                                <Input {...field} onChange={(e) => {
                                  field.onChange(e);
                                  recalculateTaxes(invoiceItems, '');
                                }} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="buyerContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="buyerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="buyerPan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PAN</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}
              </div>
              
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
                  {isEditMode ? 'Update Invoice' : 'Create Invoice'}
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
