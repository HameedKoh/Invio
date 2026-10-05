export interface UserBrand {
  uid: string;
  brandName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  website?: string;
  taxId?: string;
  logoUrl?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ReceiverInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  company?: string;
}

export interface PaymentDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  uid: string;
  brandSnapshot: UserBrand;
  receiver: ReceiverInfo;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  currency: string;
  notes?: string;
  paymentDetails?: PaymentDetails;
  dueDate: string;
  issueDate: string;
  status: "draft" | "printed" | "paid";
  createdAt: string;
  printedAt?: string;
}
