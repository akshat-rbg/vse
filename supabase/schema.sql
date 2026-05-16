-- =============================================================
--  VSE — Vishwa Shree Enterprises
--  Full schema: tables + indexes + RLS + aggregation views
--  Run this in Supabase SQL editor (or psql against your DB)
--  Order: extensions → tables → indexes → RLS → views
-- =============================================================

-- ─────────────────────────────────────────────
--  0. Extensions
-- ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";


-- =============================================================
--  1. TABLES
-- =============================================================

-- ─────────────────────────────────────────────
--  1a. companies
-- ─────────────────────────────────────────────
create table if not exists public.companies (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,

  name         text not null,
  phone        char(10) not null,           -- 10-digit mobile
  gst_number   char(15) not null,           -- 15-char GSTIN
  telephone    text,
  alt_phone    char(10),
  email        text,
  address      text,
  city         text,
  state        text,
  pin_code     char(6),

  -- bank details
  bank_name    text,
  ac_no        text,
  ifsc_code    char(11),
  branch       text,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────
--  1b. retailers
-- ─────────────────────────────────────────────
create table if not exists public.retailers (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,

  name                text not null,
  address             text not null,
  phone               char(10) not null,
  tax_id_type         text not null check (tax_id_type in ('GST','PAN')),
  tax_id              text not null,
  contact_person_name text,
  telephone           text,
  alt_phone           char(10),

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─────────────────────────────────────────────
--  1c. invoices
-- ─────────────────────────────────────────────
create table if not exists public.invoices (
  id                        uuid primary key default uuid_generate_v4(),
  user_id                   uuid not null references auth.users(id) on delete cascade,
  company_id                uuid not null references public.companies(id) on delete restrict,
  retailer_id               uuid not null references public.retailers(id) on delete restrict,

  invoice_no                text not null,
  invoice_date              date not null default current_date,
  quantity                  integer not null check (quantity >= 1),
  base_amount               numeric(14,2) not null check (base_amount >= 0),

  -- GST
  gst_percent               numeric(5,2) not null default 0,
  gst_amount                numeric(14,2) not null default 0,

  -- cash discount (either % or flat; flat wins when both provided)
  cash_discount_percent     numeric(5,2) not null default 0,
  cash_discount_amount_input numeric(14,2),          -- null = use %
  cash_discount_applied     numeric(14,2) not null default 0,

  -- computed totals (stored for fast reporting)
  taxable_amount            numeric(14,2) not null default 0,
  invoice_amount            numeric(14,2) not null default 0,

  -- commission
  commission_percent        numeric(5,2) not null default 0,
  commission_amount         numeric(14,2) not null default 0,

  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- ─────────────────────────────────────────────
--  1d. payments
-- ─────────────────────────────────────────────
create table if not exists public.payments (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  invoice_id        uuid not null references public.invoices(id) on delete restrict,

  -- when set, this payment is one leg of a merged transaction;
  -- all legs that share a payment_group_id were submitted together.
  payment_group_id  uuid,

  date              date not null default current_date,
  method            text not null check (method in ('Cash','UPI','Bank Transfer','Cheque','Other')),
  amount            numeric(14,2) not null check (amount > 0),

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────────
--  1e. credit_notes  (goods return)
-- ─────────────────────────────────────────────
create table if not exists public.credit_notes (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  invoice_id            uuid not null references public.invoices(id) on delete restrict,

  date                  date not null default current_date,
  qty_returned          integer not null check (qty_returned >= 1),
  goods_return_amount   numeric(14,2) not null check (goods_return_amount >= 0),
  invoice_qty_snapshot  integer not null,   -- qty on invoice at time of return

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);


-- =============================================================
--  2. INDEXES  (for common query patterns)
-- =============================================================

-- companies
create index if not exists idx_companies_user        on public.companies(user_id);
create index if not exists idx_companies_state       on public.companies(state);

-- retailers
create index if not exists idx_retailers_user        on public.retailers(user_id);

-- invoices
create index if not exists idx_invoices_user         on public.invoices(user_id);
create index if not exists idx_invoices_company      on public.invoices(company_id);
create index if not exists idx_invoices_retailer     on public.invoices(retailer_id);
create index if not exists idx_invoices_date         on public.invoices(invoice_date desc);
create index if not exists idx_invoices_company_date on public.invoices(company_id, invoice_date desc);

-- payments
create index if not exists idx_payments_user         on public.payments(user_id);
create index if not exists idx_payments_invoice      on public.payments(invoice_id);
create index if not exists idx_payments_date         on public.payments(date desc);
create index if not exists idx_payments_method       on public.payments(method);
create index if not exists idx_payments_group        on public.payments(payment_group_id);

-- credit_notes
create index if not exists idx_credit_notes_user     on public.credit_notes(user_id);
create index if not exists idx_credit_notes_invoice  on public.credit_notes(invoice_id);
create index if not exists idx_credit_notes_date     on public.credit_notes(date desc);


-- =============================================================
--  3. ROW LEVEL SECURITY
--  Every user sees only their own rows.
-- =============================================================

alter table public.companies    enable row level security;
alter table public.retailers    enable row level security;
alter table public.invoices     enable row level security;
alter table public.payments     enable row level security;
alter table public.credit_notes enable row level security;

-- companies
create policy "companies: own rows"    on public.companies    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- retailers
create policy "retailers: own rows"    on public.retailers    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- invoices
create policy "invoices: own rows"     on public.invoices     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- payments
create policy "payments: own rows"     on public.payments     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- credit_notes
create policy "credit_notes: own rows" on public.credit_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- =============================================================
--  4. updated_at trigger  (auto-stamp on every UPDATE)
-- =============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_companies_updated_at    before update on public.companies    for each row execute function public.set_updated_at();
create trigger trg_retailers_updated_at    before update on public.retailers    for each row execute function public.set_updated_at();
create trigger trg_invoices_updated_at     before update on public.invoices     for each row execute function public.set_updated_at();
create trigger trg_payments_updated_at     before update on public.payments     for each row execute function public.set_updated_at();
create trigger trg_credit_notes_updated_at before update on public.credit_notes for each row execute function public.set_updated_at();


-- =============================================================
--  5. AGGREGATION VIEWS
--  These are the views the UI queries for dashboards/reports.
--  All respect RLS via auth.uid().
-- =============================================================

-- ─────────────────────────────────────────────
--  5a. invoice_summary
--  One row per invoice with outstanding balance
--  and total credit notes.
-- ─────────────────────────────────────────────
create or replace view public.invoice_summary as
select
  i.id,
  i.user_id,
  i.company_id,
  c.name                                          as company_name,
  i.retailer_id,
  r.name                                          as retailer_name,
  i.invoice_no,
  i.invoice_date,
  i.quantity,
  i.base_amount,
  i.gst_percent,
  i.gst_amount,
  i.cash_discount_applied,
  i.taxable_amount,
  i.invoice_amount,
  i.commission_percent,
  i.commission_amount,

  -- total paid against this invoice
  coalesce(p.total_paid, 0)                       as total_paid,

  -- outstanding = invoice_amount - total_paid + credit_notes reduce debt
  greatest(
    0,
    i.invoice_amount
      - coalesce(p.total_paid, 0)
      - coalesce(cn.total_return_amount, 0)
  )                                               as outstanding,

  -- credit note totals
  coalesce(cn.total_return_amount, 0)             as total_return_amount,
  coalesce(cn.total_qty_returned, 0)              as total_qty_returned,
  coalesce(cn.credit_note_count, 0)               as credit_note_count,

  -- payment count
  coalesce(p.payment_count, 0)                    as payment_count,

  -- status derived
  case
    when i.invoice_amount <= coalesce(p.total_paid, 0) then 'paid'
    when coalesce(p.total_paid, 0) > 0             then 'partial'
    else                                                'unpaid'
  end                                             as payment_status,

  i.created_at,
  i.updated_at

from public.invoices i
join public.companies c  on c.id = i.company_id
join public.retailers r  on r.id = i.retailer_id

left join (
  select
    invoice_id,
    sum(amount)  as total_paid,
    count(*)     as payment_count
  from public.payments
  group by invoice_id
) p on p.invoice_id = i.id

left join (
  select
    invoice_id,
    sum(goods_return_amount)  as total_return_amount,
    sum(qty_returned)         as total_qty_returned,
    count(*)                  as credit_note_count
  from public.credit_notes
  group by invoice_id
) cn on cn.invoice_id = i.id;


-- ─────────────────────────────────────────────
--  5b. company_summary
--  Totals per company: billed, paid, outstanding,
--  commission, retailer count, invoice count.
-- ─────────────────────────────────────────────
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


-- ─────────────────────────────────────────────
--  5c. retailer_summary
--  Totals per retailer.
-- ─────────────────────────────────────────────
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


-- ─────────────────────────────────────────────
--  5d. monthly_summary
--  Month-by-month billing + payment + commission
--  for charts / trend lines.
-- ─────────────────────────────────────────────
create or replace view public.monthly_summary as
select
  i.user_id,
  i.company_id,
  c.name                                      as company_name,
  date_trunc('month', i.invoice_date)::date   as month,
  to_char(date_trunc('month', i.invoice_date), 'Mon YYYY') as month_label,

  count(i.id)                                 as invoice_count,
  coalesce(sum(i.base_amount),       0)       as total_base,
  coalesce(sum(i.invoice_amount),    0)       as total_billed,
  coalesce(sum(i.gst_amount),        0)       as total_gst,
  coalesce(sum(i.commission_amount), 0)       as total_commission,
  coalesce(sum(i.cash_discount_applied), 0)   as total_discount,

  coalesce(sum(p.total_paid), 0)              as total_paid,
  greatest(
    0,
    coalesce(sum(i.invoice_amount), 0) - coalesce(sum(p.total_paid), 0)
  )                                           as total_outstanding

from public.invoices i
join public.companies c on c.id = i.company_id
left join (
  select invoice_id, sum(amount) as total_paid
  from public.payments group by invoice_id
) p on p.invoice_id = i.id

group by i.user_id, i.company_id, c.name, date_trunc('month', i.invoice_date)
order by month desc;


-- ─────────────────────────────────────────────
--  5e. payment_method_summary
--  Breakdown of payments by method per user.
-- ─────────────────────────────────────────────
create or replace view public.payment_method_summary as
select
  p.user_id,
  p.method,
  count(*)            as payment_count,
  sum(p.amount)       as total_amount,
  round(
    100.0 * sum(p.amount)
    / nullif(sum(sum(p.amount)) over (partition by p.user_id), 0),
    1
  )                   as pct_of_total
from public.payments p
group by p.user_id, p.method;


-- ─────────────────────────────────────────────
--  5f. dashboard_totals
--  Single-row summary per user — used by the
--  home page stat cards.
-- ─────────────────────────────────────────────
create or replace view public.dashboard_totals as
select
  i.user_id,

  -- companies & retailers
  (select count(*) from public.companies  where user_id = i.user_id) as company_count,
  (select count(*) from public.retailers  where user_id = i.user_id) as retailer_count,

  -- invoice metrics
  count(distinct i.id)                          as invoice_count,
  coalesce(sum(i.invoice_amount),    0)         as total_billed,
  coalesce(sum(i.commission_amount), 0)         as total_commission,
  coalesce(sum(i.gst_amount),        0)         as total_gst,
  coalesce(sum(i.cash_discount_applied), 0)     as total_discount,

  -- payment metrics
  coalesce(sum(p.total_paid), 0)                as total_paid,
  greatest(
    0,
    coalesce(sum(i.invoice_amount), 0) - coalesce(sum(p.total_paid), 0)
  )                                             as total_outstanding,

  -- collection rate %
  round(
    100.0 * coalesce(sum(p.total_paid), 0)
    / nullif(sum(i.invoice_amount), 0),
    1
  )                                             as collection_rate_pct,

  -- credit notes
  (select count(*)          from public.credit_notes where user_id = i.user_id) as credit_note_count,
  (select coalesce(sum(goods_return_amount), 0) from public.credit_notes where user_id = i.user_id) as total_returns

from public.invoices i
left join (
  select invoice_id, sum(amount) as total_paid
  from public.payments group by invoice_id
) p on p.invoice_id = i.id

group by i.user_id;


-- =============================================================
--  Done.
--  Views you'll query from the app:
--
--  public.dashboard_totals         → home page stat cards
--  public.company_summary          → companies list + detail
--  public.retailer_summary         → retailers list + detail
--  public.invoice_summary          → invoices list with status
--  public.monthly_summary          → trend charts
--  public.payment_method_summary   → payment breakdown pie
-- =============================================================
