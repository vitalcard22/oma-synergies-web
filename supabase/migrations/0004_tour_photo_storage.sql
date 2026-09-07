-- Add photo_url column to tour_packages
-- This allows admin-uploaded photos to be stored as URLs in Supabase Storage
-- rather than relying on bundled code assets.
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run

alter table tour_packages add column if not exists photo_url text;

-- Create the storage bucket for tour photos (public read access)
-- NOTE: also create the bucket manually in Supabase Dashboard:
-- Storage -> New Bucket -> Name: "tour-photos" -> Public: ON
insert into storage.buckets (id, name, public)
values ('tour-photos', 'tour-photos', true)
on conflict (id) do nothing;

-- Allow public read access to tour photos
create policy "Tour photos are publicly readable"
  on storage.objects for select
  using ( bucket_id = 'tour-photos' );

-- Allow authenticated admins to upload tour photos
create policy "Admins can upload tour photos"
  on storage.objects for insert
  with check (
    bucket_id = 'tour-photos'
    and auth.role() = 'authenticated'
  );

-- Allow authenticated admins to update/replace tour photos
create policy "Admins can update tour photos"
  on storage.objects for update
  using (
    bucket_id = 'tour-photos'
    and auth.role() = 'authenticated'
  );

-- Allow authenticated admins to delete tour photos
create policy "Admins can delete tour photos"
  on storage.objects for delete
  using (
    bucket_id = 'tour-photos'
    and auth.role() = 'authenticated'
  );
