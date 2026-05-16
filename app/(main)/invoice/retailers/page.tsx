import { getStore } from "@/app/(main)/invoice/store-actions";
import { RetailersClient } from "./RetailersClient";

export type EnrichedRetailer = {
  id: string;
  name: string;
  taxIdType: "GST" | "PAN";
  taxId: string;
  phone: string;
  invoiceCount: number;
  totalBilled: number;
  totalCommission: number;
};

export default async function RetailersListPage() {
  const store = await getStore();

  const statsByRetailer = new Map<
    string,
    { count: number; total: number; commission: number }
  >();

  for (const inv of store.invoices) {
    const cur = statsByRetailer.get(inv.retailerId) ?? {
      count: 0,
      total: 0,
      commission: 0,
    };
    statsByRetailer.set(inv.retailerId, {
      count: cur.count + 1,
      total: Math.round((cur.total + inv.invoiceAmount) * 100) / 100,
      commission:
        Math.round((cur.commission + inv.commissionAmount) * 100) / 100,
    });
  }

  const enriched: EnrichedRetailer[] = store.retailers.map((r) => {
    const stats = statsByRetailer.get(r.id);
    return {
      id: r.id,
      name: r.name,
      taxIdType: r.taxIdType,
      taxId: r.taxId ?? "",
      phone: r.phone ?? "",
      invoiceCount: stats?.count ?? 0,
      totalBilled: stats?.total ?? 0,
      totalCommission: stats?.commission ?? 0,
    };
  });

  return <RetailersClient retailers={enriched} />;
}
