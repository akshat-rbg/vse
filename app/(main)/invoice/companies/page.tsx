import { getStore } from "@/app/(main)/invoice/store-actions";
import { CompaniesClient } from "./_components/CompaniesClient";
import type { Company } from "@/lib/store/types";

export type CompanyWithStats = Company & {
  invoiceCount: number;
  totalBilled: number;
  totalPaid: number;
  outstanding: number;
  totalCommission: number;
};

export default async function CompaniesListPage() {
  const store = await getStore();

  const paidByInvoice = new Map<string, number>();
  for (const p of store.payments) {
    paidByInvoice.set(p.invoiceId, (paidByInvoice.get(p.invoiceId) ?? 0) + p.amount);
  }

  const companies: CompanyWithStats[] = store.companies.map((c) => {
    const invoices = store.invoices.filter((inv) => inv.companyId === c.id);
    const totalBilled = invoices.reduce((s, inv) => s + inv.invoiceAmount, 0);
    const totalPaid   = invoices.reduce((s, inv) => s + (paidByInvoice.get(inv.id) ?? 0), 0);
    const totalCommission = invoices.reduce((s, inv) => s + inv.commissionAmount, 0);
    return {
      ...c,
      invoiceCount: invoices.length,
      totalBilled:  Math.round(totalBilled * 100) / 100,
      totalPaid:    Math.round(totalPaid   * 100) / 100,
      outstanding:  Math.max(0, Math.round((totalBilled - totalPaid) * 100) / 100),
      totalCommission: Math.round(totalCommission * 100) / 100,
    };
  });

  return (
    <div className="max-w-5xl">
      <CompaniesClient companies={companies} />
    </div>
  );
}
