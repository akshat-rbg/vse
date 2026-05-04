import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { get, put } from "@vercel/blob";
import type { AppStore } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

/** Fixed pathname for the JSON snapshot in Vercel Blob (private). */
const BLOB_STORE_PATH = "vse/invoice-app-store.json";

/**
 * Vercel Blob read-write tokens must contain a store id (same rule as @vercel/blob get()).
 * A wrong placeholder env value must NOT enable Blob mode or get() throws before any HTTP call.
 */
function extractBlobStoreId(token: string): string {
  const parts = token.trim().split("_");
  return parts[3] ?? "";
}

function isValidBlobReadWriteToken(token: string | undefined): boolean {
  return Boolean(token?.trim() && extractBlobStoreId(token));
}

/** Raw env value (may be invalid). */
function blobTokenRaw(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim();
}

function useBlobStore(): boolean {
  return isValidBlobReadWriteToken(blobTokenRaw());
}

function hasAnyRecords(s: AppStore): boolean {
  return (
    s.companies.length +
      s.retailers.length +
      s.invoices.length +
      s.payments.length +
      s.creditNotes.length >
    0
  );
}

export function emptyStore(): AppStore {
  return {
    companies: [],
    retailers: [],
    invoices: [],
    payments: [],
    creditNotes: [],
  };
}

function normalizeParsed(parsed: unknown): AppStore {
  const o = parsed as Partial<AppStore> | null | undefined;
  return {
    companies: o?.companies ?? [],
    retailers: o?.retailers ?? [],
    invoices: o?.invoices ?? [],
    payments: o?.payments ?? [],
    creditNotes: o?.creditNotes ?? [],
  };
}

async function loadFromBlob(): Promise<AppStore> {
  const r = await get(BLOB_STORE_PATH, { access: "private" });
  if (!r || r.statusCode !== 200 || !r.stream) {
    return emptyStore();
  }
  const text = await new Response(r.stream).text();
  try {
    return normalizeParsed(JSON.parse(text));
  } catch {
    return emptyStore();
  }
}

async function saveToBlob(store: AppStore): Promise<void> {
  const body = JSON.stringify(store, null, 2);
  try {
    await put(BLOB_STORE_PATH, body, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
  } catch (e: unknown) {
    const hint =
      e instanceof Error ? e.message : String(e);
    throw new Error(
      `Blob save failed (${hint}). Confirm Vercel → Storage → Blob is linked and ` +
        `BLOB_READ_WRITE_TOKEN is present for this environment (Production vs Preview).`,
    );
  }
}

async function loadFromFile(): Promise<AppStore> {
  try {
    const raw = await readFile(STORE_FILE, "utf-8");
    return normalizeParsed(JSON.parse(raw));
  } catch {
    return emptyStore();
  }
}

async function saveToFile(store: AppStore): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
}

/**
 * Load store: valid Blob token → Blob; else local file.
 * If Blob load throws (network / API), fall back to local file when it has data; otherwise empty.
 */
export async function loadStore(): Promise<AppStore> {
  if (blobTokenRaw() && !isValidBlobReadWriteToken(blobTokenRaw())) {
    console.warn(
      "[vse] BLOB_READ_WRITE_TOKEN is set but invalid (could not parse store id). Using local file only.",
    );
    return loadFromFile();
  }

  if (useBlobStore()) {
    try {
      return await loadFromBlob();
    } catch (e: unknown) {
      console.error("[vse] loadFromBlob failed:", e);
      const local = await loadFromFile();
      if (hasAnyRecords(local)) return local;
      return emptyStore();
    }
  }

  return loadFromFile();
}

export async function saveStore(store: AppStore): Promise<void> {
  if (blobTokenRaw() && !isValidBlobReadWriteToken(blobTokenRaw())) {
    await saveToFile(store);
    return;
  }

  if (useBlobStore()) {
    await saveToBlob(store);
    return;
  }
  try {
    await saveToFile(store);
  } catch (e: unknown) {
    const err = e as NodeJS.ErrnoException;
    if (err?.code === "EROFS" || err?.code === "EPERM") {
      throw new Error(
        "Cannot save invoice data: the server filesystem is read-only (normal on Vercel). " +
          "Add Vercel Blob: Project → Storage → Blob → create store so BLOB_READ_WRITE_TOKEN exists, " +
          "then redeploy. Locally run `vercel env pull` or remove the token to use data/store.json.",
      );
    }
    throw e;
  }
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
