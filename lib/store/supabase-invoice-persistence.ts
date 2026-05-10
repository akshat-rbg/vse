import { createClient } from "@/lib/supabase/server";
import type {
  AppStore,
  Company,
  CreditNote,
  Invoice,
  Payment,
  Retailer,
} from "./types";

function num(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number.parseFloat(v) || 0;
  return 0;
}

function iso(v: unknown): string {
  if (v == null) return new Date().toISOString();
  if (typeof v === "string") return v;
  return String(v);
}

function dateOnly(isoDate: string): string {
  return isoDate.slice(0, 10);
}

function rowToCompany(r: Record<string, unknown>): Company {
  return {
    id: String(r.id),
    name: String(r.name),
    phone: String(r.phone).trim(),
    gstNumber: String(r.gst_number),
    telephone: r.telephone ? String(r.telephone) : undefined,
    altPhone: r.alt_phone ? String(r.alt_phone) : undefined,
    address: r.address ? String(r.address) : undefined,
    email: r.email ? String(r.email) : undefined,
    city: r.city ? String(r.city) : undefined,
    state: r.state ? String(r.state) : undefined,
    pinCode: r.pin_code ? String(r.pin_code) : undefined,
    bankName: r.bank_name ? String(r.bank_name) : undefined,
    acNo: r.ac_no ? String(r.ac_no) : undefined,
    ifscCode: r.ifsc_code ? String(r.ifsc_code).trim() : undefined,
    branch: r.branch ? String(r.branch) : undefined,
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
  };
}

function rowToRetailer(r: Record<string, unknown>): Retailer {
  return {
    id: String(r.id),
    companyId: String(r.company_id),
    name: String(r.name),
    address: String(r.address),
    phone: String(r.phone).trim(),
    taxIdType: r.tax_id_type === "PAN" ? "PAN" : "GST",
    taxId: String(r.tax_id),
    contactPersonName: r.contact_person_name
      ? String(r.contact_person_name)
      : undefined,
    telephone: r.telephone ? String(r.telephone) : undefined,
    altPhone: r.alt_phone ? String(r.alt_phone) : undefined,
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
  };
}

function rowToInvoice(r: Record<string, unknown>): Invoice {
  const cdInput = r.cash_discount_amount_input;
  return {
    id: String(r.id),
    companyId: String(r.company_id),
    retailerId: String(r.retailer_id),
    invoiceNo: String(r.invoice_no),
    quantity: Math.round(num(r.quantity)),
    baseAmount: num(r.base_amount),
    invoiceDate: dateOnly(String(r.invoice_date)),
    gstPercent: num(r.gst_percent),
    cashDiscountPercent: num(r.cash_discount_percent),
    cashDiscountAmountInput:
      cdInput === null || cdInput === undefined
        ? null
        : Number.parseFloat(String(cdInput)),
    commissionPercent: num(r.commission_percent),
    cashDiscountApplied: num(r.cash_discount_applied),
    taxableAmount: num(r.taxable_amount),
    gstAmount: num(r.gst_amount),
    invoiceAmount: num(r.invoice_amount),
    commissionAmount: num(r.commission_amount),
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
  };
}

function rowToPayment(r: Record<string, unknown>): Payment {
  const method = String(r.method);
  const allowed = ["Cash", "UPI", "Bank Transfer", "Cheque", "Other"] as const;
  const safe = allowed.includes(method as (typeof allowed)[number])
    ? method
    : "Other";
  return {
    id: String(r.id),
    invoiceId: String(r.invoice_id),
    date: dateOnly(String(r.date)),
    method: safe as Payment["method"],
    amount: num(r.amount),
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
  };
}

function rowToCreditNote(r: Record<string, unknown>): CreditNote {
  return {
    id: String(r.id),
    invoiceId: String(r.invoice_id),
    date: dateOnly(String(r.date)),
    qtyReturned: Math.round(num(r.qty_returned)),
    goodsReturnAmount: num(r.goods_return_amount),
    invoiceQtySnapshot: Math.round(num(r.invoice_qty_snapshot)),
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
  };
}

function companyToRow(c: Company, userId: string) {
  return {
    id: c.id,
    user_id: userId,
    name: c.name,
    phone: c.phone,
    gst_number: c.gstNumber,
    telephone: c.telephone ?? null,
    alt_phone: c.altPhone ?? null,
    email: c.email ?? null,
    address: c.address ?? null,
    city: c.city ?? null,
    state: c.state ?? null,
    pin_code: c.pinCode ?? null,
    bank_name: c.bankName ?? null,
    ac_no: c.acNo ?? null,
    ifsc_code: c.ifscCode ? c.ifscCode.slice(0, 11) : null,
    branch: c.branch ?? null,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  };
}

function retailerToRow(r: Retailer, userId: string) {
  return {
    id: r.id,
    user_id: userId,
    company_id: r.companyId,
    name: r.name,
    address: r.address,
    phone: r.phone,
    tax_id_type: r.taxIdType,
    tax_id: r.taxId,
    contact_person_name: r.contactPersonName ?? null,
    telephone: r.telephone ?? null,
    alt_phone: r.altPhone ?? null,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  };
}

function invoiceToRow(i: Invoice, userId: string) {
  return {
    id: i.id,
    user_id: userId,
    company_id: i.companyId,
    retailer_id: i.retailerId,
    invoice_no: i.invoiceNo,
    invoice_date: dateOnly(i.invoiceDate),
    quantity: i.quantity,
    base_amount: i.baseAmount,
    gst_percent: i.gstPercent,
    gst_amount: i.gstAmount,
    cash_discount_percent: i.cashDiscountPercent,
    cash_discount_amount_input: i.cashDiscountAmountInput,
    cash_discount_applied: i.cashDiscountApplied,
    taxable_amount: i.taxableAmount,
    invoice_amount: i.invoiceAmount,
    commission_percent: i.commissionPercent,
    commission_amount: i.commissionAmount,
    created_at: i.createdAt,
    updated_at: i.updatedAt,
  };
}

function paymentToRow(p: Payment, userId: string) {
  return {
    id: p.id,
    user_id: userId,
    invoice_id: p.invoiceId,
    date: dateOnly(p.date),
    method: p.method,
    amount: p.amount,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

function creditNoteToRow(c: CreditNote, userId: string) {
  return {
    id: c.id,
    user_id: userId,
    invoice_id: c.invoiceId,
    date: dateOnly(c.date),
    qty_returned: c.qtyReturned,
    goods_return_amount: c.goodsReturnAmount,
    invoice_qty_snapshot: c.invoiceQtySnapshot,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  };
}

export async function loadAppStoreFromSupabase(
  userId: string,
): Promise<AppStore> {
  const supabase = await createClient();

  const [co, re, inv, pay, cn] = await Promise.all([
    supabase.from("companies").select("*").eq("user_id", userId),
    supabase.from("retailers").select("*").eq("user_id", userId),
    supabase.from("invoices").select("*").eq("user_id", userId),
    supabase.from("payments").select("*").eq("user_id", userId),
    supabase.from("credit_notes").select("*").eq("user_id", userId),
  ]);

  const err =
    co.error || re.error || inv.error || pay.error || cn.error;
  if (err) {
    throw new Error(
      `Supabase load failed: ${err.message}. Check tables exist (run supabase/invoice_schema.sql) and RLS policies.`,
    );
  }

  return {
    companies: (co.data ?? []).map((r) =>
      rowToCompany(r as Record<string, unknown>),
    ),
    retailers: (re.data ?? []).map((r) =>
      rowToRetailer(r as Record<string, unknown>),
    ),
    invoices: (inv.data ?? []).map((r) =>
      rowToInvoice(r as Record<string, unknown>),
    ),
    payments: (pay.data ?? []).map((r) =>
      rowToPayment(r as Record<string, unknown>),
    ),
    creditNotes: (cn.data ?? []).map((r) =>
      rowToCreditNote(r as Record<string, unknown>),
    ),
  };
}

/**
 * Full replace for this user: delete all invoice-domain rows, then insert from `store`.
 * FK-safe delete order; insert order follows references.
 */
export async function saveAppStoreToSupabase(
  userId: string,
  store: AppStore,
): Promise<void> {
  const supabase = await createClient();

  const delOrder = [
    "credit_notes",
    "payments",
    "invoices",
    "retailers",
    "companies",
  ] as const;

  for (const name of delOrder) {
    const { error } = await supabase.from(name).delete().eq("user_id", userId);
    if (error) {
      throw new Error(`Supabase delete (${name}): ${error.message}`);
    }
  }

  if (store.companies.length > 0) {
    const { error } = await supabase
      .from("companies")
      .insert(store.companies.map((c) => companyToRow(c, userId)));
    if (error)
      throw new Error(`Supabase insert (companies): ${error.message}`);
  }

  if (store.retailers.length > 0) {
    const { error } = await supabase
      .from("retailers")
      .insert(store.retailers.map((r) => retailerToRow(r, userId)));
    if (error)
      throw new Error(`Supabase insert (retailers): ${error.message}`);
  }

  if (store.invoices.length > 0) {
    const { error } = await supabase
      .from("invoices")
      .insert(store.invoices.map((i) => invoiceToRow(i, userId)));
    if (error)
      throw new Error(`Supabase insert (invoices): ${error.message}`);
  }

  if (store.payments.length > 0) {
    const { error } = await supabase
      .from("payments")
      .insert(store.payments.map((p) => paymentToRow(p, userId)));
    if (error)
      throw new Error(`Supabase insert (payments): ${error.message}`);
  }

  if (store.creditNotes.length > 0) {
    const { error } = await supabase
      .from("credit_notes")
      .insert(store.creditNotes.map((c) => creditNoteToRow(c, userId)));
    if (error)
      throw new Error(`Supabase insert (credit_notes): ${error.message}`);
  }
}
