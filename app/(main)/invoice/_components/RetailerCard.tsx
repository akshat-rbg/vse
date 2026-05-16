"use client";

import Link from "next/link";
import { DeleteEntityButton } from "@/app/(main)/invoice/_components/DeleteEntityButton";
import { deleteRetailer } from "@/app/(main)/invoice/store-actions";

type Props = {
  id: string;
  name: string;
  taxIdType: "GST" | "PAN";
  invoiceCount: number;
  totalBilled: number;
  onDelete?: (id: string) => void;
};

const INDIGO = "#818cf8";
const VIOLET = "#a78bfa";
const EMERALD = "#34d399";
const SKY = "#38bdf8";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function RetailerCard({
  id,
  name,
  taxIdType,
  invoiceCount,
  totalBilled,
  onDelete,
}: Props) {
  const initial = name.charAt(0).toUpperCase();
  const hasInvoices = invoiceCount > 0;
  const tagColor = taxIdType === "GST" ? EMERALD : SKY;

  return (
    <article
      className="relative overflow-hidden rounded-xl"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center gap-2.5 p-2.5">
        <Link
          href={`/invoice/retailers/${id}`}
          className="flex min-w-0 flex-1 items-center gap-2.5 transition active:opacity-70"
        >
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${INDIGO}, ${VIOLET})`,
              boxShadow: `0 4px 10px ${INDIGO}30`,
            }}
          >
            {initial}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[13px] font-semibold leading-tight text-white">
                {name}
              </p>
              <span
                className="shrink-0 rounded-md px-1.5 py-0.5 text-[8px] font-bold tracking-wide"
                style={{
                  background: `${tagColor}1f`,
                  color: tagColor,
                  border: `1px solid ${tagColor}40`,
                }}
              >
                {taxIdType}
              </span>
            </div>
            <p className="mt-0.5 truncate text-[11px]">
              <span
                className="font-bold tabular-nums"
                style={{
                  color: hasInvoices
                    ? "rgba(255,255,255,0.85)"
                    : "rgba(255,255,255,0.3)",
                }}
              >
                {invoiceCount}
              </span>
              <span className="text-white/40">
                {" "}
                bill{invoiceCount !== 1 ? "s" : ""}
                {" · "}
              </span>
              <span
                className="font-bold tabular-nums"
                style={{
                  color: hasInvoices ? EMERALD : "rgba(255,255,255,0.3)",
                }}
              >
                {hasInvoices ? inr.format(totalBilled) : "—"}
              </span>
            </p>
          </div>
        </Link>

        <DeleteEntityButton
          id={id}
          onDelete={deleteRetailer}
          onSuccess={onDelete}
          confirmMessage="Delete retailer? Remove invoices first."
          iconOnly
        />
      </div>
    </article>
  );
}
