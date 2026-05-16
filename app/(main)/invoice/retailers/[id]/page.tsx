import { notFound } from "next/navigation";
import { safePostSaveRedirect } from "@/app/(main)/invoice/redirect-utils";
import { getStore } from "@/app/(main)/invoice/store-actions";
import { EditRetailerClient } from "./EditRetailerClient";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ returnTo?: string }>;
};

export default async function EditRetailerPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const redirectTo = safePostSaveRedirect(
    typeof sp.returnTo === "string" ? sp.returnTo : undefined,
    "/invoice/retailers",
  );

  const store = await getStore();
  const retailer = store.retailers.find((r) => r.id === id);
  if (!retailer) notFound();

  const myInvoices = store.invoices
    .filter((i) => i.retailerId === id)
    .map((i) => ({
      id: i.id,
      invoiceNumber: i.invoiceNo,
      date: i.invoiceDate,
      invoiceAmount: i.invoiceAmount,
    }));
  const myInvoiceIds = new Set(myInvoices.map((i) => i.id));

  const myPayments = store.payments
    .filter((p) => myInvoiceIds.has(p.invoiceId))
    .map((p) => ({
      id: p.id,
      date: p.date,
      amount: p.amount,
    }));

  const myCreditNotes = store.creditNotes
    .filter((cn) => myInvoiceIds.has(cn.invoiceId))
    .map((cn) => ({
      id: cn.id,
      date: cn.date,
      amount: cn.goodsReturnAmount,
    }));

  return (
    <EditRetailerClient
      retailer={retailer}
      redirectTo={redirectTo}
      invoices={myInvoices}
      payments={myPayments}
      creditNotes={myCreditNotes}
    />
  );
}
