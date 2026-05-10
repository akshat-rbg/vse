import { getInvoiceUserId } from "./invoice-user";
import {
  loadAppStoreFromSupabase,
  saveAppStoreToSupabase,
} from "./supabase-invoice-persistence";
import type { AppStore } from "./types";

export function emptyStore(): AppStore {
  return {
    companies: [],
    retailers: [],
    invoices: [],
    payments: [],
    creditNotes: [],
  };
}

export async function loadStore(): Promise<AppStore> {
  const userId = await getInvoiceUserId();
  if (!userId) return emptyStore();
  return loadAppStoreFromSupabase(userId);
}

export async function saveStore(store: AppStore): Promise<void> {
  const userId = await getInvoiceUserId();
  if (!userId) {
    throw new Error("You must be signed in to save invoice data.");
  }
  await saveAppStoreToSupabase(userId, store);
}

/** Use from server actions so save failures surface as form errors instead of HTTP 500. */
export async function tryWriteStore(
  store: AppStore,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await saveStore(store);
    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not save invoice data.";
    return { ok: false, error: msg };
  }
}

export async function updateStore(
  updater: (draft: AppStore) => void,
): Promise<AppStore> {
  const store = await loadStore();
  updater(store);
  await saveStore(store);
  return store;
}
