"use client";

import {
  ArrowRight,
  Check,
  FileText,
  Plus,
  Receipt,
  Search,
  Undo2,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { RetailerForm } from "@/app/(main)/invoice/_components/RetailerForm";
import type { Retailer } from "@/lib/store/types";

const INDIGO = "#818cf8";
const VIOLET = "#a78bfa";
const EMERALD = "#34d399";
const SKY = "#38bdf8";

const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "Bank Transfer",
  "Cheque",
  "Other",
] as const;

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

type AnyInvoice = {
  id: string;
  invoiceNumber?: string;
  date?: string;
  invoiceAmount: number;
};
type AnyPayment = {
  id: string;
  date?: string;
  amount: number;
};
type AnyCreditNote = {
  id: string;
  date?: string;
  amount: number;
  noteNumber?: string;
};

const TABS = [
  { id: "retailer", label: "Retailer", color: INDIGO },
  { id: "invoices", label: "Invoices", color: VIOLET },
  { id: "credit", label: "Credit", color: SKY },
  { id: "payments", label: "Payments", color: EMERALD },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function EditRetailerClient({
  retailer,
  redirectTo,
  invoices,
  payments,
  creditNotes,
}: {
  retailer: Retailer;
  redirectTo: string;
  invoices: AnyInvoice[];
  payments: AnyPayment[];
  creditNotes: AnyCreditNote[];
}) {
  const [active, setActive] = useState<TabId>("retailer");

  const counts: Record<TabId, number> = {
    retailer: 0,
    invoices: invoices.length,
    credit: creditNotes.length,
    payments: payments.length,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-1 pb-6">
      {/* Back */}
      <Link
        href="/invoice/retailers"
        className="inline-flex items-center gap-1 text-[12px] font-semibold transition active:opacity-70"
        style={{ color: "rgba(255,255,255,0.55)" }}
      >
        <ArrowRight
          className="size-3.5 rotate-180"
          style={{ color: EMERALD }}
        />
        Retailers
      </Link>

      {/* Heading */}
      <header className="flex items-center gap-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
          style={{
            background: `linear-gradient(135deg, ${INDIGO}, ${VIOLET})`,
            boxShadow: `0 4px 14px ${INDIGO}40`,
          }}
        >
          {retailer.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-white/40">Update entry</p>
          <h1 className="truncate text-xl font-bold leading-tight text-white">
            {retailer.name}
          </h1>
        </div>
      </header>

      {/* Tab strip */}
      <div
        className="grid grid-cols-4 rounded-xl p-1"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {TABS.map((t) => {
          const isActive = active === t.id;
          const count = counts[t.id];
          const showCount = t.id !== "retailer";
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className="relative flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-bold transition active:scale-[0.97]"
              aria-current={isActive ? "page" : undefined}
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${t.color}22, ${t.color}11)`,
                      color: t.color,
                      border: `1px solid ${t.color}33`,
                      boxShadow: `0 4px 12px ${t.color}25`,
                    }
                  : { color: "rgba(255,255,255,0.5)" }
              }
            >
              <span>{t.label}</span>
              {showCount && (
                <span className="text-[9px] tabular-nums opacity-70">
                  {String(count).padStart(2, "0")}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {active === "retailer" && (
        <RetailerForm initial={retailer} redirectTo={redirectTo} />
      )}

      {active === "invoices" && (
        <RelatedList
          title="Invoices"
          color={VIOLET}
          Icon={FileText}
          searchable
          selectable
          retailerId={retailer.id}
          searchPlaceholder="Search by invoice no…"
          items={invoices.map((i) => ({
            id: i.id,
            label: i.invoiceNumber
              ? `Inv #${i.invoiceNumber}`
              : `Invoice`,
            sub: i.date,
            amount: i.invoiceAmount,
            search: i.invoiceNumber ?? "",
          }))}
          emptyText="No invoices for this retailer."
          openHref={(id) => `/invoice/invoices/${id}`}
          newHref={`/invoice/invoices/new?retailerId=${retailer.id}&returnTo=${encodeURIComponent(`/invoice/retailers/${retailer.id}`)}`}
          newLabel="New invoice"
        />
      )}

      {active === "credit" && (
        <RelatedList
          title="Credit notes"
          color={SKY}
          Icon={Undo2}
          items={creditNotes.map((cn) => ({
            id: cn.id,
            label: cn.noteNumber
              ? `CN #${cn.noteNumber}`
              : "Credit note",
            sub: cn.date,
            amount: cn.amount,
          }))}
          emptyText="No credit notes for this retailer."
          openHref={(id) => `/invoice/credit-notes/${id}`}
          newHref={`/invoice/credit-notes/new?retailerId=${retailer.id}&returnTo=${encodeURIComponent(`/invoice/retailers/${retailer.id}`)}`}
          newLabel="New credit note"
        />
      )}

      {active === "payments" && (
        <RelatedList
          title="Payments"
          color={EMERALD}
          Icon={Receipt}
          items={payments.map((p) => ({
            id: p.id,
            label: "Payment",
            sub: p.date,
            amount: p.amount,
          }))}
          emptyText="No payments recorded."
          openHref={(id) => `/invoice/payments/${id}`}
          newHref={`/invoice/payments/new?retailerId=${retailer.id}&returnTo=${encodeURIComponent(`/invoice/retailers/${retailer.id}`)}`}
          newLabel="Record payment"
        />
      )}
    </div>
  );
}

type ListItem = {
  id: string;
  label: string;
  sub?: string;
  amount: number;
  search?: string;
};

type IconType = React.ComponentType<{
  className?: string;
  style?: React.CSSProperties;
}>;

function RelatedList({
  title,
  color,
  Icon,
  items,
  emptyText,
  openHref,
  newHref,
  newLabel,
  searchable,
  searchPlaceholder,
  selectable,
  retailerId,
}: {
  title: string;
  color: string;
  Icon: IconType;
  items: ListItem[];
  emptyText: string;
  openHref: (id: string) => string;
  newHref: string;
  newLabel: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
  retailerId?: string;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mergeOpen, setMergeOpen] = useState(false);
  const pathname = usePathname();

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = items.filter((x) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      (x.search ?? x.label).toLowerCase().includes(q) ||
      x.label.toLowerCase().includes(q)
    );
  });
  const total = filtered.reduce((s, x) => s + x.amount, 0);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-[13px] font-bold text-white">
          <Icon className="size-3.5" style={{ color }} />
          {title}
        </p>
        <Link
          href={newHref}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition active:opacity-70"
          style={{
            color,
            background: `${color}1f`,
            border: `1px solid ${color}33`,
          }}
        >
          <Plus className="size-3" /> {newLabel}
        </Link>
      </div>

      {searchable && items.length > 0 && (
        <div
          className="relative flex items-center gap-2 rounded-xl px-3 py-2"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Search className="size-3.5 shrink-0 text-white/35" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder ?? "Search…"}
            className="min-w-0 flex-1 bg-transparent text-[12px] text-white outline-none placeholder:text-white/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white/55 transition hover:bg-white/5"
            >
              clear
            </button>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div
          className="rounded-xl px-4 py-8 text-center"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed rgba(255,255,255,0.08)",
          }}
        >
          <p className="text-[11px] text-white/40">{emptyText}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-xl px-4 py-6 text-center"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p className="text-[11px] text-white/40">
            No results for &ldquo;
            <span className="text-white/75">{query}</span>&rdquo;
          </p>
        </div>
      ) : (
        <>
          {/* Subtotal pill */}
          <div
            className="flex items-center justify-between gap-2 rounded-xl px-3 py-2"
            style={{
              background: `linear-gradient(135deg, ${color}14, ${color}05)`,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span className="text-[11px] text-white/55">
              <span
                className="font-bold tabular-nums"
                style={{ color }}
              >
                {String(filtered.length).padStart(2, "0")}
              </span>
              {query && (
                <span className="text-white/35">
                  {" "}
                  / {items.length}
                </span>
              )}{" "}
              {title.toLowerCase()}
            </span>
            <span
              className="text-[12px] font-bold tabular-nums"
              style={{ color }}
            >
              {inr.format(total)}
            </span>
          </div>

          <ul className="space-y-2">
            {filtered.map((item) => {
              const isSelected = selected.has(item.id);
              if (selectable) {
                return (
                  <li
                    key={item.id}
                    className="rounded-xl transition"
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${color}1a, ${color}08)`
                        : "rgba(255,255,255,0.03)",
                      border: isSelected
                        ? `1px solid ${color}55`
                        : "1px solid rgba(255,255,255,0.07)",
                      boxShadow: isSelected
                        ? `0 0 0 1px ${color}22, 0 4px 18px ${color}1a`
                        : undefined,
                    }}
                  >
                    <div className="flex items-stretch">
                      <div
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        onClick={() => toggle(item.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggle(item.id);
                          }
                        }}
                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-3 py-2.5 outline-none transition active:opacity-80"
                      >
                        <RowCheckbox checked={isSelected} color={color} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold text-white">
                            {item.label}
                          </p>
                          {item.sub && (
                            <p className="mt-0.5 text-[10px] text-white/40">
                              {item.sub}
                            </p>
                          )}
                        </div>
                        <span
                          className="shrink-0 text-[13px] font-bold tabular-nums"
                          style={{ color }}
                        >
                          {inr.format(item.amount)}
                        </span>
                      </div>
                      <Link
                        href={openHref(item.id)}
                        aria-label="Open invoice"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center border-l px-3 transition hover:bg-white/[0.03] active:opacity-70"
                        style={{ borderColor: "rgba(255,255,255,0.06)" }}
                      >
                        <ArrowRight
                          className="size-3.5"
                          style={{ color, opacity: 0.55 }}
                        />
                      </Link>
                    </div>
                  </li>
                );
              }
              return (
                <li
                  key={item.id}
                  className="rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <Link
                    href={openHref(item.id)}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 transition active:opacity-70"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-white">
                        {item.label}
                      </p>
                      {item.sub && (
                        <p className="mt-0.5 text-[10px] text-white/40">
                          {item.sub}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[13px] font-bold tabular-nums"
                        style={{ color }}
                      >
                        {inr.format(item.amount)}
                      </span>
                      <ArrowRight
                        className="size-3.5"
                        style={{ color, opacity: 0.5 }}
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {selectable && selected.size >= 2 && (
            <MergeBar
              count={selected.size}
              total={filtered
                .filter((x) => selected.has(x.id))
                .reduce((s, x) => s + x.amount, 0)}
              onOpen={() => setMergeOpen(true)}
            />
          )}
        </>
      )}

      {selectable && mergeOpen && retailerId && (
        <MergePayModal
          items={filtered.filter((x) => selected.has(x.id))}
          retailerId={retailerId}
          returnTo={pathname ?? `/invoice/retailers/${retailerId}`}
          onClose={() => setMergeOpen(false)}
        />
      )}
    </section>
  );
}

function RowCheckbox({ checked, color }: { checked: boolean; color: string }) {
  return (
    <span
      aria-hidden
      className="flex size-[18px] shrink-0 items-center justify-center rounded-[5px] transition"
      style={{
        background: checked ? color : "transparent",
        border: `1.5px solid ${checked ? color : "rgba(255,255,255,0.15)"}`,
        boxShadow: checked ? `0 0 0 3px ${color}1f` : undefined,
      }}
    >
      {checked && (
        <Check className="size-3 text-white" strokeWidth={3.5} />
      )}
    </span>
  );
}

function MergeBar({
  count,
  total,
  onOpen,
}: {
  count: number;
  total: number;
  onOpen: () => void;
}) {
  return (
    <div
      className="sticky bottom-4 z-30 mt-3 flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 backdrop-blur"
      style={{
        background: "rgba(167,139,250,0.12)",
        border: "1px solid rgba(167,139,250,0.25)",
        boxShadow: `0 12px 32px rgba(167,139,250,0.20)`,
      }}
    >
      <p
        className="min-w-0 truncate text-[12px] font-bold"
        style={{ color: VIOLET }}
      >
        <span className="tabular-nums">{count}</span>
        <span className="font-semibold text-white/65"> bills selected · </span>
        Total:{" "}
        <span className="tabular-nums">{inr.format(total)}</span>
      </p>
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-bold transition active:opacity-70"
        style={{
          color: VIOLET,
          background: `${VIOLET}26`,
          border: `1px solid ${VIOLET}55`,
        }}
      >
        Merge & Pay
      </button>
    </div>
  );
}

function MergePayModal({
  items,
  retailerId,
  returnTo,
  onClose,
}: {
  items: ListItem[];
  retailerId: string;
  returnTo: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const total = items.reduce((s, x) => s + x.amount, 0);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const amt = Number.parseFloat(String(fd.get("amount") ?? "")) || total;
    const ids = items.map((i) => i.id).join(",");
    const params = new URLSearchParams({
      retailerId,
      mergedInvoiceIds: ids,
      amount: String(amt),
      returnTo,
    });
    router.push(`/invoice/payments/new?${params.toString()}`);
  }

  const fieldCls =
    "w-full rounded-xl bg-white/[0.04] border border-white/10 " +
    "px-3 py-2.5 text-[13px] text-white outline-none transition " +
    "placeholder:text-white/25 focus:border-white/25 focus:bg-white/[0.06]";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Merged Payment"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3"
      style={{
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl"
        style={{
          background: "#13131c",
          border: `1px solid ${VIOLET}33`,
          boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 40px ${VIOLET}1a`,
          maxHeight: "calc(100dvh - 1.5rem)",
        }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] px-4 pb-3 pt-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/40">
              Combine outstanding bills
            </p>
            <h2 className="mt-0.5 text-[16px] font-bold leading-tight text-white">
              Merged Payment
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-white/55 transition hover:bg-white/5 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {/* Selected invoices (read-only) */}
          <ul
            className="space-y-1.5 rounded-xl p-2"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {items.map((it) => (
              <li
                key={it.id}
                className="flex items-center justify-between gap-3 px-2 py-1 text-[12px]"
              >
                <span className="truncate text-white/75">{it.label}</span>
                <span
                  className="shrink-0 font-bold tabular-nums"
                  style={{ color: VIOLET }}
                >
                  {inr.format(it.amount)}
                </span>
              </li>
            ))}
          </ul>

          {/* Total row */}
          <div
            className="h-px"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
              Total
            </span>
            <span
              className="text-[18px] font-bold tabular-nums"
              style={{ color: VIOLET }}
            >
              {inr.format(total)}
            </span>
          </div>

          {/* Date */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-white/60">
              Date
            </label>
            <input
              type="date"
              name="date"
              defaultValue={today}
              required
              className={`${fieldCls} [color-scheme:dark]`}
            />
          </div>

          {/* Payment method */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-white/60">
              Payment mode
            </label>
            <select
              name="method"
              required
              defaultValue="Cash"
              className={`${fieldCls} appearance-none [color-scheme:dark]`}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-white/60">
              Amount
            </label>
            <input
              type="number"
              name="amount"
              min={0}
              step="0.01"
              required
              defaultValue={total}
              className={`${fieldCls} tabular-nums`}
            />
          </div>
        </div>

        {/* Sticky footer with submit */}
        <div
          className="shrink-0 border-t border-white/[0.06] p-3"
          style={{ background: "rgba(19,19,28,0.95)" }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold text-white transition active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${EMERALD}, #10b981)`,
              boxShadow: `0 10px 24px ${EMERALD}40`,
            }}
          >
            Submit Payment
            <ArrowRight className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

