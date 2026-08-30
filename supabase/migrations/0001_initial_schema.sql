-- ============================================================================
-- Oma Synergies Travels and Tours - Initial Database Schema
-- Phase 1: Foundation (auth, roles, clients, applications, documents,
-- payments, messages, content management, compliance)
--
-- HOW TO RUN THIS:
-- Supabase Dashboard -> SQL Editor -> New Query -> paste this whole file -> Run
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------

create type user_role as enum ('super_admin', 'staff_admin', 'client');

create type application_stage as enum (
  'documents_requested',
  'documents_received',
  'application_prepared',
  'submitted',
  'decision_pending',
  'approved',
  'refused',
  'withdrawn'
);

create type document_status as enum (
  'required',
  'pending',
  'received',
  'under_review',
  'approved',
  'rejected',
  'submitted_to_embassy',
  'returned'
);

create type payment_status as enum ('pending', 'confirmed', 'partially_paid', 'refunded');

create type testimonial_status as enum ('pending', 'approved', 'rejected');

create type content_status as enum ('active', 'hidden');

create type masterclass_status as enum ('open', 'sold_out', 'coming_soon', 'completed');

create type enquiry_status as enum ('unread', 'read', 'converted', 'no_action');

create type refund_status as enum ('requested', 'approved', 'rejected', 'paid');


-- ----------------------------------------------------------------------------
-- PROFILES (extends Supabase Auth users - one row per person who can log in)
-- ----------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'client',
  full_name text not null,
  phone text,
  title text, -- e.g. "Visa Consultant" - staff admins only
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_by uuid references profiles(id),
  last_login timestamptz,
  created_at timestamptz not null default now()
);

comment on table profiles is 'One row per authenticated user (admin or client). Role drives all access control.';


-- ----------------------------------------------------------------------------
-- CLIENTS (extra fields specific to client-role profiles)
-- ----------------------------------------------------------------------------

create table clients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  assigned_to uuid references profiles(id), -- which staff admin owns this client
  service_type text not null,
  selar_order_id text,
  onboarding_complete boolean not null default false, -- forced password change done?
  created_by uuid references profiles(id) not null,
  created_at timestamptz not null default now(),
  unique (profile_id)
);


-- ----------------------------------------------------------------------------
-- APPLICATIONS (a client can have more than one, e.g. visa + tour)
-- ----------------------------------------------------------------------------

create table applications (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  destination text,
  service_type text not null,
  stage application_stage not null default 'documents_requested',
  stage_updated_at timestamptz not null default now(),
  client_visible_message text,
  admin_notes text, -- never shown to client
  awaiting_client boolean not null default true, -- the single "who's turn" flag
  expected_outcome_date date,
  actual_outcome text,
  -- key dates
  appointment_date timestamptz,
  biometrics_date timestamptz,
  interview_date timestamptz,
  submission_deadline date,
  decision_date date,
  outcome_testimonial_sent boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- STAGE HISTORY (powers the client-facing timeline)
-- ----------------------------------------------------------------------------

create table stage_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  stage application_stage not null,
  changed_at timestamptz not null default now(),
  changed_by uuid references profiles(id)
);


-- ----------------------------------------------------------------------------
-- DOCUMENT REQUIREMENTS (admin-editable template per service type,
-- drives auto-population when a new application is created)
-- ----------------------------------------------------------------------------

create table document_requirements (
  id uuid primary key default gen_random_uuid(),
  service_type text not null,
  document_name text not null,
  required boolean not null default true,
  display_order int not null default 0
);


-- ----------------------------------------------------------------------------
-- DOCUMENTS (actual checklist items per application, with file uploads)
-- ----------------------------------------------------------------------------

create table documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  document_name text not null,
  status document_status not null default 'required',
  rejection_reason text,
  file_url text,
  file_uploaded_by uuid references profiles(id),
  file_uploaded_at timestamptz,
  previous_version_url text, -- kept when a rejected doc is replaced
  updated_at timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- MESSAGES (two-way: admin to client and client to consultant)
-- ----------------------------------------------------------------------------

create table messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  application_id uuid references applications(id),
  sender_id uuid not null references profiles(id),
  body text not null,
  read_by_recipient boolean not null default false,
  created_at timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- CONSULTANT REMINDERS (personal follow-up notes, separate from overdue alerts)
-- ----------------------------------------------------------------------------

create table consultant_reminders (
  id uuid primary key default gen_random_uuid(),
  consultant_id uuid not null references profiles(id),
  client_id uuid references clients(id) on delete cascade,
  note text not null,
  due_date date,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- PAYMENTS (with installment plan support)
-- ----------------------------------------------------------------------------

create table payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  expected_amount numeric(12,2) not null,
  amount_paid numeric(12,2) not null default 0,
  currency text not null default 'NGN',
  selar_order_id text,
  selar_product_name text,
  status payment_status not null default 'pending',
  next_due_date date, -- for installment plans
  paid_at timestamptz,
  created_at timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- REFUNDS (auditable workflow, separate from the payment record itself)
-- ----------------------------------------------------------------------------

create table refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payments(id),
  amount numeric(12,2) not null,
  reason text not null,
  status refund_status not null default 'requested',
  requested_by uuid references profiles(id),
  approved_by uuid references profiles(id),
  created_at timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- DISPUTES / COMPLAINTS LOG
-- ----------------------------------------------------------------------------

create table disputes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  description text not null,
  handled_by uuid references profiles(id),
  resolution text,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- CONTACT FORM SUBMISSIONS
-- ----------------------------------------------------------------------------

create table contact_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  service_interested text,
  destination text,
  message text,
  status enquiry_status not null default 'unread',
  converted_client_id uuid references clients(id),
  created_at timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- CONTENT MANAGEMENT: tours, masterclasses, testimonials, partners
-- ----------------------------------------------------------------------------

create table tour_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  destination text not null,
  nights int not null,
  from_price numeric(12,2) not null,
  per_person_sharing boolean not null default true,
  categories text[] not null default '{}',
  status content_status not null default 'active',
  photo_url text,
  display_order int not null default 0,
  updated_at timestamptz not null default now()
);

create table masterclasses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  topic text not null,
  class_date date not null,
  class_time text not null,
  format text not null,
  price numeric(12,2) not null,
  seats_total int not null,
  seats_remaining int not null,
  status masterclass_status not null default 'open',
  booking_link text,
  created_at timestamptz not null default now()
);

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id), -- nullable: legacy/manual entries may not link to a real client
  client_name text not null,
  destination text,
  service_type text,
  category text,
  quote text not null,
  service_tag text,
  status testimonial_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null,
  website_url text,
  display_order int not null default 0,
  status content_status not null default 'active'
);


-- ----------------------------------------------------------------------------
-- AUDIT LOG (meaningful actions only - stage changes, document status,
-- account creation, payments - not every minor field edit)
-- ----------------------------------------------------------------------------

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references profiles(id),
  action text not null,
  target_table text not null,
  target_id uuid,
  detail text,
  created_at timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- CONSENT LOG (compliance - proof of Terms/Privacy acceptance)
-- ----------------------------------------------------------------------------

create table consent_log (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id),
  document text not null check (document in ('terms', 'privacy')),
  accepted_at timestamptz not null default now()
);


-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table profiles enable row level security;
alter table clients enable row level security;
alter table applications enable row level security;
alter table stage_history enable row level security;
alter table document_requirements enable row level security;
alter table documents enable row level security;
alter table messages enable row level security;
alter table consultant_reminders enable row level security;
alter table payments enable row level security;
alter table refunds enable row level security;
alter table disputes enable row level security;
alter table contact_submissions enable row level security;
alter table tour_packages enable row level security;
alter table masterclasses enable row level security;
alter table testimonials enable row level security;
alter table partners enable row level security;
alter table audit_log enable row level security;
alter table consent_log enable row level security;

-- Helper: is the current user a super_admin or staff_admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('super_admin', 'staff_admin')
  );
$$ language sql security definer stable;

create or replace function is_super_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'super_admin'
  );
$$ language sql security definer stable;

-- PROFILES: everyone can read their own row; admins can read all
create policy "Users read own profile" on profiles for select using (id = auth.uid());
create policy "Admins read all profiles" on profiles for select using (is_admin());
create policy "Super admin manages profiles" on profiles for all using (is_super_admin());

-- CLIENTS: client reads their own row; assigned staff + super admin read/write
create policy "Client reads own record" on clients for select using (
  profile_id = auth.uid()
);
create policy "Admins manage clients" on clients for all using (is_admin());

-- APPLICATIONS: client reads their own; admins manage all
create policy "Client reads own applications" on applications for select using (
  exists (select 1 from clients where clients.id = applications.client_id and clients.profile_id = auth.uid())
);
create policy "Admins manage applications" on applications for all using (is_admin());

-- STAGE HISTORY: same pattern
create policy "Client reads own stage history" on stage_history for select using (
  exists (
    select 1 from applications
    join clients on clients.id = applications.client_id
    where applications.id = stage_history.application_id and clients.profile_id = auth.uid()
  )
);
create policy "Admins manage stage history" on stage_history for all using (is_admin());

-- DOCUMENT REQUIREMENTS: readable by everyone logged in, editable by admins only
create policy "Anyone logged in reads requirements" on document_requirements for select using (auth.uid() is not null);
create policy "Admins manage requirements" on document_requirements for all using (is_admin());

-- DOCUMENTS: client reads/uploads own; admins manage all
create policy "Client reads own documents" on documents for select using (
  exists (
    select 1 from applications
    join clients on clients.id = applications.client_id
    where applications.id = documents.application_id and clients.profile_id = auth.uid()
  )
);
create policy "Client uploads own documents" on documents for update using (
  exists (
    select 1 from applications
    join clients on clients.id = applications.client_id
    where applications.id = documents.application_id and clients.profile_id = auth.uid()
  )
);
create policy "Admins manage documents" on documents for all using (is_admin());

-- MESSAGES: client reads/sends their own thread; admins manage all
create policy "Client reads own messages" on messages for select using (
  exists (select 1 from clients where clients.id = messages.client_id and clients.profile_id = auth.uid())
);
create policy "Client sends own messages" on messages for insert with check (
  sender_id = auth.uid() and
  exists (select 1 from clients where clients.id = messages.client_id and clients.profile_id = auth.uid())
);
create policy "Admins manage messages" on messages for all using (is_admin());

-- CONSULTANT REMINDERS: staff see only their own
create policy "Consultants manage own reminders" on consultant_reminders for all using (
  consultant_id = auth.uid() or is_super_admin()
);

-- PAYMENTS: client reads own; admins manage all
create policy "Client reads own payments" on payments for select using (
  exists (select 1 from clients where clients.id = payments.client_id and clients.profile_id = auth.uid())
);
create policy "Admins manage payments" on payments for all using (is_admin());

-- REFUNDS, DISPUTES: admins only
create policy "Admins manage refunds" on refunds for all using (is_admin());
create policy "Admins manage disputes" on disputes for all using (is_admin());

-- CONTACT SUBMISSIONS: public can insert (the contact form), only admins can read
create policy "Anyone can submit contact form" on contact_submissions for insert with check (true);
create policy "Admins read contact submissions" on contact_submissions for select using (is_admin());
create policy "Admins update contact submissions" on contact_submissions for update using (is_admin());

-- CONTENT (tours, masterclasses, testimonials, partners): public reads active/approved, admins manage all
create policy "Public reads active tours" on tour_packages for select using (status = 'active' or is_admin());
create policy "Admins manage tours" on tour_packages for all using (is_admin());

create policy "Public reads open masterclasses" on masterclasses for select using (true);
create policy "Admins manage masterclasses" on masterclasses for all using (is_admin());

create policy "Public reads approved testimonials" on testimonials for select using (status = 'approved' or is_admin());
create policy "Admins manage testimonials" on testimonials for all using (is_admin());

create policy "Public reads active partners" on partners for select using (status = 'active' or is_admin());
create policy "Admins manage partners" on partners for all using (is_admin());

-- AUDIT LOG: super admin only, read-only for everyone (even super admin can't edit/delete)
create policy "Super admin reads audit log" on audit_log for select using (is_super_admin());
create policy "System inserts audit log" on audit_log for insert with check (is_admin());

-- CONSENT LOG: users read their own, insert their own
create policy "Users read own consent" on consent_log for select using (profile_id = auth.uid());
create policy "Users log own consent" on consent_log for insert with check (profile_id = auth.uid());


-- ============================================================================
-- SEED: starter document requirements (editable/removable via admin panel)
-- ============================================================================

insert into document_requirements (service_type, document_name, required, display_order) values
  ('UK Study Visa', 'Passport (biodata page)', true, 1),
  ('UK Study Visa', 'CAS (Confirmation of Acceptance for Studies)', true, 2),
  ('UK Study Visa', 'Bank statement (last 6 months)', true, 3),
  ('UK Study Visa', 'Academic transcripts & certificates', true, 4),
  ('UK Study Visa', 'IELTS / English proficiency result', true, 5),
  ('UK Study Visa', 'Sponsor letter (if applicable)', false, 6),
  ('UK Study Visa', 'Tuberculosis test result', true, 7),
  ('Tourist Visa', 'Passport (biodata page)', true, 1),
  ('Tourist Visa', 'Bank statement (last 6 months)', true, 2),
  ('Tourist Visa', 'Employment letter', true, 3),
  ('Tourist Visa', 'Travel itinerary', false, 4),
  ('Business Visa', 'Passport (biodata page)', true, 1),
  ('Business Visa', 'Invitation letter', true, 2),
  ('Business Visa', 'Bank statement (last 6 months)', true, 3),
  ('Business Visa', 'Company registration documents', false, 4);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
