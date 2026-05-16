-- =============================================================
--  Decouple retailers from companies.
--  Retailers are now standalone; the company<->retailer pairing
--  is captured per-invoice (invoices.company_id + retailer_id).
--  Run this in the Supabase SQL editor.
-- =============================================================

begin;

-- Views referencing retailers.company_id must be dropped first
-- (they'll be recreated below without that column).
drop view if exists public.retailer_summary;
drop view if exists public.company_summary;

-- Drop the FK index then the column itself.
drop index if exists public.idx_retailers_company;
alter table public.retailers drop column if exists company_id;

-- Recreate company_summary: retailer_count is now derived from
-- distinct retailers that appear on this company's invoices.
create or replace view public.company_summary as
select
  c.id,
  c.user_id,
  c.name,
  c.phone,
  c.gst_number,
  c.email,
  c.city,
  c.state,

  count(distinct i.retailer_id)              as retailer_count,
  count(distinct i.id)                       as invoice_count,

  coalesce(sum(i.invoice_amount),  0)        as total_billed,
  coalesce(sum(i.commission_amount), 0)      as total_commission,
  coalesce(sum(i.gst_amount),      0)        as total_gst,

  coalesce(sum(p.total_paid), 0)             as total_paid,
  greatest(
    0,
    coalesce(sum(i.invoice_amount), 0) - coalesce(sum(p.total_paid), 0)
  )                                          as total_outstanding,

  coalesce(sum(cn.total_return_amount), 0)   as total_returns,

  c.created_at,
  c.updated_at

from public.companies c
left join public.invoices  i  on i.company_id = c.id

left join (
  select invoice_id, sum(amount) as total_paid
  from public.payments group by invoice_id
) p on p.invoice_id = i.id

left join (
  select invoice_id, sum(goods_return_amount) as total_return_amount
  from public.credit_notes group by invoice_id
) cn on cn.invoice_id = i.id

group by c.id;

-- Recreate retailer_summary without company_id / company_name.
create or replace view public.retailer_summary as
select
  r.id,
  r.user_id,
  r.name,
  r.phone,
  r.tax_id_type,
  r.tax_id,
  r.address,

  count(distinct i.id)                       as invoice_count,
  coalesce(sum(i.invoice_amount),  0)        as total_billed,
  coalesce(sum(i.commission_amount), 0)      as total_commission,
  coalesce(sum(p.total_paid), 0)             as total_paid,
  greatest(
    0,
    coalesce(sum(i.invoice_amount), 0) - coalesce(sum(p.total_paid), 0)
  )                                          as total_outstanding,

  r.created_at,
  r.updated_at

from public.retailers r
left join public.invoices i on i.retailer_id = r.id
left join (
  select invoice_id, sum(amount) as total_paid
  from public.payments group by invoice_id
) p on p.invoice_id = i.id

group by r.id;

commit;
