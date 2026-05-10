"use client";

import { Plus, Search, Store } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { RetailerCard } from "@/app/(main)/invoice/_components/RetailerCard";
import type { EnrichedRetailer } from "./page";

const INDIGO = "#818cf8";
const VIOLET = "#a78bfa";
const EMERALD = "#34d399";

function formatCompact(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

export function RetailersClient({
  retailers,
  hasCompanies,
}: {
  retailers: EnrichedRetailer[];
  hasCompanies: boolean;
}) {
      const [query, setQuery] = useState("");
  const [items, setItems] = useState(retailers);

  const filtered = items.filter((r) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      (r.companyName ?? "").toLowerCase().includes(q) ||
      r.taxId.toLowerCase().includes(q) ||
      r.phone.includes(q)
    );
  });

  const totalBills = filtered.reduce((s, r) => s + r.invoiceCount, 0);
  const totalBilled = filtered.reduce((s, r) => s + r.totalBilled, 0);

  return (
    <div className="mx-auto max-w-md space-y-4 px-1 pb-24 lg:max-w-3xl lg:pb-6">
      {/* Header */}
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] text-white/40">Workspace</p>
          <h1 className="mt-0.5 flex items-center gap-2 text-xl font-bold leading-tight text-white">
            Retailers
            <Store className="size-4" style={{ color: EMERALD }} />
          </h1>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold tabular-nums"
          style={{
            background: `${INDIGO}1f`,
            color: INDIGO,
            border: `1px solid ${INDIGO}33`,
          }}
        >
          {retailers.length}
        </span>
      </header>

      {/* Search */}
      {retailers.length > 0 && (
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
            placeholder="Search name, company, GST, phone…"
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

      {/* Subtotal */}
      {retailers.length > 0 && filtered.length > 0 && (
        <div
          className="flex items-center justify-between gap-2 rounded-xl px-3 py-2"
          style={{
            background: `linear-gradient(135deg, ${INDIGO}14, ${VIOLET}0a)`,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-2.5 text-[11px]">
            <span className="text-white/55">
              {query ? "Match" : "Total"}
            </span>
            <span
              className="font-bold tabular-nums"
              style={{ color: INDIGO }}
            >
              {filtered.length}
              {query && ` / ${retailers.length}`}
            </span>
            <span className="text-white/30">·</span>
            <span className="text-white/55">
              <span className="font-bold tabular-nums text-white/85">
                {totalBills}
              </span>{" "}
              bills
            </span>
          </div>
          <span
            className="text-[12px] font-bold tabular-nums"
            style={{ color: EMERALD }}
          >
            {formatCompact(totalBilled)}
          </span>
        </div>
      )}

      {retailers.length === 0 ? (
        <EmptyState hasCompanies={hasCompanies} />
      ) : filtered.length === 0 ? (
        <NoMatch query={query} />
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <RetailerCard
              key={r.id}
              id={r.id}
              name={r.name}
              companyName={r.companyName}
              taxIdType={r.taxIdType}
              invoiceCount={r.invoiceCount}
              totalBilled={r.totalBilled}
              onDelete={(id) => setItems((prev) => prev.filter((x) => x.id !== id))}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      {hasCompanies && (
        <Link
          href="/invoice/retailers/new?returnTo=%2Finvoice%2Fretailers"
          className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full px-4 py-3 text-[12px] font-bold text-white shadow-xl transition active:scale-[0.95] lg:bottom-6 lg:right-6"
          style={{
            background: `linear-gradient(135deg, ${INDIGO}, ${VIOLET})`,
            boxShadow: `0 8px 24px ${INDIGO}55`,
          }}
        >
          <Plus className="size-3.5" />
          <span>New retailer</span>
        </Link>
      )}
    </div>
  );
}

function EmptyState({ hasCompanies }: { hasCompanies: boolean }) {
  return (
    <div
      className="rounded-2xl px-5 py-10 text-center"
      style={{
        background: `linear-gradient(180deg, ${INDIGO}10, transparent)`,
        border: "1px dashed rgba(255,255,255,0.1)",
      }}
    >
      <div
        className="mx-auto flex size-12 items-center justify-center rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${INDIGO}30, ${VIOLET}20)`,
        }}
      >
        <Store className="size-6" style={{ color: INDIGO }} />
      </div>
      <p className="mt-3 text-sm font-bold text-white">
        No retailers yet
      </p>
      <p className="mt-1 text-[11px] text-white/45">
        {hasCompanies
          ? "Add your first retailer to get started."
          : "Add a company first, then a retailer."}
      </p>
      {hasCompanies && (
        <Link
          href="/invoice/retailers/new?returnTo=%2Finvoice%2Fretailers"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[11px] font-bold text-white transition active:scale-[0.97]"
          style={{
            background: `linear-gradient(135deg, ${INDIGO}, ${VIOLET})`,
            boxShadow: `0 4px 14px ${INDIGO}40`,
          }}
        >
          <Plus className="size-3" /> Add retailer
        </Link>
      )}
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
