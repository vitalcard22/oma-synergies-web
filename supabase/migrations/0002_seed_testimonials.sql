-- Seeds the 9 testimonials currently hardcoded in src/data/testimonials.ts,
-- all marked approved so the live Success Stories page and destination
-- detail pages show identical content immediately after switching from
-- the static file to a real Supabase query - no visible regression on
-- the live site.
--
-- HOW TO RUN THIS: Supabase Dashboard -> SQL Editor -> paste -> Run

insert into testimonials (client_name, destination, category, service_tag, quote, status) values
  ('Egwu A.', 'University of West Scotland, UK', 'Study', 'Study Visa', 'The entire process was smooth and professionally handled. From my admission to my UK study visa approval, I received excellent guidance every step of the way. I highly recommend their services.', 'approved'),
  ('Stephen', 'France', 'Tourist', 'Tourist Visa', 'My France tourist visa was processed quickly and efficiently. The team kept me informed throughout the application process, making everything stress-free.', 'approved'),
  ('Okechukwu J.', 'China', 'Business', 'Business Visa', 'Excellent service from start to finish. They helped me secure my China business visa without unnecessary delays and ensured all my documents were properly prepared.', 'approved'),
  ('Emmanuel I.', 'Robert Gordon University, UK', 'Study', 'Study Visa', 'I appreciate the professionalism and attention to detail. Thanks to their support, I successfully obtained my UK study visa and can now pursue my education at Robert Gordon University.', 'approved'),
  ('Chimazuru E.', 'University Canada West, Canada', 'Study', 'Study Visa', 'I''m grateful for the outstanding support throughout my Canadian study visa application. Their expertise made the entire journey simple and successful.', 'approved'),
  ('Tochukwu K.', 'Ireland', 'Study', 'Study Visa', 'The team was knowledgeable, responsive, and reliable. My Ireland study visa was approved, and I couldn''t be happier with the service I received.', 'approved'),
  ('Walter O.', 'South Korea', 'Tourist', 'Tourist Visa', 'A seamless and professional experience. My South Korea tourist visa was approved without complications, and the communication throughout the process was excellent.', 'approved'),
  ('Goodluck N.', 'Spain', 'Tourist', 'Tourist Visa', 'Thank you for making my Spain tourist visa application straightforward and stress-free. I truly appreciate your professionalism and dedication.', 'approved'),
  ('Gift A.', 'Canada', 'Business', 'Spousal Open Work Permit', 'The guidance and support I received were exceptional. My Canada Spousal Open Work Permit was approved successfully, and I highly recommend this team to anyone seeking immigration assistance.', 'approved');
