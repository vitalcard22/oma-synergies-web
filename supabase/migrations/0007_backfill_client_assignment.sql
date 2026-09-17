-- Backfill assigned_to for clients that existed before ownership tracking
-- was introduced. Until now, assigned_to was never set by any code path -
-- every client, including any created before this point, has it null.
-- Under migration 0006's payments RLS split, an unassigned client is
-- invisible to every staff admin (only the CEO/super_admin sees them),
-- which would make existing payment history disappear from staff view
-- with no way to recover it short of an admin editing every row by hand.
--
-- Best available default: whoever created the client (created_by) becomes
-- who it's assigned to. Not perfect - a case may have since changed hands -
-- but it's the only ownership signal that already exists in the data, and
-- it's a one-time backfill: reassign individually afterward as needed from
-- a client's case view (Overview tab -> Assigned to, CEO only).
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run

update clients
set assigned_to = created_by
where assigned_to is null
  and created_by is not null;
