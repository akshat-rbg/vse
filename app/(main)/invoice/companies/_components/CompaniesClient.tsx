"use client";

import { Building2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DeleteEntityButton } from "@/app/(main)/invoice/_components/DeleteEntityButton";
import { deleteCompany } from "@/app/(main)/invoice/store-actions";
import type { CompanyWithStats } from "../page";

const SKY = "#38bdf8";
const INDIGO = "#818cf8";
const EMERALD = "#34d399";

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

export function CompaniesClient({
  companies,
}: {
  companies: CompanyWithStats[];
}) {
      const [query, setQuery] = useState("");
  const [items, setItems] = useState(companies);

  const filtered = items.filter((c) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.gstNumber.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.city ?? "").toLowerCase().includes(q) ||
      (c.state ?? "").toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q)
    );
  });

  const totalBilledAll = filtered.reduce(
    (s, c) => s + (c.totalBilled ?? 0),
    0,
  );
  const totalBillsAll = filtered.reduce(
    (s, c) => s + (c.invoiceCount ?? 0),
    0,
  );

  return (
    <div className="mx-auto max-w-md space-y-4 px-1 pb-24 lg:max-w-3xl lg:pb-6">
      {/* Header */}
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] text-white/40">Workspace</p>
          <h1 className="mt-0.5 flex items-center gap-2 text-xl font-bold leading-tight text-white">
            Companies
            <Building2 className="size-4" style={{ color: SKY }} />
          </h1>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold tabular-nums"
          style={{
            background: `${SKY}1f`,
            color: SKY,
            border: `1px solid ${SKY}33`,
          }}
        >
          {companies.length}
        </span>
      </header>

      {/* Search */}
      {companies.length > 0 && (
        <div
          className="relative flex items-center gap-2 rounded-xl px-3 py-2.5"
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
            placeholder="Search name, GST, city…"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold text-white/55 transition hover:bg-white/5"
            >
              clear
            </button>
          )}
        </div>
      )}

      {/* Subtotal pill */}
      {companies.length > 0 && filtered.length > 0 && (
        <div
          className="flex items-center justify-between gap-2 rounded-xl px-3 py-2"
          style={{
            background: `linear-gradient(135deg, ${SKY}14, ${INDIGO}0a)`,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-2.5 text-[11px]">
            <span className="text-white/55">
              {query ? "Match" : "Total"}
            </span>
            <span
              className="font-bold tabular-nums"
              style={{ color: SKY }}
            >
              {filtered.length}
              {query && ` / ${companies.length}`}
            </span>
            <span className="text-white/30">·</span>
            <span className="text-white/55">
              <span className="font-bold tabular-nums text-white/85">
                {totalBillsAll}
              </span>{" "}
              bills
            </span>
          </div>
          <span
            className="text-[12px] font-bold tabular-nums"
            style={{ color: EMERALD }}
          >
            {formatCompact(totalBilledAll)}
          </span>
        </div>
      )}

      {/* Empty / no-match / list */}
      {companies.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <NoMatch query={query} />
      ) : (
            <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {filtered.map((c) => (
            <CompanyRow
              key={c.id}
              c={c}
              onDelete={(id) => setItems((prev) => prev.filter((x) => x.id !== id))}
            />
          ))}
        </ul>
      )}

      {/* FAB */}
      <Link
        href="/invoice/companies/new?returnTo=%2Finvoice%2Fcompanies"
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full px-4 py-3 text-[12px] font-bold text-white shadow-xl transition active:scale-[0.95] lg:bottom-6 lg:right-6"
        style={{
          background: `linear-gradient(135deg, ${SKY}, ${INDIGO})`,
          boxShadow: `0 8px 24px ${SKY}55`,
        }}
        aria-label="Add company"
      >
        <Plus className="size-3.5" />
        <span>New company</span>
      </Link>
    </div>
  );
}

function CompanyRow({ c, onDelete }: { c: CompanyWithStats; onDelete: (id: string) => void }) {
  const initial = c.name.charAt(0).toUpperCase();
  const hasInvoices = c.invoiceCount > 0;
  const location = [c.city, c.state].filter(Boolean).join(", ");

  return (
    <li
      className="relative overflow-hidden rounded-xl"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center gap-2.5 p-2.5">
        <Link
          href={`/invoice/companies/${c.id}`}
          className="flex min-w-0 flex-1 items-center gap-2.5 transition active:opacity-70"
        >
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${SKY}, ${INDIGO})`,
              boxShadow: `0 4px 10px ${SKY}30`,
            }}
          >
            {initial}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold leading-tight text-white">
              {c.name}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-white/40">
              {c.gstNumber || "no gst"}
              {location && ` · ${location}`}
            </p>
            <p className="mt-0.5 truncate text-[11px]">
              <span
                className="font-bold tabular-nums"
                style={{
                  color: hasInvoices
                    ? "rgba(255,255,255,0.85)"
                    : "rgba(255,255,255,0.3)",
                }}
              >
                {c.invoiceCount}
              </span>
              <span className="text-white/40">
                {" "}
                bill{c.invoiceCount !== 1 ? "s" : ""}
                {" · "}
              </span>
              <span
                className="font-bold tabular-nums"
                style={{
                  color: hasInvoices ? EMERALD : "rgba(255,255,255,0.3)",
                }}
              >
                {hasInvoices ? inr.format(c.totalBilled) : "—"}
              </span>
            </p>
          </div>
        </Link>

        <DeleteEntityButton
          id={c.id}
          onDelete={deleteCompany}
          onSuccess={onDelete}
          confirmMessage="Delete this company? Retailers and invoices must be removed first."
          iconOnly
        />
      </div>
    </li>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-2xl px-5 py-10 text-center"
      style={{
        background: `linear-gradient(180deg, ${SKY}10, transparent)`,
        border: "1px dashed rgba(255,255,255,0.1)",
      }}
    >
      <div
        className="mx-auto flex size-12 items-center justify-center rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${SKY}30, ${INDIGO}20)`,
        }}
      >
        <Building2 className="size-6" style={{ color: SKY }} />
      </div>
      <p className="mt-3 text-sm font-bold text-white">
        No companies yet
      </p>
      <p className="mt-1 text-[11px] text-white/45">
        Add your first company to begin.
      </p>
      <Link
        href="/invoice/companies/new?returnTo=%2Finvoice%2Fcompanies"
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[11px] font-bold text-white transition active:scale-[0.97]"
        style={{
          background: `linear-gradient(135deg, ${SKY}, ${INDIGO})`,
          boxShadow: `0 4px 14px ${SKY}40`,
        }}
      >
        <Plus className="size-3" /> Add company
      </Link>
    </div>
  );
}

function NoMatch({ query }: { query: string }) {
  return (
    <div
      className="rounded-xl px-4 py-6 text-center"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Search className="mx-auto size-5 text-white/35" />
      <p className="mt-2 text-[11px] text-white/45">
        No results for &ldquo;
        <span className="text-white/75">{query}</span>&rdquo;
      </p>
    </div>
  );
}
