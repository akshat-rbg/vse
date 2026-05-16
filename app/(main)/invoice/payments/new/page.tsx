import Link from "next/link";
import { MergedPaymentForm } from "@/app/(main)/invoice/_components/MergedPaymentForm";
import { PaymentForm } from "@/app/(main)/invoice/_components/PaymentForm";
import {
  resumePathWithOptionalReturn,
  safePostSaveRedirect,
} from "@/app/(main)/invoice/redirect-utils";
import { getStore } from "@/app/(main)/invoice/store-actions";

type Props = {
  searchParams?: Promise<{
    invoiceId?: string;
    retailerId?: string;
    mergedInvoiceIds?: string;
    amount?: string;
    returnTo?: string;
  }>;
};

export default async function NewPaymentPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};

  const returnTo = typeof sp.returnTo === "string" ? sp.returnTo : undefined;
  const redirectTo = safePostSaveRedirect(returnTo, "/invoice/payments");

  const mergedIds =
    typeof sp.mergedInvoiceIds === "string"
      ? sp.mergedInvoiceIds
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  const retailerId =
    typeof sp.retailerId === "string" && sp.retailerId ? sp.retailerId : null;
  const isMerge = mergedIds.length >= 2 && retailerId !== null;

  const store = await getStore();

  if (isMerge) {
    const idSet = new Set(mergedIds);
    const mergedInvoices = store.invoices.filter((i) => idSet.has(i.id));
    const retailer = store.retailers.find((r) => r.id === retailerId);

    const allBelong =
      mergedInvoices.length === mergedIds.length &&
      mergedInvoices.every((i) => i.retailerId === retailerId);

    if (!retailer || !allBelong) {
      return (
        <div className="mx-auto max-w-md space-y-4 px-1 py-6">
          <Link
            href="/invoice/payments"
            className="text-[12px] font-semibold text-white/55"
          >
            ← Payments
          </Link>
          <div
            className="rounded-2xl px-4 py-6 text-center"
            style={{
              background: "rgba(251,113,133,0.08)",
              border: "1px solid rgba(251,113,133,0.25)",
            }}
          >
            <p className="text-sm font-bold text-white">
              Merged payment link invalid
            </p>
            <p className="mt-1 text-[11px] text-white/55">
              One or more invoices were not found, or they don&rsquo;t all
              belong to the same retailer.
            </p>
          </div>
        </div>
      );
    }

    const defaultAmount = (() => {
      const raw = typeof sp.amount === "string" ? sp.amount : "";
      const parsed = Number.parseFloat(raw);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
      return mergedInvoices.reduce((s, i) => s + i.invoiceAmount, 0);
    })();

    // Preserve invoice-date order so user sees what the FIFO allocation will hit first.
    const ordered = [...mergedInvoices].sort((a, b) =>
      a.invoiceDate.localeCompare(b.invoiceDate),
    );

    return (
      <div className="mx-auto max-w-md space-y-5 px-1 pb-24 pt-6">
        <Link
          href={returnTo ?? "/invoice/payments"}
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-white/55 transition active:opacity-70"
        >
          ← Back
        </Link>

        <header>
          <p className="text-[11px] text-white/40">Merge & Pay</p>
          <h1 className="mt-0.5 text-xl font-bold leading-tight text-white">
            Confirm merged payment
          </h1>
        </header>

        <MergedPaymentForm
          retailerId={retailer.id}
          retailerName={retailer.name}
          invoices={ordered}
          defaultAmount={defaultAmount}
          redirectTo={redirectTo}
        />
      </div>
    );
  }

  const invoiceId =
    typeof sp.invoiceId === "string" && sp.invoiceId ? sp.invoiceId : null;
  let paymentNewResume = resumePathWithOptionalReturn(
    "/invoice/payments/new",
    returnTo,
  );
  if (invoiceId) {
    const sep = paymentNewResume.includes("?") ? "&" : "?";
    paymentNewResume = `${paymentNewResume}${sep}invoiceId=${encodeURIComponent(invoiceId)}`;
  }
  const invoiceNewHref = `/invoice/invoices/new?returnTo=${encodeURIComponent(paymentNewResume)}`;

  return (
    <div className="pb-24 pt-6">
      <Link
        href="/invoice/payments"
        className="text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        ← Payments
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
        New payment
      </h1>
      {store.invoices.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-400">
          <Link href={invoiceNewHref} className="text-zinc-200 underline">
            Create an invoice
          </Link>{" "}
          first.
        </p>
      ) : (
        <div className="mt-6 max-w-lg">
          <PaymentForm
            invoices={store.invoices}
            initialId={invoiceId}
            redirectTo={redirectTo}
          />
        </div>
      )}
    </div>
  );
}
