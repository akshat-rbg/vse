-- =============================================================
--  Add payment_group_id to payments.
--  Purpose: when a single user transaction settles multiple
--  invoices (Merge & Pay), each invoice still gets its own
--  payment row (1:1 with invoice_id), but all rows from one
--  transaction share the same payment_group_id so reports can
--  reconstruct "these were one payment".
--
--  Null = single-invoice payment (legacy + ongoing default).
--  Non-null uuid = part of a merged-payment group.
--  Run this in the Supabase SQL editor.
-- =============================================================

alter table public.payments
  add column if not exists payment_group_id uuid;

create index if not exists idx_payments_group
  on public.payments(payment_group_id);
