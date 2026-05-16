import { ChevronLeft, Store } from "lucide-react";
import Link from "next/link";
import { RetailerForm } from "@/app/(main)/invoice/_components/RetailerForm";
import { safePostSaveRedirect } from "@/app/(main)/invoice/redirect-utils";

const INDIGO = "#818cf8";
const VIOLET = "#a78bfa";
const EMERALD = "#34d399";

type Props = { searchParams?: Promise<{ returnTo?: string }> };

export default async function NewRetailerPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const redirectTo = safePostSaveRedirect(
    typeof sp.returnTo === "string" ? sp.returnTo : undefined,
    "/invoice/retailers",
  );

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-1 pb-6">
      <Link
        href="/invoice/retailers"
        className="inline-flex items-center gap-1 text-[12px] font-semibold transition active:opacity-70"
        style={{ color: "rgba(255,255,255,0.55)" }}
      >
        <ChevronLeft className="size-3.5" style={{ color: EMERALD }} />
        Retailers
      </Link>

      <header className="flex items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${INDIGO}, ${VIOLET})`,
            boxShadow: `0 4px 14px ${INDIGO}40`,
          }}
        >
          <Store className="size-5 text-white" />
        </div>
        <div>
          <p className="text-[11px] text-white/40">New entry</p>
          <h1 className="text-xl font-bold leading-tight text-white">
            Add retailer
          </h1>
        </div>
      </header>

      <RetailerForm initial={null} redirectTo={redirectTo} />
    </div>
  );
}
