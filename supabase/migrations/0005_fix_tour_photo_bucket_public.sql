-- Fix: 0004_tour_photo_storage.sql used
--   insert into storage.buckets (id, name, public) values (...) on conflict (id) do nothing;
-- If the "tour-photos" bucket already existed (e.g. created manually via the
-- dashboard, which defaults to private), that insert was a no-op and the
-- bucket stayed private. Uploaded photo URLs were still saved correctly to
-- tour_packages.photo_url, but the public URLs 403 and never render.
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run
-- (Or just flip Storage -> tour-photos -> Public toggle on in the dashboard —
-- this migration does the same thing, and is safe to run either way.)

update storage.buckets set public = true where id = 'tour-photos';
