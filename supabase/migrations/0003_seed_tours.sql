-- Seeds the 9 tour packages currently hardcoded in src/data/tours.ts.
-- Photos remain as bundled assets for now (admin-editable photo upload
-- is a separate scope requiring Supabase Storage setup).
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run

insert into tour_packages (name, destination, nights, from_price, per_person_sharing, categories, status, display_order) values
  ('Mauritius', 'Mauritius', 3, 1500000, false, ARRAY['Group Tours','Honeymoon','Solo','Family'], 'active', 1),
  ('Singapore', 'Singapore', 3, 1600900, true,  ARRAY['Group Tours','Honeymoon','Solo','Family'], 'active', 2),
  ('Maldives',  'Maldives',  3,  950000, true,  ARRAY['Group Tours','Honeymoon','Solo','Family'], 'active', 3),
  ('Kigali, Rwanda', 'Kigali, Rwanda', 3, 800000, true, ARRAY['Group Tours','Honeymoon','Solo','Family'], 'active', 4),
  ('Egypt',    'Egypt',    3,  985900, true,  ARRAY['Group Tours','Honeymoon','Solo','Family'], 'active', 5),
  ('Qatar',    'Qatar',    4, 1500000, true,  ARRAY['Group Tours','Honeymoon','Solo','Family'], 'active', 6),
  ('Zanzibar', 'Zanzibar', 4, 1400000, true,  ARRAY['Group Tours','Honeymoon','Solo','Family'], 'active', 7),
  ('Seychelles','Seychelles',4,1500000, true,  ARRAY['Group Tours','Honeymoon','Solo','Family'], 'active', 8),
  ('Nairobi',  'Nairobi',  4, 1000000, true,  ARRAY['Group Tours','Honeymoon','Solo','Family'], 'active', 9);

-- Verify
select name, from_price, nights, status from tour_packages order by display_order;
