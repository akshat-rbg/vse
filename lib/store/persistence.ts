import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { get, put } from "@vercel/blob";
import type { AppStore } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

/** Fixed pathname for the JSON snapshot in Vercel Blob (private). */
const BLOB_STORE_PATH = "vse/invoice-app-store.json";

function useBlobStore(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
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
  await put(BLOB_STORE_PATH, body, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
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

export async function loadStore(): Promise<AppStore> {
  if (useBlobStore()) {
    return loadFromBlob();
  }
  return loadFromFile();
}

export async function saveStore(store: AppStore): Promise<void> {
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
        "Cannot save invoice data: the server filesystem is read-only (this is normal on Vercel). " +
          "In Vercel: Project → Storage → Blob → create a store so BLOB_READ_WRITE_TOKEN is set, then redeploy. " +
          "Locally: copy `BLOB_READ_WRITE_TOKEN` with `vercel env pull` or keep using `data/store.json` without that env var.",
      );
    }
    throw e;
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
