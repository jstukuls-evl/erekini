-- =============================================================================
-- erekini — Supabase / Postgres schema (Phase 0)
-- Multi-tenant: organization = tenant. RLS: members only see their orgs.
-- Service role: bypasses RLS — use only in trusted server jobs / migrations.
-- Run in Supabase SQL editor or as a migration. Requires auth.users (Supabase Auth).
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------

create type public.member_role as enum ('owner', 'admin', 'member', 'viewer');

-- draft → issued → sent → paid / void / cancelled
create type public.invoice_status as enum (
  'draft',
  'issued',
  'sent',
  'paid',
  'void',
  'cancelled'
);

-- LV VAT rate codes (likmes). Map to EN 16931 TaxCategory / percent in export layer.
create type public.vat_rate_code as enum (
  'standard_21',   -- 21% standarta likme
  'reduced_12',    -- 12% samazinātā
  'reduced_5',     -- 5% samazinātā
  'zero_0',        -- 0% (piem. eksports — dokumentēt iemeslu)
  'exempt'         -- neapliekams (exempt / out of scope) — EN 16931 TaxExemptionReason
);

create type public.invoice_type as enum (
  'standard',      -- parastais rēķins
  'credit_note',   -- kredītrēķins
  'debit_note'
);

create type public.subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'cancelled',
  'incomplete'
);

-- -----------------------------------------------------------------------------
-- updated_at helper
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'BEFORE UPDATE trigger: sets updated_at to UTC now().';

-- -----------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- -----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  locale text not null default 'lv',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

comment on table public.profiles is
  'App profile for each auth user. Not tenant-scoped.';

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- organizations (tenant root)
-- -----------------------------------------------------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  -- Default invoice number prefix / next sequence (also see invoice_sequences)
  invoice_number_prefix text not null default 'REK',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint organizations_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create index organizations_slug_idx on public.organizations (slug);

comment on table public.organizations is
  'Tenant root. All business data hangs off organization_id.';

-- -----------------------------------------------------------------------------
-- organization_members
-- -----------------------------------------------------------------------------

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.member_role not null default 'member',
  invited_email text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, user_id)
);

create trigger organization_members_set_updated_at
  before update on public.organization_members
  for each row execute function public.set_updated_at();

create index organization_members_user_id_idx
  on public.organization_members (user_id);
create index organization_members_organization_id_idx
  on public.organization_members (organization_id);

comment on table public.organization_members is
  'Membership + role. RLS for all tenant tables keys off this.';

-- Helper: is current user a member of org?
create or replace function public.is_org_member(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = p_org_id
      and m.user_id = auth.uid()
  );
$$;

comment on function public.is_org_member(uuid) is
  'SECURITY DEFINER helper for RLS: true if auth.uid() belongs to org.';

-- Helper: can manage (owner/admin)?
create or replace function public.is_org_manager(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = p_org_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  );
$$;

-- -----------------------------------------------------------------------------
-- company_profiles — seller rekvizīti (EN 16931 AccountingSupplierParty)
-- -----------------------------------------------------------------------------

create table public.company_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  legal_name text not null,
  registration_number text,          -- LV reģistrācijas nr. / UR
  vat_number text,                   -- PVN maksātāja nr. (LVXXXXXXXXXX)
  legal_address_line1 text,
  legal_address_line2 text,
  city text,
  postal_code text,
  country_code char(2) not null default 'LV',  -- ISO 3166-1 alpha-2
  email text,
  phone text,
  website text,
  -- EN 16931: EndpointID scheme for e-invoice routing (optional at Phase 0)
  einvoice_endpoint_id text,
  einvoice_endpoint_scheme text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger company_profiles_set_updated_at
  before update on public.company_profiles
  for each row execute function public.set_updated_at();

comment on table public.company_profiles is
  'Seller party (rekvizīti). Maps to EN 16931 AccountingSupplierParty.';
comment on column public.company_profiles.vat_number is
  'Seller VAT ID — EN 16931 PartyTaxScheme / CompanyID.';
comment on column public.company_profiles.einvoice_endpoint_id is
  'Optional electronic address (EndpointID) for receiving e-invoices.';

-- -----------------------------------------------------------------------------
-- bank_accounts — seller payment means (EN 16931 PaymentMeans / IBAN)
-- -----------------------------------------------------------------------------

create table public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  label text,
  bank_name text,
  iban text not null,
  bic text,
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger bank_accounts_set_updated_at
  before update on public.bank_accounts
  for each row execute function public.set_updated_at();

create index bank_accounts_organization_id_idx
  on public.bank_accounts (organization_id);

-- At most one default bank account per org (partial unique)
create unique index bank_accounts_one_default_per_org
  on public.bank_accounts (organization_id)
  where is_default;

comment on table public.bank_accounts is
  'Seller IBAN/BIC — EN 16931 PaymentMeans / PayeeFinancialAccount.';

-- -----------------------------------------------------------------------------
-- customers / counterparties (EN 16931 AccountingCustomerParty)
-- -----------------------------------------------------------------------------

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  legal_name text not null,
  registration_number text,          -- from UR search when available
  vat_number text,
  legal_address_line1 text,
  legal_address_line2 text,
  city text,
  postal_code text,
  country_code char(2) not null default 'LV',
  email text,
  phone text,
  -- Buyer e-invoice routing (B2B/B2G)
  einvoice_endpoint_id text,
  einvoice_endpoint_scheme text,
  -- Optional link to seeded public institution directory
  public_institution_id uuid,        -- FK added after institutions table
  ur_source_id text,                 -- external UR open-data id if known
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

create index customers_organization_id_idx on public.customers (organization_id);
create index customers_legal_name_idx
  on public.customers (organization_id, legal_name);
create index customers_registration_number_idx
  on public.customers (organization_id, registration_number);

comment on table public.customers is
  'Buyers / counterparties. EN 16931 AccountingCustomerParty.';
comment on column public.customers.ur_source_id is
  'Optional Uzņēmumu reģistrs open-data identifier used when seeding from search.';

-- Alias view for docs / future rename flexibility
create view public.counterparties as
  select * from public.customers;

comment on view public.counterparties is
  'Alias of customers (counterparties naming).';

-- -----------------------------------------------------------------------------
-- public_institution_einvoice_addresses (global reference — not tenant-scoped)
-- -----------------------------------------------------------------------------

create table public.public_institution_einvoice_addresses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  registration_number text,
  institution_type text,             -- municipality | agency | ministry | other
  municipality_code text,
  -- Placeholder e-invoice endpoint fields (replace with real PEPPOL/eAddress data later)
  einvoice_endpoint_id text,
  einvoice_endpoint_scheme text,     -- e.g. '0088' GLN, '0190' LV, or 'EM' email — TBD
  einvoice_email text,               -- interim channel if endpoint unknown
  city text,
  country_code char(2) not null default 'LV',
  source_note text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger public_institution_einvoice_addresses_set_updated_at
  before update on public.public_institution_einvoice_addresses
  for each row execute function public.set_updated_at();

create index public_institutions_name_idx
  on public.public_institution_einvoice_addresses (name);
create index public_institutions_reg_nr_idx
  on public.public_institution_einvoice_addresses (registration_number);

comment on table public.public_institution_einvoice_addresses is
  'Global B2G directory (not tenant-scoped). Seed placeholders; refresh from official sources later.';

alter table public.customers
  add constraint customers_public_institution_id_fkey
  foreign key (public_institution_id)
  references public.public_institution_einvoice_addresses (id)
  on delete set null;

-- Seed: a few Latvian municipalities / agencies (PLACEHOLDER endpoints — not production-ready)
insert into public.public_institution_einvoice_addresses
  (name, name_en, registration_number, institution_type, municipality_code,
   einvoice_endpoint_id, einvoice_endpoint_scheme, einvoice_email, city, source_note)
values
  (
    'Rīgas valstspilsētas pašvaldība',
    'Riga City Municipality',
    '90000022247',
    'municipality',
    'RIX',
    'LV-PLACEHOLDER-RIGA',
    'LV:EINVOICE',
    'e-rekini@riga.lv',
    'Rīga',
    'Placeholder endpoint — replace with official e-address / PEPPOL ID'
  ),
  (
    'Liepājas valstspilsētas pašvaldība',
    'Liepaja City Municipality',
    '90000081426',
    'municipality',
    'LPX',
    'LV-PLACEHOLDER-LIEPAJA',
    'LV:EINVOICE',
    'e-rekini@liepaja.lv',
    'Liepāja',
    'Placeholder endpoint'
  ),
  (
    'Daugavpils valstspilsētas pašvaldība',
    'Daugavpils City Municipality',
    '90000081274',
    'municipality',
    'DGV',
    'LV-PLACEHOLDER-DAUGAVPILS',
    'LV:EINVOICE',
    'e-rekini@daugavpils.lv',
    'Daugavpils',
    'Placeholder endpoint'
  ),
  (
    'Valsts ieņēmumu dienests',
    'State Revenue Service (VID)',
    '90000028000',
    'agency',
    null,
    'LV-PLACEHOLDER-VID',
    'LV:EINVOICE',
    'e-rekini@vid.gov.lv',
    'Rīga',
    'Placeholder — confirm official B2G channel before production use'
  ),
  (
    'Veselības ministrija',
    'Ministry of Health',
    '90000027600',
    'ministry',
    null,
    'LV-PLACEHOLDER-VM',
    'LV:EINVOICE',
    'e-rekini@vm.gov.lv',
    'Rīga',
    'Placeholder endpoint'
  );

-- -----------------------------------------------------------------------------
-- invoice_sequences — per-org sequential numbers
-- -----------------------------------------------------------------------------

create table public.invoice_sequences (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  year int not null default extract(year from timezone('utc', now()))::int,
  last_number int not null default 0,
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.invoice_sequences is
  'Per-organization invoice counter. Allocate via next_invoice_number().';

create or replace function public.next_invoice_number(p_org_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefix text;
  v_year int := extract(year from timezone('utc', now()))::int;
  v_next int;
  v_seq_year int;
begin
  if not public.is_org_member(p_org_id) then
    raise exception 'not a member of organization %', p_org_id;
  end if;

  select invoice_number_prefix into v_prefix
  from public.organizations
  where id = p_org_id;

  if v_prefix is null then
    raise exception 'organization % not found', p_org_id;
  end if;

  insert into public.invoice_sequences (organization_id, year, last_number)
  values (p_org_id, v_year, 0)
  on conflict (organization_id) do nothing;

  select year, last_number
    into v_seq_year, v_next
  from public.invoice_sequences
  where organization_id = p_org_id
  for update;

  if v_seq_year is distinct from v_year then
    v_next := 1;
    update public.invoice_sequences
    set year = v_year,
        last_number = 1,
        updated_at = timezone('utc', now())
    where organization_id = p_org_id;
  else
    v_next := v_next + 1;
    update public.invoice_sequences
    set last_number = v_next,
        updated_at = timezone('utc', now())
    where organization_id = p_org_id;
  end if;

  -- Format: PREFIX-YYYY-00001 (EN 16931 BT-1 Invoice number)
  return v_prefix || '-' || v_year::text || '-' || lpad(v_next::text, 5, '0');
end;
$$;

comment on function public.next_invoice_number(uuid) is
  'Allocates next invoice number for org (year-aware). Call from issue flow with elevated/server client as needed.';

-- -----------------------------------------------------------------------------
-- invoices — header (EN 16931 Invoice)
-- -----------------------------------------------------------------------------

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete set null,
  bank_account_id uuid references public.bank_accounts (id) on delete set null,

  -- EN 16931 BT-1 Invoice number (assigned on issue)
  invoice_number text,
  invoice_type public.invoice_type not null default 'standard',
  status public.invoice_status not null default 'draft',

  -- Dates (BT-2 Issue date, BT-9 Due date, BT-7 Tax point optional)
  issue_date date,
  due_date date,
  tax_point_date date,

  currency_code char(3) not null default 'EUR',  -- BT-5

  -- Snapshot of buyer/seller names for historical accuracy (optional denorm)
  seller_name_snapshot text,
  buyer_name_snapshot text,

  -- Buyer e-invoice endpoint snapshot at send time
  buyer_einvoice_endpoint_id text,
  buyer_einvoice_endpoint_scheme text,

  -- Notes / payment terms (BT-20 / BT-22)
  payment_terms text,
  notes text,
  buyer_reference text,              -- BT-10 Buyer reference / PO number

  -- Totals cached from lines (recompute in app / trigger later)
  -- EN 16931: BT-106..BT-116 monetary totals
  subtotal_excl_vat numeric(14, 2) not null default 0,
  vat_total numeric(14, 2) not null default 0,
  total_incl_vat numeric(14, 2) not null default 0,

  -- Outbound artifacts
  xml_storage_path text,             -- Supabase Storage path for EN 16931 XML
  pdf_storage_path text,
  last_sent_at timestamptz,
  last_sent_to email text,

  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint invoices_totals_nonneg check (
    subtotal_excl_vat >= 0 and vat_total >= 0 and total_incl_vat >= 0
  )
);

create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

create unique index invoices_org_number_uidx
  on public.invoices (organization_id, invoice_number)
  where invoice_number is not null;

create index invoices_organization_id_idx on public.invoices (organization_id);
create index invoices_status_idx on public.invoices (organization_id, status);
create index invoices_customer_id_idx on public.invoices (customer_id);
create index invoices_issue_date_idx on public.invoices (organization_id, issue_date desc);

comment on table public.invoices is
  'Invoice header. EN 16931 Invoice document root fields.';
comment on column public.invoices.invoice_number is
  'BT-1 Invoice number — set when status moves to issued via next_invoice_number().';
comment on column public.invoices.currency_code is
  'BT-5 Invoice currency code (ISO 4217). Default EUR.';
comment on column public.invoices.buyer_reference is
  'BT-10 Buyer reference (order / contract reference).';

-- -----------------------------------------------------------------------------
-- invoice_lines — EN 16931 InvoiceLine
-- -----------------------------------------------------------------------------

create table public.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  invoice_id uuid not null references public.invoices (id) on delete cascade,

  line_number int not null,          -- BT-126
  description text not null,         -- BT-153/BT-154 item name/description
  quantity numeric(14, 4) not null default 1,   -- BT-129
  unit_code text not null default 'C62',        -- UN/ECE Recommendation 20 (C62 = unit)
  unit_price numeric(14, 4) not null default 0, -- BT-146

  vat_rate_code public.vat_rate_code not null default 'standard_21',
  vat_percent numeric(5, 2) not null default 21.00,  -- denormalized from code for export

  -- Line amounts excl. VAT (BT-131)
  line_total_excl_vat numeric(14, 2) not null default 0,
  vat_amount numeric(14, 2) not null default 0,

  -- Optional exemption reason text when vat_rate_code = exempt / zero_0
  vat_exemption_reason text,         -- EN 16931 TaxExemptionReason

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  unique (invoice_id, line_number),
  constraint invoice_lines_qty_positive check (quantity > 0),
  constraint invoice_lines_price_nonneg check (unit_price >= 0)
);

create trigger invoice_lines_set_updated_at
  before update on public.invoice_lines
  for each row execute function public.set_updated_at();

create index invoice_lines_invoice_id_idx on public.invoice_lines (invoice_id);
create index invoice_lines_organization_id_idx
  on public.invoice_lines (organization_id);

comment on table public.invoice_lines is
  'Invoice lines. EN 16931 InvoiceLine + ClassifiedTaxCategory.';
comment on column public.invoice_lines.vat_rate_code is
  'LV VAT category: 21/12/5/0/neapliekams — map to EN 16931 TaxCategory ID in export.';
comment on column public.invoice_lines.unit_code is
  'BT-130 Unit of measure (UN/ECE Rec 20). C62 = piece.';

-- Keep vat_percent in sync with vat_rate_code on write
create or replace function public.sync_line_vat_percent()
returns trigger
language plpgsql
as $$
begin
  new.vat_percent := case new.vat_rate_code
    when 'standard_21' then 21.00
    when 'reduced_12' then 12.00
    when 'reduced_5' then 5.00
    when 'zero_0' then 0.00
    when 'exempt' then 0.00
  end;
  -- Simple line math (app may overwrite with rounded totals)
  new.line_total_excl_vat := round((new.quantity * new.unit_price)::numeric, 2);
  new.vat_amount := round((new.line_total_excl_vat * new.vat_percent / 100)::numeric, 2);
  return new;
end;
$$;

create trigger invoice_lines_sync_vat
  before insert or update of vat_rate_code, quantity, unit_price
  on public.invoice_lines
  for each row execute function public.sync_line_vat_percent();

-- -----------------------------------------------------------------------------
-- plans / subscriptions (stubs for pricing)
-- -----------------------------------------------------------------------------

create table public.plans (
  id text primary key,               -- e.g. 'free', 'pro', 'business'
  name text not null,
  name_lv text,
  description text,
  price_eur_month numeric(10, 2) not null default 0,
  max_invoices_per_month int,
  features jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger plans_set_updated_at
  before update on public.plans
  for each row execute function public.set_updated_at();

insert into public.plans (id, name, name_lv, description, price_eur_month, max_invoices_per_month, features)
values
  ('free', 'Free', 'Bezmaksas', 'Starter for self-employed', 0, 5,
   '{"xml_export":false,"email_send":false}'::jsonb),
  ('pro', 'Pro', 'Pro', 'Growing SMEs', 19.00, 100,
   '{"xml_export":true,"email_send":true}'::jsonb),
  ('business', 'Business', 'Bizness', 'Higher volume + team', 49.00, null,
   '{"xml_export":true,"email_send":true,"priority_support":true}'::jsonb);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  plan_id text not null references public.plans (id),
  status public.subscription_status not null default 'trialing',
  current_period_start timestamptz,
  current_period_end timestamptz,
  external_customer_id text,         -- Stripe etc. later
  external_subscription_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

comment on table public.subscriptions is
  'Billing stub per org. Wire to Stripe/Resend limits in later phases.';

-- -----------------------------------------------------------------------------
-- Bootstrap: create org + owner membership + sequence + free subscription
-- Call from server after signup (SECURITY DEFINER).
-- -----------------------------------------------------------------------------

create or replace function public.create_organization_with_owner(
  p_name text,
  p_slug text
)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org public.organizations;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.organizations (name, slug, created_by)
  values (p_name, p_slug, v_uid)
  returning * into v_org;

  insert into public.organization_members (organization_id, user_id, role)
  values (v_org.id, v_uid, 'owner');

  insert into public.invoice_sequences (organization_id, year, last_number)
  values (v_org.id, extract(year from timezone('utc', now()))::int, 0);

  insert into public.subscriptions (organization_id, plan_id, status)
  values (v_org.id, 'free', 'trialing');

  return v_org;
end;
$$;

comment on function public.create_organization_with_owner(text, text) is
  'Creates org, owner membership, invoice sequence, free subscription. Authenticated users only.';

-- =============================================================================
-- RLS
-- Pattern: authenticated users access rows only for orgs they belong to.
-- Service role (supabase service key) bypasses RLS — use for cron, Resend
-- webhooks, admin backfill, and migrations. Never expose service role to browser.
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.company_profiles enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.customers enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_lines enable row level security;
alter table public.invoice_sequences enable row level security;
alter table public.subscriptions enable row level security;
alter table public.plans enable row level security;
alter table public.public_institution_einvoice_addresses enable row level security;

-- profiles: users read/update self
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- organizations
create policy organizations_select_member on public.organizations
  for select to authenticated
  using (public.is_org_member(id));

create policy organizations_update_manager on public.organizations
  for update to authenticated
  using (public.is_org_manager(id))
  with check (public.is_org_manager(id));

-- Insert via create_organization_with_owner (security definer). Optional direct insert:
create policy organizations_insert_authenticated on public.organizations
  for insert to authenticated
  with check (created_by = auth.uid());

-- organization_members
create policy organization_members_select on public.organization_members
  for select to authenticated
  using (public.is_org_member(organization_id) or user_id = auth.uid());

create policy organization_members_insert_manager on public.organization_members
  for insert to authenticated
  with check (public.is_org_manager(organization_id));

create policy organization_members_update_manager on public.organization_members
  for update to authenticated
  using (public.is_org_manager(organization_id))
  with check (public.is_org_manager(organization_id));

create policy organization_members_delete_manager on public.organization_members
  for delete to authenticated
  using (public.is_org_manager(organization_id));

-- company_profiles
create policy company_profiles_select on public.company_profiles
  for select to authenticated
  using (public.is_org_member(organization_id));

create policy company_profiles_insert_manager on public.company_profiles
  for insert to authenticated
  with check (public.is_org_manager(organization_id));

create policy company_profiles_update_manager on public.company_profiles
  for update to authenticated
  using (public.is_org_manager(organization_id))
  with check (public.is_org_manager(organization_id));

-- bank_accounts
create policy bank_accounts_select on public.bank_accounts
  for select to authenticated
  using (public.is_org_member(organization_id));

create policy bank_accounts_insert_manager on public.bank_accounts
  for insert to authenticated
  with check (public.is_org_manager(organization_id));

create policy bank_accounts_update_manager on public.bank_accounts
  for update to authenticated
  using (public.is_org_manager(organization_id))
  with check (public.is_org_manager(organization_id));

create policy bank_accounts_delete_manager on public.bank_accounts
  for delete to authenticated
  using (public.is_org_manager(organization_id));

-- customers: members can read/write (viewers read-only would need role checks — keep simple for Phase 0)
create policy customers_select on public.customers
  for select to authenticated
  using (public.is_org_member(organization_id));

create policy customers_insert on public.customers
  for insert to authenticated
  with check (public.is_org_member(organization_id));

create policy customers_update on public.customers
  for update to authenticated
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy customers_delete on public.customers
  for delete to authenticated
  using (public.is_org_manager(organization_id));

-- invoices
create policy invoices_select on public.invoices
  for select to authenticated
  using (public.is_org_member(organization_id));

create policy invoices_insert on public.invoices
  for insert to authenticated
  with check (public.is_org_member(organization_id));

create policy invoices_update on public.invoices
  for update to authenticated
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy invoices_delete on public.invoices
  for delete to authenticated
  using (public.is_org_manager(organization_id));

-- invoice_lines
create policy invoice_lines_select on public.invoice_lines
  for select to authenticated
  using (public.is_org_member(organization_id));

create policy invoice_lines_insert on public.invoice_lines
  for insert to authenticated
  with check (public.is_org_member(organization_id));

create policy invoice_lines_update on public.invoice_lines
  for update to authenticated
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy invoice_lines_delete on public.invoice_lines
  for delete to authenticated
  using (public.is_org_member(organization_id));

-- invoice_sequences: members can read; writes via next_invoice_number (security definer)
create policy invoice_sequences_select on public.invoice_sequences
  for select to authenticated
  using (public.is_org_member(organization_id));

-- subscriptions: members read; managers update (billing UI later)
create policy subscriptions_select on public.subscriptions
  for select to authenticated
  using (public.is_org_member(organization_id));

create policy subscriptions_update_manager on public.subscriptions
  for update to authenticated
  using (public.is_org_manager(organization_id))
  with check (public.is_org_manager(organization_id));

-- plans: readable by all authenticated (pricing page can also use anon later)
create policy plans_select_authenticated on public.plans
  for select to authenticated
  using (is_active = true);

create policy plans_select_anon on public.plans
  for select to anon
  using (is_active = true);

-- public institutions: global read for authenticated (+ anon for marketing demos if desired)
create policy public_institutions_select_authenticated
  on public.public_institution_einvoice_addresses
  for select to authenticated
  using (is_active = true);

create policy public_institutions_select_anon
  on public.public_institution_einvoice_addresses
  for select to anon
  using (is_active = true);

-- Writes to public_institution_einvoice_addresses: service role only (no policy for authenticated write).
-- Service-role pattern note:
--   * Migrations / seed refresh: use service role key in CI or SQL editor.
--   * Resend delivery webhooks updating invoices.last_sent_*: use server route with service role
--     OR an authenticated user update under invoices_update policy.
--   * Never ship SUPABASE_SERVICE_ROLE_KEY to the client bundle.

-- -----------------------------------------------------------------------------
-- Grants (Supabase defaults usually cover this; explicit for clarity)
-- -----------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant select on public.plans to anon, authenticated;
grant select on public.public_institution_einvoice_addresses to anon, authenticated;
grant select on public.counterparties to authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, update on public.organizations to authenticated;
grant select, insert, update, delete on public.organization_members to authenticated;
grant select, insert, update on public.company_profiles to authenticated;
grant select, insert, update, delete on public.bank_accounts to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update, delete on public.invoices to authenticated;
grant select, insert, update, delete on public.invoice_lines to authenticated;
grant select on public.invoice_sequences to authenticated;
grant select, update on public.subscriptions to authenticated;

grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.is_org_manager(uuid) to authenticated;
grant execute on function public.next_invoice_number(uuid) to authenticated;
grant execute on function public.create_organization_with_owner(text, text) to authenticated;
