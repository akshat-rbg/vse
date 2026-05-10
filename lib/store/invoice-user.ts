import { createClient } from "@/lib/supabase/server";

/** Signed-in user id for invoice RLS, or null if no session. */
export async function getInvoiceUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}
