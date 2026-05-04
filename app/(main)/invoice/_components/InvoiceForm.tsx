"use client";

import { useActionState, useMemo, useState } from "react";
import { computeInvoiceAmounts } from "@/lib/store/invoice-math";
import type { Company, Invoice, Retailer } from "@/lib/store/types";
import { FormDatePicker } from "@/app/(main)/invoice/_components/FormDatePicker";
import { FormSelectField } from "@/app/(main)/invoice/_components/FormSelectField";
import {
  type ActionResult,
  saveInvoice,
} from "@/app/(main)/invoice/store-actions";

type Props = {
  companies: Company[];
  retailers: Retailer[];
  initial?: Invoice | null;
  redirectTo: string;
};

export function InvoiceForm({ companies, retailers, initial, redirectTo }: Props) {
  const [companyId, setCompanyId] = useState(initial?.companyId ?? "");
  const [retailerId, setRetailerId] = useState(initial?.retailerId ?? "");
  const [baseAmount, setBaseAmount] = useState(
    String(initial?.baseAmount ?? ""),
  );
  const [gstPercent, setGstPercent] = useState(
    String(initial?.gstPercent ?? "0"),
  );
  const [cdPercent, setCdPercent] = useState(
    String(initial?.cashDiscountPercent ?? "0"),
  );
  const [cdAmount, setCdAmount] = useState(
    initial?.cashDiscountAmountInput != null
      ? String(initial.cashDiscountAmountInput)
      : "",
  );
  const [commissionPercent, setCommissionPercent] = useState(
    String(initial?.commissionPercent ?? "0"),
  );

  const filteredRetailers = useMemo(
    () => retailers.filter((r) => r.companyId === companyId),
    [retailers, companyId],
  );

  const calc = useMemo(() => {
    const base = Number.parseFloat(baseAmount) || 0;
    return computeInvoiceAmounts({
      baseAmount: base,
      gstPercent: Number.parseFloat(gstPercent) || 0,
      cashDiscountPercent: Number.parseFloat(cdPercent) || 0,
      cashDiscountAmountInput:
        cdAmount.trim() === "" ? null : Number.parseFloat(cdAmount),
      commissionPercent: Number.parseFloat(commissionPercent) || 0,
    });
  }, [baseAmount, gstPercent, cdPercent, cdAmount, commissionPercent]);

  const [state, formAction, pending] = useActionState<
    ActionResult | undefined,
    FormData
  >(saveInvoice, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={initial?.id ?? ""} />
      <input type="hidden" name="_redirect" value={redirectTo} />

      {state?.ok === false ? (
        <p className="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      <FormSelectField
        name="companyId"
        label="Company *"
        placeholder="Select company"
        value={companyId}
        onValueChange={(v) => {
          setCompanyId(v);
          setRetailerId("");
        }}
        options={companies.map((c) => ({ value: c.id, label: c.name }))}
      />

      <FormSelectField
        name="retailerId"
        label="Retailer *"
        placeholder={
          !companyId
            ? "Select company first"
            : filteredRetailers.length === 0
              ? "No retailers for this company"
              : "Select retailer"
        }
        value={retailerId}
        onValueChange={setRetailerId}
        options={filteredRetailers.map((r) => ({ value: r.id, label: r.name }))}
        disabled={!companyId || filteredRetailers.length === 0}
      />

      <div>
        <label className="text-sm font-medium text-zinc-300">
          Invoice no. *
        </label>
        <input
          name="invoiceNo"
          required
          defaultValue={initial?.invoiceNo ?? ""}
          className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-300">Quantity *</label>
        <input
          name="quantity"
          type="number"
          min={1}
          step={1}
          required
          defaultValue={initial?.quantity ?? ""}
          className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-300">
          Base amount *
        </label>
        <input
          name="baseAmount"
          type="number"
          min={0}
          step="0.01"
          required
          value={baseAmount}
          onChange={(e) => setBaseAmount(e.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white"
        />
      </div>

      <FormDatePicker
        name="invoiceDate"
        label="Invoice date"
        defaultValue={initial?.invoiceDate?.slice(0, 10)}
      />

      <div>
        <label className="text-sm font-medium text-zinc-300">GST (%)</label>
        <input
          name="gstPercent"
          type="number"
          min={0}
          step="0.01"
          value={gstPercent}
          onChange={(e) => setGstPercent(e.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-300">
          Cash discount (%)
        </label>
        <input
          name="cashDiscountPercent"
          type="number"
          min={0}
          step="0.01"
          value={cdPercent}
          onChange={(e) => setCdPercent(e.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-300">
          Commission (%, on base amount)
        </label>
        <input
          name="commissionPercent"
          type="number"
          min={0}
          step="0.01"
          value={commissionPercent}
          onChange={(e) => setCommissionPercent(e.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-300">
          Cash discount amount (overrides % if both set)
        </label>
        <input
          name="cashDiscountAmountInput"
          type="number"
          min={0}
          step="0.01"
          value={cdAmount}
          onChange={(e) => setCdAmount(e.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white"
        />
      </div>

      <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-sm">
        <p className="mb-2 font-semibold text-zinc-300">Calculated</p>
        <dl className="grid gap-2 text-zinc-400">
          <div className="flex justify-between">
            <dt>Taxable amount</dt>
            <dd className="font-mono text-white">{calc.taxableAmount}</dd>
          </div>
          <div className="flex justify-between">
            <dt>GST amount</dt>
            <dd className="font-mono text-white">{calc.gstAmount}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Invoice amount</dt>
            <dd className="font-mono text-white">{calc.invoiceAmount}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Commission (on base)</dt>
            <dd className="font-mono text-white">{calc.commissionAmount}</dd>
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <dt>Cash discount applied</dt>
            <dd className="font-mono">{calc.cashDiscountApplied}</dd>
          </div>
        </dl>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl border border-zinc-600 bg-zinc-900 py-3 font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {pending ? "Saving…" : initial ? "Update invoice" : "Create invoice"}
      </button>
    </form>
  );
}
