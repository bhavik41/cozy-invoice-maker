
export interface Product {
  id: string;
  name: string;
  description: string;
  hsnCode: string;
  gstRate: number;
  price: number;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  gstin: string;
  state: string;
  stateCode: string;
  contact: string;
  email: string;
  pan: string;
  notes?: string;
  logo?: string; // Added logo field for seller
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    branch: string;
    ifscCode: string;
  };
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  hsnCode: string;
  gstRate: number;
  quantity: number;
  price: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  eWayBillNumber: string;
  date: Date;
  deliveryNote: string;
  modeOfPayment: string;
  reference: string;
  otherReferences: string;
  buyerOrderNo: string;
  dated: string;
  dispatchDocumentNo: string;
  deliveryNoteDate: string;
  dispatchedThrough: string;
  destination: string;
  billOfLading: string;
  motorVehicleNo: string;
  termsOfDelivery: string;
  
  // Seller information
  sellerId: string;
  seller: Customer;
  
  // Buyer information
  useExistingBuyer: boolean;
  buyerId?: string;
  buyer?: Customer;
  buyerName?: string; 
  buyerAddress?: string;
  buyerGstin?: string;
  buyerState?: string;
  buyerStateCode?: string;
  buyerContact?: string;
  buyerEmail?: string;
  buyerPan?: string;
  placeOfSupply?: string;
  
  // Items and calculations
  items: InvoiceItem[];
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  totalAmount: number;
  totalTaxAmount: number;
  totalAmountInWords: string;
  totalTaxAmountInWords: string;
  grandTotal?: number;
  
  // Bank details
  bankDetails: {
    bankName: string;
    accountNumber: string;
    branch: string;
    ifscCode: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceFilter {
  startDate?: Date;
  endDate?: Date;
  customerId?: string;
  status?: InvoiceStatus;
  minAmount?: number;
  maxAmount?: number;
}

export interface ProductFilter {
  search?: string;
  gstRate?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface CustomerFilter {
  search?: string;
  state?: string;
}
