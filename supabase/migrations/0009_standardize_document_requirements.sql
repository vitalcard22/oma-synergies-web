-- Standardizes document requirements across service types.
--
-- Previously only 3 of the 10 service types offered in registration had
-- any document_requirements at all (UK Study Visa, Tourist Visa, Business
-- Visa) - Canadian Study Permit, USA Study Visa, and Australian Study
-- Visa had none, so a client registered under any of those got an empty
-- Document Centre with nothing for the consultant to have pre-populated.
--
-- This replaces all of them with:
--   - One shared 6-item checklist for every study visa type (UK,
--     Canadian, USA, Australian) - country-specific extras (CAS, TB test,
--     sponsor letter, etc.) are no longer auto-included; the consultant
--     adds those to a specific client's case by hand when relevant, via
--     the existing "Add Document" action on the case view.
--   - One shared 3-item checklist for Tourist Visa and Business Visa.
--
-- Deletes existing rows for these 6 service types first (so this is safe
-- to run whether a service type currently has 0 or 7 rows), then inserts
-- the new set. The unique index from migration 0008 prevents any
-- duplicate from slipping back in.
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run

delete from document_requirements
where service_type in (
  'UK Study Visa', 'Canadian Study Permit', 'USA Study Visa', 'Australian Study Visa',
  'Tourist Visa', 'Business Visa'
);

insert into document_requirements (service_type, document_name, required, display_order)
select service_type, document_name, true, display_order
from (values
  ('Passport (biodata page)', 1),
  ('Certificates', 2),
  ('Academic transcripts', 3),
  ('O''Level result (WAEC/NECO)', 4),
  ('English proficiency result', 5),
  ('Recommendation letters', 6)
) as study(document_name, display_order)
cross join (values
  ('UK Study Visa'), ('Canadian Study Permit'), ('USA Study Visa'), ('Australian Study Visa')
) as study_types(service_type);

insert into document_requirements (service_type, document_name, required, display_order)
select service_type, document_name, true, display_order
from (values
  ('Passport (biodata page)', 1),
  ('CAC / Work details', 2),
  ('Account statement', 3)
) as tourist_business(document_name, display_order)
cross join (values
  ('Tourist Visa'), ('Business Visa')
) as tb_types(service_type);
