"use client";

import { AlertCircle, ArrowRight, Layers } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import {
  type ActionResult,
  saveMergedPayment,
} from "@/app/(main)/invoice/store-actions";
import type { Invoice } from "@/lib/store/types";

const VIOLET = "#a78bfa";
const EMERALD = "#34d399";
const ROSE = "#fb7185";

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

const fieldCls =
  "w-full rounded-xl bg-white/[0.04] border border-white/10 " +
  "px-3.5 py-3 text-[14px] text-white outline-none transition " +
  "placeholder:text-white/25 focus:border-violet-400/60 focus:bg-white/[0.06] " +
  "focus:shadow-[0_0_0_3px_rgba(167,139,250,0.18)]";

export function MergedPaymentForm({
  retailerId,
  retailerName,
  invoices,
  defaultAmount,
  redirectTo,
}: {
  retailerId: string;
  retailerName: string;
  invoices: Invoice[];
  defaultAmount: number;
  redirectTo: string;
}) {
  const [state, formAction, pending] = useActionState<
    ActionResult | undefined,
    FormData
  >(saveMergedPayment, undefined);

  const today = new Date().toISOString().slice(0, 10);
  const [amount, setAmount] = useState(String(defaultAmount));

  const outstandingTotal = useMemo(
    () => invoices.reduce((s, i) => s + i.invoiceAmount, 0),
    [invoices],
  );

  const numericAmount = Number.parseFloat(amount) || 0;
  const diff = Math.round((numericAmount - outstandingTotal) * 100) / 100;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="retailerId" value={retailerId} />
      <input
        type="hidden"
        name="mergedInvoiceIds"
        value={invoices.map((i) => i.id).join(",")}
      />
      <input type="hidden" name="_redirect" value={redirectTo} />

      {state?.ok === false && (
        <div
          className="flex items-start gap-2.5 rounded-xl px-3.5 py-2.5 text-[12px] leading-relaxed"
          style={{
            background: `${ROSE}14`,
            border: `1px solid ${ROSE}33`,
            color: "#fda4af",
          }}
        >
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Summary header */}
      <div
        className="flex items-center gap-3 rounded-2xl p-3.5"
        style={{
          background: `linear-gradient(135deg, ${VIOLET}1a, ${VIOLET}08)`,
          border: `1px solid ${VIOLET}33`,
        }}
      >
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${VIOLET}, #c084fc)`,
            boxShadow: `0 4px 14px ${VIOLET}40`,
          }}
        >
          <Layers className="size-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">
            Merging
          </p>
          <p className="truncate text-[14px] font-bold leading-tight text-white">
            {invoices.length} bills · {retailerName}
          </p>
        </div>
      </div>

      {/* Selected invoices */}
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
          Included invoices
        </p>
        <ul
          className="space-y-1 rounded-xl p-2"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {invoices.map((i) => (
            <li
              key={i.id}
              className="flex items-center justify-between gap-3 px-2 py-1.5 text-[12px]"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="size-1 shrink-0 rounded-full"
                  style={{ background: `${VIOLET}AA` }}
                />
                <span className="truncate text-white/80 font-semibold">
                  Inv #{i.invoiceNo}
                </span>
                <span className="shrink-0 text-[10px] text-white/35">
                  {i.invoiceDate}
                </span>
              </span>
              <span
                className="shrink-0 font-bold tabular-nums"
                style={{ color: VIOLET }}
              >
                {inr.format(i.invoiceAmount)}
              </span>
            </li>
          ))}
        </ul>

        <div
          className="mt-2 h-px"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        <div className="mt-2 flex items-baseline justify-between px-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
            Outstanding total
          </span>
          <span
            className="text-[16px] font-bold tabular-nums"
            style={{ color: VIOLET }}
          >
            {inr.format(outstandingTotal)}
          </span>
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="mb-1.5 block text-[11px] font-semibold text-white/60">
          Date <span style={{ color: ROSE }}>*</span>
        </label>
        <input
          type="date"
          name="date"
          defaultValue={today}
          required
          className={`${fieldCls} [color-scheme:dark]`}
        />
      </div>

      {/* Method */}
      <div>
        <label className="mb-1.5 block text-[11px] font-semibold text-white/60">
          Payment method <span style={{ color: ROSE }}>*</span>
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
          Amount to pay <span style={{ color: ROSE }}>*</span>
        </label>
        <input
          type="number"
          name="amount"
          min={0.01}
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={`${fieldCls} tabular-nums`}
        />
        {numericAmount > 0 && diff !== 0 && (
          <p
            className="mt-1.5 text-[11px]"
            style={{ color: diff > 0 ? EMERALD : "rgba(255,255,255,0.55)" }}
          >
            {diff > 0
              ? `Overpay of ${inr.format(diff)} — applied to the last invoice.`
              : `${inr.format(-diff)} less than outstanding — allocated FIFO (oldest first).`}
          </p>
        )}
      </div>

      {/* Allocation note */}
      <p className="text-[10.5px] leading-relaxed text-white/40">
        Payment is split across invoices in order of date (oldest first) until
        the amount is exhausted. Each invoice keeps its own payment record,
        linked by a shared transaction id.
      </p>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[14px] font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
        style={{
          background: `linear-gradient(135deg, ${EMERALD}, #10b981)`,
          boxShadow: `0 10px 28px ${EMERALD}40`,
        }}
      >
        {pending ? "Saving…" : "Confirm merged payment"}
        {!pending && <ArrowRight className="size-4" />}
      </button>
    </form>
  );
}
