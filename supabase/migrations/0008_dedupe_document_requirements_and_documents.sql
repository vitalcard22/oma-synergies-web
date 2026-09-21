-- Fixes duplicate document checklist items, e.g. "Academic transcripts &
-- certificates" and "Academic Transcripts & Certificates" both showing in
-- a client's Document Centre for the same requirement.
--
-- Root cause: document_requirements had no uniqueness constraint, so at
-- some point a second set of rows was inserted for names that already
-- existed, differing only in capitalization (Title Case vs the original
-- sentence-case seed). create-client.js and startNewApplication both
-- copy every matching document_requirements row straight into a new
-- application's documents checklist with no dedup of their own - so this
-- wasn't a one-off for one client, every client created since the
-- duplicate rows appeared got doubled-up checklists.
--
-- This migration:
--   1. Removes the duplicate document_requirements rows (keeping one
--      canonical row per service_type + name, case-insensitive).
--   2. Adds a unique index so a duplicate requirement can never be
--      inserted again.
--   3. Cleans up documents rows already created from the duplicated
--      template - for any application with two rows for what's really
--      the same document, keeps whichever one has an uploaded file (so
--      a client who already uploaded against one of the duplicates
--      doesn't lose that file), or the earliest row if neither has one.
--   4. Adds a matching unique index on documents so this can't recur
--      there either, regardless of what template it came from.
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run

-- 1. Dedupe document_requirements. Prefers a non-Title-Case version (the
-- original seed data is written in sentence case) as canonical, then
-- lowest display_order, then id, purely as tie-breakers - which one wins
-- is cosmetic only, nothing depends on it downstream.
with ranked_reqs as (
  select id,
    row_number() over (
      partition by service_type, lower(trim(document_name))
      order by (document_name = initcap(document_name)) asc, display_order asc, id asc
    ) as rn
  from document_requirements
)
delete from document_requirements
where id in (select id from ranked_reqs where rn > 1);

-- 2. Prevent recurrence.
create unique index if not exists document_requirements_unique_name
  on document_requirements (service_type, lower(trim(document_name)));

-- 3. Dedupe documents per application. A row with an uploaded file always
-- wins over one without, regardless of name casing or age.
with ranked_docs as (
  select id,
    row_number() over (
      partition by application_id, lower(trim(document_name))
      order by (file_url is not null) desc, file_uploaded_at desc nulls last, id asc
    ) as rn
  from documents
)
delete from documents
where id in (select id from ranked_docs where rn > 1);

-- 4. Prevent recurrence at the documents level too.
create unique index if not exists documents_unique_name_per_application
  on documents (application_id, lower(trim(document_name)));
