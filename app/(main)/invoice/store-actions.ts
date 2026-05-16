"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { safePostSaveRedirect } from "@/app/(main)/invoice/redirect-utils";
import { computeInvoiceAmounts } from "@/lib/store/invoice-math";
import { loadStore, tryWriteStore } from "@/lib/store/persistence";
import type {
  AppStore,
  Company,
  CreditNote,
  Invoice,
  Payment,
  PaymentMethod,
  Retailer,
} from "@/lib/store/types";
import {
  isValidGst15,
  isValidPan,
  isValidPhone10,
  normalizeGst15,
  normalizePhone10,
} from "@/lib/store/validation";

export type ActionResult = { ok: true } | { ok: false; error: string };

const INV_BASE = "/invoice";

function revalidateInvoiceArea() {
  revalidatePath(INV_BASE, "layout");
  revalidatePath("/home");
}

function nowIso() {
  return new Date().toISOString();
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

/* ---------- Companies ---------- */

export async function saveCompany(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim() || crypto.randomUUID();
  const name = String(formData.get("name") ?? "").trim();
  const phone = normalizePhone10(String(formData.get("phone") ?? ""));
  const gstNumber = normalizeGst15(String(formData.get("gstNumber") ?? ""));
  const telephone = String(formData.get("telephone") ?? "").trim() || undefined;
  const altRaw = String(formData.get("altPhone") ?? "").trim();
  const altPhone = altRaw ? normalizePhone10(altRaw) : undefined;
  const address = String(formData.get("address") ?? "").trim() || undefined;
  const email = String(formData.get("email") ?? "").trim() || undefined;
  const city = String(formData.get("city") ?? "").trim() || undefined;
  const state = String(formData.get("state") ?? "").trim() || undefined;
  const pinCode = String(formData.get("pinCode") ?? "").trim() || undefined;
  const bankName = String(formData.get("bankName") ?? "").trim() || undefined;
  const acNo = String(formData.get("acNo") ?? "").trim() || undefined;
  const ifscCode = String(formData.get("ifscCode") ?? "").trim().toUpperCase() || undefined;
  const branch = String(formData.get("branch") ?? "").trim() || undefined;

  if (!name) return { ok: false, error: "Company name is required." };
  if (!isValidPhone10(phone))
    return { ok: false, error: "Enter a valid 10-digit mobile (after +91)." };
  if (!isValidGst15(gstNumber))
    return { ok: false, error: "GST number must be 15 characters." };
  if (altPhone && !isValidPhone10(altPhone))
    return { ok: false, error: "Alternative number must be 10 digits." };
  if (pinCode && !/^\d{6}$/.test(pinCode))
    return { ok: false, error: "PIN code must be 6 digits." };

  const store = await loadStore();
  const t = nowIso();
  const idx = store.companies.findIndex((c) => c.id === id);
  const row: Company = {
    id,
    name,
    phone,
    gstNumber,
    telephone,
    altPhone,
    address,
    email,
    city,
    state,
    pinCode,
    bankName,
    acNo,
    ifscCode,
    branch,
    createdAt: idx >= 0 ? store.companies[idx].createdAt : t,
    updatedAt: t,
  };
  if (idx >= 0) store.companies[idx] = row;
  else store.companies.push(row);
  const wrote = await tryWriteStore(store);
  if (!wrote.ok) return { ok: false, error: wrote.error };
  revalidateInvoiceArea();
  redirect(
    safePostSaveRedirect(
      String(formData.get("_redirect")),
      `${INV_BASE}/companies`,
    ),
  );
}

export async function deleteCompany(id: string): Promise<ActionResult> {
  const store = await loadStore();
  if (store.invoices.some((i) => i.companyId === id))
    return { ok: false, error: "Remove invoices using this company first." };
  store.companies = store.companies.filter((c) => c.id !== id);
  const wroteCo = await tryWriteStore(store);
  if (!wroteCo.ok) return { ok: false, error: wroteCo.error };
  revalidateInvoiceArea();
  return { ok: true };
}

/* ---------- Retailers ---------- */

export async function saveRetailer(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim() || crypto.randomUUID();
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const phone = normalizePhone10(String(formData.get("phone") ?? ""));
  const taxIdType = String(formData.get("taxIdType") ?? "").toUpperCase();
  const taxIdRaw = String(formData.get("taxId") ?? "").trim();
  const contactPersonName =
    String(formData.get("contactPersonName") ?? "").trim() || undefined;
  const telephone = String(formData.get("telephone") ?? "").trim() || undefined;
  const altRaw = String(formData.get("altPhone") ?? "").trim();
  const altPhone = altRaw ? normalizePhone10(altRaw) : undefined;

  if (!name) return { ok: false, error: "Retailer name is required." };
  if (!address) return { ok: false, error: "Address is required." };
  if (!isValidPhone10(phone))
    return { ok: false, error: "Enter a valid 10-digit mobile." };
  if (taxIdType !== "GST" && taxIdType !== "PAN")
    return { ok: false, error: "Tax ID type must be GST or PAN." };

  const taxId =
    taxIdType === "GST"
      ? normalizeGst15(taxIdRaw)
      : taxIdRaw.replace(/\s/g, "").toUpperCase();
  if (taxIdType === "GST" && !isValidGst15(taxId))
    return { ok: false, error: "GST must be 15 characters." };
  if (taxIdType === "PAN" && !isValidPan(taxId))
    return { ok: false, error: "PAN must be in format ABCDE1234F." };
  if (altPhone && !isValidPhone10(altPhone))
    return { ok: false, error: "Alternative number must be 10 digits." };

  const store = await loadStore();

  const t = nowIso();
  const idx = store.retailers.findIndex((r) => r.id === id);
  const row: Retailer = {
    id,
    name,
    address,
    phone,
    taxIdType: taxIdType as "GST" | "PAN",
    taxId,
    contactPersonName,
    telephone,
    altPhone,
    createdAt: idx >= 0 ? store.retailers[idx].createdAt : t,
    updatedAt: t,
  };
  if (idx >= 0) store.retailers[idx] = row;
  else store.retailers.push(row);
  const wroteR = await tryWriteStore(store);
  if (!wroteR.ok) return { ok: false, error: wroteR.error };
  revalidateInvoiceArea();
  redirect(
    safePostSaveRedirect(
      String(formData.get("_redirect")),
      `${INV_BASE}/retailers`,
    ),
  );
}

export async function deleteRetailer(id: string): Promise<ActionResult> {
  const store = await loadStore();
  if (store.invoices.some((i) => i.retailerId === id))
    return { ok: false, error: "Remove invoices for this retailer first." };
  store.retailers = store.retailers.filter((r) => r.id !== id);
  const wroteDr = await tryWriteStore(store);
  if (!wroteDr.ok) return { ok: false, error: wroteDr.error };
  revalidateInvoiceArea();
  return { ok: true };
}

/* ---------- Invoices ---------- */

function parseInvoiceFromForm(formData: FormData): {
  error?: string;
  data?: Omit<
    Invoice,
    | "cashDiscountApplied"
    | "taxableAmount"
    | "gstAmount"
    | "invoiceAmount"
    | "commissionAmount"
    | "createdAt"
    | "updatedAt"
  >;
} {
  const id = String(formData.get("id") ?? "").trim() || crypto.randomUUID();
  const companyId = String(formData.get("companyId") ?? "").trim();
  const retailerId = String(formData.get("retailerId") ?? "").trim();
  const invoiceNo = String(formData.get("invoiceNo") ?? "").trim();
  const quantity = Number.parseInt(String(formData.get("quantity") ?? ""), 10);
  const baseAmount = Number.parseFloat(String(formData.get("baseAmount") ?? ""));
  const invoiceDate =
    String(formData.get("invoiceDate") ?? "").trim() || todayDate();
  const gstPercent = Number.parseFloat(String(formData.get("gstPercent") ?? "0")) || 0;
  const cashDiscountPercent =
    Number.parseFloat(String(formData.get("cashDiscountPercent") ?? "0")) || 0;
  const cdAmtRaw = String(formData.get("cashDiscountAmountInput") ?? "").trim();
  const cashDiscountAmountInput =
    cdAmtRaw === "" ? null : Number.parseFloat(cdAmtRaw);
  const commissionPercent =
    Number.parseFloat(String(formData.get("commissionPercent") ?? "0")) || 0;

  if (!companyId) return { error: "Company is required." };
  if (!retailerId) return { error: "Retailer is required." };
  if (!invoiceNo) return { error: "Invoice number is required." };
  if (!Number.isFinite(quantity) || quantity < 1 || !Number.isInteger(quantity))
    return { error: "Quantity must be a whole number ≥ 1." };
  if (!Number.isFinite(baseAmount) || baseAmount < 0)
    return { error: "Base amount must be a valid number." };
  if (cashDiscountAmountInput != null && (cashDiscountAmountInput < 0 || Number.isNaN(cashDiscountAmountInput)))
    return { error: "Cash discount amount invalid." };

  return {
    data: {
      id,
      companyId,
      retailerId,
      invoiceNo,
      quantity,
      baseAmount,
      invoiceDate,
      gstPercent,
      cashDiscountPercent,
      cashDiscountAmountInput,
      commissionPercent,
    },
  };
}

export async function saveInvoice(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseInvoiceFromForm(formData);
  if (parsed.error || !parsed.data) return { ok: false, error: parsed.error! };

  const store = await loadStore();
  const { companyId, retailerId } = parsed.data;
  if (!store.companies.some((c) => c.id === companyId))
    return { ok: false, error: "Company not found." };
  if (!store.retailers.some((r) => r.id === retailerId))
    return { ok: false, error: "Retailer not found." };

  const calc = computeInvoiceAmounts({
    baseAmount: parsed.data.baseAmount,
    gstPercent: parsed.data.gstPercent,
    cashDiscountPercent: parsed.data.cashDiscountPercent,
    cashDiscountAmountInput: parsed.data.cashDiscountAmountInput,
    commissionPercent: parsed.data.commissionPercent,
  });

  const t = nowIso();
  const idx = store.invoices.findIndex((i) => i.id === parsed.data!.id);
  const row: Invoice = {
    ...parsed.data,
    ...calc,
    createdAt: idx >= 0 ? store.invoices[idx].createdAt : t,
    updatedAt: t,
  };
  if (idx >= 0) store.invoices[idx] = row;
  else store.invoices.push(row);
  const wroteI = await tryWriteStore(store);
  if (!wroteI.ok) return { ok: false, error: wroteI.error };
  revalidateInvoiceArea();
  redirect(
    safePostSaveRedirect(
      String(formData.get("_redirect")),
      `${INV_BASE}/invoices`,
    ),
  );
}

export async function deleteInvoice(id: string): Promise<ActionResult> {
  const store = await loadStore();
  if (store.payments.some((p) => p.invoiceId === id))
    return { ok: false, error: "Remove payments for this invoice first." };
  if (store.creditNotes.some((c) => c.invoiceId === id))
    return { ok: false, error: "Remove credit notes for this invoice first." };
  store.invoices = store.invoices.filter((i) => i.id !== id);
  const wroteDi = await tryWriteStore(store);
  if (!wroteDi.ok) return { ok: false, error: wroteDi.error };
  revalidateInvoiceArea();
  return { ok: true };
}

/* ---------- Payments ---------- */

const PAYMENT_METHODS: PaymentMethod[] = [
  "Cash",
  "UPI",
  "Bank Transfer",
  "Cheque",
  "Other",
];

export async function savePayment(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim() || crypto.randomUUID();
  const invoiceId = String(formData.get("invoiceId") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim() || todayDate();
  const method = String(formData.get("method") ?? "") as PaymentMethod;
  const amount = Number.parseFloat(String(formData.get("amount") ?? ""));

  if (!invoiceId) return { ok: false, error: "Invoice is required." };
  if (!PAYMENT_METHODS.includes(method))
    return { ok: false, error: "Invalid payment method." };
  if (!Number.isFinite(amount) || amount <= 0)
    return { ok: false, error: "Payment amount must be greater than 0." };

  const store = await loadStore();
  if (!store.invoices.some((i) => i.id === invoiceId))
    return { ok: false, error: "Invoice not found." };

  const t = nowIso();
  const idx = store.payments.findIndex((p) => p.id === id);
  const row: Payment = {
    id,
    invoiceId,
    date,
    method,
    amount: Math.round(amount * 100) / 100,
    createdAt: idx >= 0 ? store.payments[idx].createdAt : t,
    updatedAt: t,
  };
  if (idx >= 0) store.payments[idx] = row;
  else store.payments.push(row);
  const wroteP = await tryWriteStore(store);
  if (!wroteP.ok) return { ok: false, error: wroteP.error };
  revalidateInvoiceArea();
  redirect(
    safePostSaveRedirect(
      String(formData.get("_redirect")),
      `${INV_BASE}/payments`,
    ),
  );
}

/**
 * Merged payment: settles N invoices for the same retailer in one transaction.
 * Allocation is FIFO by invoice date (oldest first), capped by each invoice's
 * remaining outstanding (invoiceAmount - prior payments - credit notes).
 * Any leftover after all outstandings are covered lands on the last invoice as overpay.
 * All resulting Payment rows share one paymentGroupId so reports can recombine them.
 */
export async function saveMergedPayment(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const retailerId = String(formData.get("retailerId") ?? "").trim();
  const invoiceIdsRaw = String(formData.get("mergedInvoiceIds") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim() || todayDate();
  const method = String(formData.get("method") ?? "") as PaymentMethod;
  const amount = Number.parseFloat(String(formData.get("amount") ?? ""));

  if (!retailerId) return { ok: false, error: "Retailer is required." };
  const invoiceIds = invoiceIdsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (invoiceIds.length < 2)
    return { ok: false, error: "Select at least 2 invoices to merge." };
  if (!PAYMENT_METHODS.includes(method))
    return { ok: false, error: "Invalid payment method." };
  if (!Number.isFinite(amount) || amount <= 0)
    return { ok: false, error: "Payment amount must be greater than 0." };

  const store = await loadStore();

  const selected = invoiceIds
    .map((id) => store.invoices.find((i) => i.id === id))
    .filter((i): i is Invoice => Boolean(i));
  if (selected.length !== invoiceIds.length)
    return { ok: false, error: "One or more invoices not found." };
  if (selected.some((i) => i.retailerId !== retailerId))
    return {
      ok: false,
      error: "All invoices must belong to the same retailer.",
    };

  const paidByInvoice = new Map<string, number>();
  for (const p of store.payments)
    paidByInvoice.set(
      p.invoiceId,
      (paidByInvoice.get(p.invoiceId) ?? 0) + p.amount,
    );
  const returnedByInvoice = new Map<string, number>();
  for (const c of store.creditNotes)
    returnedByInvoice.set(
      c.invoiceId,
      (returnedByInvoice.get(c.invoiceId) ?? 0) + c.goodsReturnAmount,
    );

  const sorted = [...selected].sort((a, b) =>
    a.invoiceDate.localeCompare(b.invoiceDate),
  );

  const groupId = crypto.randomUUID();
  const t = nowIso();
  const newPayments: Payment[] = [];
  let remaining = Math.round(amount * 100) / 100;

  for (let idx = 0; idx < sorted.length; idx++) {
    if (remaining <= 0 && idx < sorted.length) break;
    const inv = sorted[idx];
    const paid = paidByInvoice.get(inv.id) ?? 0;
    const returned = returnedByInvoice.get(inv.id) ?? 0;
    const outstanding = Math.max(
      0,
      Math.round((inv.invoiceAmount - paid - returned) * 100) / 100,
    );

    const isLast = idx === sorted.length - 1;
    const alloc = isLast
      ? Math.round(remaining * 100) / 100
      : Math.min(remaining, outstanding);

    if (alloc <= 0) continue;

    newPayments.push({
      id: crypto.randomUUID(),
      invoiceId: inv.id,
      date,
      method,
      amount: Math.round(alloc * 100) / 100,
      paymentGroupId: groupId,
      createdAt: t,
      updatedAt: t,
    });
    remaining = Math.round((remaining - alloc) * 100) / 100;
  }

  if (newPayments.length === 0)
    return {
      ok: false,
      error: "Nothing to allocate — selected invoices are fully settled.",
    };

  store.payments.push(...newPayments);
  const wrote = await tryWriteStore(store);
  if (!wrote.ok) return { ok: false, error: wrote.error };
  revalidateInvoiceArea();
  redirect(
    safePostSaveRedirect(
      String(formData.get("_redirect")),
      `${INV_BASE}/payments`,
    ),
  );
}

export async function deletePayment(id: string): Promise<ActionResult> {
  const store = await loadStore();
  store.payments = store.payments.filter((p) => p.id !== id);
  const wroteDp = await tryWriteStore(store);
  if (!wroteDp.ok) return { ok: false, error: wroteDp.error };
  revalidateInvoiceArea();
  return { ok: true };
}

/* ---------- Credit notes ---------- */

export async function saveCreditNote(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim() || crypto.randomUUID();
  const invoiceId = String(formData.get("invoiceId") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim() || todayDate();
  const qtyReturned = Number.parseInt(
    String(formData.get("qtyReturned") ?? ""),
    10,
  );
  const goodsReturnAmount = Number.parseFloat(
    String(formData.get("goodsReturnAmount") ?? ""),
  );

  if (!invoiceId) return { ok: false, error: "Invoice is required." };
  if (!Number.isFinite(qtyReturned) || qtyReturned < 1 || !Number.isInteger(qtyReturned))
    return { ok: false, error: "Return quantity must be a whole number ≥ 1." };
  if (!Number.isFinite(goodsReturnAmount) || goodsReturnAmount < 0)
    return { ok: false, error: "Goods return amount invalid." };

  const store = await loadStore();
  const inv = store.invoices.find((i) => i.id === invoiceId);
  if (!inv) return { ok: false, error: "Invoice not found." };
  if (qtyReturned > inv.quantity)
    return {
      ok: false,
      error: `Return qty cannot exceed invoice qty (${inv.quantity}).`,
    };

  const t = nowIso();
  const idx = store.creditNotes.findIndex((c) => c.id === id);
  const row: CreditNote = {
    id,
    invoiceId,
    date,
    qtyReturned,
    goodsReturnAmount: Math.round(goodsReturnAmount * 100) / 100,
    invoiceQtySnapshot: inv.quantity,
    createdAt: idx >= 0 ? store.creditNotes[idx].createdAt : t,
    updatedAt: t,
  };
  if (idx >= 0) store.creditNotes[idx] = row;
  else store.creditNotes.push(row);
  const wroteCn = await tryWriteStore(store);
  if (!wroteCn.ok) return { ok: false, error: wroteCn.error };
  revalidateInvoiceArea();
  redirect(
    safePostSaveRedirect(
      String(formData.get("_redirect")),
      `${INV_BASE}/credit-notes`,
    ),
  );
}

export async function deleteCreditNote(id: string): Promise<ActionResult> {
  const store = await loadStore();
  store.creditNotes = store.creditNotes.filter((c) => c.id !== id);
  const wroteDcn = await tryWriteStore(store);
  if (!wroteDcn.ok) return { ok: false, error: wroteDcn.error };
  revalidateInvoiceArea();
  return { ok: true };
}

export async function getStore(): Promise<AppStore> {
  return loadStore();
}
