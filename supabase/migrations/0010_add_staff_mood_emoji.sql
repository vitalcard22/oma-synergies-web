-- Optional self-set mood emoji for staff, shown in the admin sidebar and
-- the Staff & Roles table. Nullable, no default (unset = no emoji shown).
-- Value is restricted to a small fixed preset by api/admin/update-mood.js,
-- not free text - the column itself has no length/pattern limits, since
-- validation lives in application code alongside the preset list.
alter table profiles add column mood_emoji text;
