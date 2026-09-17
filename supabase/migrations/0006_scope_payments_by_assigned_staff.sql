-- Payments visibility by role.
-- Until now, "Admins manage payments" used is_admin() (super_admin OR
-- staff_admin) for every action, so any staff_admin could see every
-- client's payments and the company-wide total - not just their own
-- clients'. This splits it:
--   - super_admin (CEO): unchanged, full access to every payment -> sees
--     true total company revenue.
--   - staff_admin: only payments belonging to clients where
--     clients.assigned_to = their own profile id. Covers read AND write,
--     so a staff admin also can't record a payment against a client
--     that isn't theirs.
-- The separate "Client reads own payments" policy (a client viewing their
-- own portal) is untouched.
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run

drop policy if exists "Admins manage payments" on payments;

create policy "Super admin manages all payments"
  on payments for all
  using (is_super_admin())
  with check (is_super_admin());

create policy "Staff admin manages own clients payments"
  on payments for all
  using (
    exists (
      select 1 from clients
      where clients.id = payments.client_id
      and clients.assigned_to = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from clients
      where clients.id = payments.client_id
      and clients.assigned_to = auth.uid()
    )
  );
