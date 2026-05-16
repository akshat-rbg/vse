export type Company = {
  id: string;
  name: string;
  /** 10-digit mobile without country code */
  phone: string;
  /** 15-character GSTIN */
  gstNumber: string;
  telephone?: string;
  altPhone?: string;
  address?: string;
  email?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  /** Bank details */
  bankName?: string;
  acNo?: string;
  ifscCode?: string;
  branch?: string;
  createdAt: string;
  updatedAt: string;
};

export type Retailer = {
  id: string;
  name: string;
  address: string;
  phone: string;
  taxIdType: "GST" | "PAN";
  taxId: string;
  contactPersonName?: string;
  telephone?: string;
  altPhone?: string;
  createdAt: string;
  updatedAt: string;
};

export type Invoice = {
  id: string;
  companyId: string;
  retailerId: string;
  invoiceNo: string;
  quantity: number;
  baseAmount: number;
  invoiceDate: string;
  gstPercent: number;
  cashDiscountPercent: number;
  /** Raw user input; amount wins over % when both set */
  cashDiscountAmountInput: number | null;
  commissionPercent: number;
  cashDiscountApplied: number;
  taxableAmount: number;
  gstAmount: number;
  invoiceAmount: number;
  commissionAmount: number;
  createdAt: string;
  updatedAt: string;
};

export type PaymentMethod =
  | "Cash"
  | "UPI"
  | "Bank Transfer"
  | "Cheque"
  | "Other";

export type Payment = {
  id: string;
  invoiceId: string;
  date: string;
  method: PaymentMethod;
  amount: number;
  /** Shared id across all payments created in one Merge & Pay submit; null for single payments. */
  paymentGroupId?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreditNote = {
  id: string;
  invoiceId: string;
  date: string;
  qtyReturned: number;
  goodsReturnAmount: number;
  invoiceQtySnapshot: number;
  createdAt: string;
  updatedAt: string;
};

export type AppStore = {
  companies: Company[];
  retailers: Retailer[];
  invoices: Invoice[];
  payments: Payment[];
  creditNotes: CreditNote[];
};
