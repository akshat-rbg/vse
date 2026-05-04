import { Check, CircleDashed, FileText, Plus } from "lucide-react";
import Link from "next/link";
import { DeleteEntityButton } from "@/app/(main)/invoice/_components/DeleteEntityButton";
import {
  deleteInvoice,
  getStore,
} from "@/app/(main)/invoice/store-actions";
import { round2 } from "@/lib/store/invoice-math";

const VIOLET = "#a78bfa";
const INDIGO = "#818cf8";
const EMERALD = "#34d399";
const AMBER = "#fbbf24";
const ROSE = "#fb7185";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatCompact(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

const STATUS = {
  paid: { label: "Paid", color: EMERALD, Icon: Check },
  partial: { label: "Partial", color: AMBER, Icon: CircleDashed },
  unpaid: { label: "Unpaid", color: ROSE, Icon: CircleDashed },
} as const;

export default async function InvoicesListPage() {
  const store = await getStore();
  const companyById = new Map(
    store.companies.map((c) => [c.id, c]),
  );
  const retailerById = new Map(
    store.retailers.map((r) => [r.id, r]),
  );
  const paidByInvoiceId = new Map<string, number>();
  const creditByInvoiceId = new Map<string, number>();

  for (const p of store.payments) {
    paidByInvoiceId.set(
      p.invoiceId,
      round2((paidByInvoiceId.get(p.invoiceId) ?? 0) + p.amount),
    );
  }
  for (const cn of store.creditNotes) {
    creditByInvoiceId.set(
      cn.invoiceId,
      round2(
        (creditByInvoiceId.get(cn.invoiceId) ?? 0) +
          cn.goodsReturnAmount,
      ),
    );
  }

  const totalBilled = round2(
    store.invoices.reduce((s, i) => s + i.invoiceAmount, 0),
  );
  const totalPaid = round2(
    Array.from(paidByInvoiceId.values()).reduce((s, x) => s + x, 0),
  );
  const totalCredit = round2(
    Array.from(creditByInvoiceId.values()).reduce((s, x) => s + x, 0),
  );
  const totalOutstanding = Math.max(
    0,
    round2(totalBilled - totalPaid - totalCredit),
  );

  const canCreateInvoice =
    store.companies.length > 0 && store.retailers.length > 0;
  const invoiceNewHref = `/invoice/invoices/new?returnTo=${encodeURIComponent("/invoice/invoices")}`;
  const companiesNewFromInvoicesHref = `/invoice/companies/new?returnTo=${encodeURIComponent("/invoice/invoices")}`;
  const retailersNewFromInvoicesHref = `/invoice/retailers/new?returnTo=${encodeURIComponent("/invoice/invoices")}`;

  return (
    <div className="mx-auto max-w-md space-y-4 px-1 pb-24 lg:max-w-3xl lg:pb-6">
      {/* Header */}
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] text-white/40">Workspace</p>
          <h1 className="mt-0.5 flex items-center gap-2 text-xl font-bold leading-tight text-white">
            Invoices
            <FileText className="size-4" style={{ color: VIOLET }} />
          </h1>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold tabular-nums"
          style={{
            background: `${VIOLET}1f`,
            color: VIOLET,
            border: `1px solid ${VIOLET}33`,
          }}
        >
          {store.invoices.length}
        </span>
      </header>

      {store.invoices.length === 0 ? (
        <div
          className="rounded-2xl px-5 py-10 text-center"
          style={{
            background: `linear-gradient(180deg, ${VIOLET}10, transparent)`,
            border: "1px dashed rgba(255,255,255,0.1)",
          }}
        >
          <div
            className="mx-auto flex size-12 items-center justify-center rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${VIOLET}30, ${INDIGO}20)`,
            }}
          >
            <FileText className="size-6" style={{ color: VIOLET }} />
          </div>
          <p className="mt-3 text-sm font-bold text-white">
            No invoices yet
          </p>
          <p className="mt-1 text-[11px] text-white/45">
            {canCreateInvoice
              ? "Create your first bill on the full-page form."
              : "Add a company and a retailer first, then create an invoice."}
          </p>
          {canCreateInvoice ? (
            <Link
              href={invoiceNewHref}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[11px] font-bold text-white transition active:scale-[0.97]"
              style={{
                background: `linear-gradient(135deg, ${INDIGO}, ${VIOLET})`,
                boxShadow: `0 4px 14px ${INDIGO}40`,
              }}
            >
              <Plus className="size-3" /> New invoice
            </Link>
          ) : (
            <p className="mt-4 flex flex-wrap items-center justify-center gap-x-1 text-[11px] text-white/50">
              <Link
                href={companiesNewFromInvoicesHref}
                className="font-semibold underline underline-offset-2"
                style={{ color: VIOLET }}
              >
                Company
              </Link>
              <span>·</span>
              <Link
                href={retailersNewFromInvoicesHref}
                className="font-semibold underline underline-offset-2"
                style={{ color: VIOLET }}
              >
                Retailer
              </Link>
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Stats triple */}
          <div className="grid grid-cols-3 gap-2">
            <StatCard
              label="Billed"
              value={formatCompact(totalBilled)}
              color={INDIGO}
            />
            <StatCard
              label="Paid"
              value={formatCompact(totalPaid)}
              color={EMERALD}
            />
            <StatCard
              label="Due"
              value={formatCompact(totalOutstanding)}
              color={totalOutstanding > 0 ? ROSE : EMERALD}
            />
          </div>

          {/* Card grid */}
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            {store.invoices.map((inv) => {
              const co = companyById.get(inv.companyId);
              const ret = retailerById.get(inv.retailerId);
              const credit = creditByInvoiceId.get(inv.id) ?? 0;
              const paid = paidByInvoiceId.get(inv.id) ?? 0;
              const outstanding = Math.max(
                0,
                round2(inv.invoiceAmount - credit - paid),
              );
              const statusKey =
                outstanding === 0
                  ? "paid"
                  : paid > 0
                    ? "partial"
                    : "unpaid";
              const st = STATUS[statusKey];

              return (
                <article
                  key={inv.id}
                  className="relative overflow-hidden rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-[2px]"
                    style={{
                      background: `linear-gradient(90deg, ${st.color}, ${st.color}00)`,
                    }}
                  />

                  <div className="absolute right-1.5 top-1.5 z-10">
                    <DeleteEntityButton
                      id={inv.id}
                      onDelete={deleteInvoice}
                      confirmMessage="Delete this invoice? Remove payments and credit notes first."
                      iconOnly
                    />
                  </div>

                  <Link
                    href={`/invoice/invoices/${inv.id}`}
                    className="block transition-opacity active:opacity-70"
                  >
                    <div className="flex flex-col gap-2 p-3 pr-10">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-[13px] font-semibold leading-tight text-white">
                              {inv.invoiceNo}
                            </p>
                            <span
                              className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold"
                              style={{
                                background: `${st.color}1f`,
                                color: st.color,
                                border: `1px solid ${st.color}33`,
                              }}
                            >
                              <st.Icon className="size-2.5" />
                              {st.label}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-[11px] text-white/45">
                            {co?.name ?? "—"} · {ret?.name ?? "—"}
                          </p>
                          <p className="mt-0.5 text-[10px] text-white/35">
                            {formatDate(inv.invoiceDate)}
                          </p>
                        </div>

                        <p
                          className="shrink-0 text-[14px] font-bold tabular-nums"
                          style={{ color: VIOLET }}
                        >
                          {inr.format(inv.invoiceAmount)}
                        </p>
                      </div>

                      <div
                        className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5"
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <Mini
                          label="Paid"
                          value={paid > 0 ? formatCompact(paid) : "—"}
                          active={paid > 0}
                          color={EMERALD}
                        />
                        <Mini
                          label="Credit"
                          value={
                            credit > 0 ? formatCompact(credit) : "—"
                          }
                          active={credit > 0}
                          color={INDIGO}
                        />
                        <Mini
                          label="Due"
                          value={formatCompact(outstanding)}
                          active={outstanding > 0}
                          color={ROSE}
                          align="right"
                        />
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </>
      )}

      {canCreateInvoice ? (
        <Link
          href={invoiceNewHref}
          className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full px-4 py-3 text-[12px] font-bold text-white shadow-xl transition active:scale-[0.95] lg:bottom-6 lg:right-6"
          style={{
            background: `linear-gradient(135deg, ${INDIGO}, ${VIOLET})`,
            boxShadow: `0 8px 24px ${INDIGO}55`,
          }}
          aria-label="New invoice"
        >
          <Plus className="size-3.5" />
          <span>New invoice</span>
        </Link>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: `linear-gradient(180deg, ${color}1f, transparent)`,
        border: `1px solid ${color}22`,
      }}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-white/45">
        {label}
      </p>
      <p
        className="mt-1 text-[15px] font-bold tabular-nums leading-tight"
        style={{ color }}
      >
        {value}
      </p>
    </div>
  );
}

function Mini({
  label,
  value,
  active,
  color,
  align = "left",
}: {
  label: string;
  value: string;
  active: boolean;
  color: string;
  align?: "left" | "right";
}) {
  return (
    <div className="min-w-0" style={{ textAlign: align }}>
      <p className="text-[9px] uppercase tracking-wide text-white/35">
        {label}
      </p>
      <p
        className="text-[11px] font-bold tabular-nums"
        style={{
          color: active ? color : "rgba(255,255,255,0.3)",
        }}
      >
        {value}
      </p>
    </div>
  );
}
