export const ADMIN_CLIENTS = [
  { name: 'Egwu A.', initials: 'E.A.', destination: 'United Kingdom', service: 'Study Visa', status: 'Approved' as const },
  { name: 'Stephen', initials: 'S.', destination: 'France', service: 'Tourist Visa', status: 'Approved' as const },
  { name: 'Okechukwu J.', initials: 'O.J.', destination: 'China', service: 'Business Visa', status: 'Approved' as const },
  { name: 'Emmanuel I.', initials: 'E.I.', destination: 'United Kingdom', service: 'Study Visa', status: 'Approved' as const },
  { name: 'Chimazuru E.', initials: 'C.E.', destination: 'Canada', service: 'Study Visa', status: 'Approved' as const },
  { name: 'Tochukwu K.', initials: 'T.K.', destination: 'Ireland', service: 'Study Visa', status: 'In Progress' as const },
  { name: 'Walter O.', initials: 'W.O.', destination: 'South Korea', service: 'Tourist Visa', status: 'Approved' as const },
  { name: 'Goodluck N.', initials: 'G.N.', destination: 'Spain', service: 'Tourist Visa', status: 'Approved' as const },
  { name: 'Gift A.', initials: 'G.A.', destination: 'Canada', service: 'Spousal Work Permit', status: 'Approved' as const },
];

export const ADMIN_INQUIRIES = [
  { name: 'Chinedu Obi', email: 'chinedu.o@email.com', service: 'Global Admissions Processing', destination: 'Canada', status: 'New' as const },
  { name: 'Amaka Eze', email: 'amaka.e@email.com', service: 'Study Loan Facilitation', destination: 'UK', status: 'New' as const },
  { name: 'Femi Adeyemi', email: 'femi.a@email.com', service: 'Not sure, need guidance', destination: '-', status: 'Contacted' as const },
  { name: 'Blessing Nwosu', email: 'blessing.n@email.com', service: 'Comprehensive Flight Bookings', destination: 'South Korea', status: 'Closed' as const },
];

export const ADMIN_CONSULTATIONS = [
  { when: 'Mon, Aug 10 · 10:00 AM', client: 'Chinedu Obi', service: 'Global Admissions Processing', staff: 'Adaeze O.', staffInitials: 'A.O.', status: 'Confirmed' as const },
  { when: 'Mon, Aug 10 · 2:00 PM', client: 'Amaka Eze', service: 'Study Loan Facilitation', staff: 'Nnenna J.', staffInitials: 'N.J.', status: 'Confirmed' as const },
  { when: 'Wed, Aug 12 · 11:30 AM', client: 'Femi Adeyemi', service: 'General Guidance', staff: 'Adaeze O.', staffInitials: 'A.O.', status: 'Awaiting Confirmation' as const },
  { when: 'Fri, Aug 14 · 9:00 AM', client: 'Blessing Nwosu', service: 'Flight Bookings & Travel Logistics', staff: 'Increase U.', staffInitials: 'I.U.', status: 'Confirmed' as const },
];

export const ADMIN_DOCUMENTS = [
  { client: 'Tochukwu K.', initials: 'T.K.', doc: 'Passport_Scan.pdf', type: 'Passport', status: 'Pending' as const },
  { client: 'Tochukwu K.', initials: 'T.K.', doc: 'Bank_Statement.pdf', type: 'Financial', status: 'Pending' as const },
  { client: 'New Applicant', initials: '-', doc: 'Transcript.pdf', type: 'Academic', status: 'Pending' as const },
];

export const ADMIN_PAYMENTS = [
  { client: 'Chimazuru E.', item: 'Study Loan Facilitation Fee', amount: '₦75,000', ref: 'SLR-88213', status: 'Paid' as const },
  { client: 'Walter O.', item: 'Dubai Long Weekend Deposit', amount: '₦620,000', ref: 'SLR-88190', status: 'Paid' as const },
  { client: 'Gift A.', item: 'Spousal Work Permit Service Fee', amount: '₦120,000', ref: 'SLR-88175', status: 'Paid' as const },
  { client: 'Chinedu Obi', item: 'Admissions Processing Fee', amount: '₦95,000', ref: 'SLR-88301', status: 'Pending' as const },
  { client: 'Amaka Eze', item: 'Study Loan Facilitation Fee', amount: '₦75,000', ref: 'SLR-88302', status: 'Pending' as const },
];

export const ADMIN_TESTIMONIALS = [
  { client: 'Egwu A.', initials: 'E.A.', service: 'UK Study Visa', type: 'Text', live: true },
  { client: 'Stephen', initials: 'S.', service: 'France Tourist Visa', type: 'Text', live: true },
  { client: 'Gift A.', initials: 'G.A.', service: 'Canada Spousal Permit', type: 'Text', live: true },
  { client: 'Video Testimonial', initials: '-', service: '-', type: 'Video', live: false },
];

export const ADMIN_DESTINATIONS = [
  { name: 'Canada', region: 'Americas', processing: '8-12 weeks', live: true },
  { name: 'USA', region: 'Americas', processing: '6-10 weeks', live: true },
  { name: 'United Kingdom', region: 'Europe', processing: '3-6 weeks', live: true },
  { name: 'Ireland', region: 'Europe', processing: '4-8 weeks', live: true },
];

export const ADMIN_TOURS = [
  { name: 'Cape Town Explorer', category: 'Group Tour', price: '₦850,000', live: true },
  { name: 'Dubai Long Weekend', category: 'Solo', price: '₦620,000', live: true },
  { name: 'London Family Highlights', category: 'Family', price: '₦1,150,000', live: true },
  { name: 'Maldives Escape', category: 'Honeymoon', price: '₦2,100,000', live: true },
];

export const ADMIN_STAFF = [
  { name: 'Adaeze Ohazuruike', initials: 'A.O.', role: 'Founder & CEO', permission: 'Admin: Full Access', admin: true },
  { name: 'Increase Uchechukwu', initials: 'I.U.', role: 'Writer, SOP & CV Specialist', permission: 'Staff: Content Only', admin: false },
  { name: 'Ugwuoke Nnenna Juliet', initials: 'N.J.', role: 'Strategy and Operations Lead', permission: 'Admin: Full Access', admin: true },
  { name: 'Awoniyi Joshua Ayodeji', initials: 'A.J.', role: 'Research Assistant', permission: 'Staff: View Only', admin: false },
];

export const ADMIN_ACTIVITY = [
  { who: 'Gift A.', initials: 'G.A.', update: 'Spousal Work Permit approved', tag: 'Canada', when: '2 days ago' },
  { who: 'Tochukwu K.', initials: 'T.K.', update: 'Visa application submitted', tag: 'Ireland Study', when: '4 days ago' },
  { who: 'Walter O.', initials: 'W.O.', update: 'Tourist visa approved', tag: 'South Korea', when: '1 week ago' },
  { who: 'New inquiry', initials: '', update: 'Admissions question submitted', tag: 'Website Contact Form', when: '1 hour ago' },
];

export const ADMIN_NOTIFICATIONS = [
  { title: 'New inquiry received', sub: 'Chinedu Obi asked about Global Admissions Processing', when: '1 hour ago' },
  { title: 'Document uploaded', sub: 'Tochukwu K. uploaded a bank statement', when: '4 hours ago' },
  { title: 'Consultation confirmed', sub: 'Amaka Eze confirmed for Mon, Aug 10', when: 'Yesterday' },
  { title: 'Visa approved', sub: "Walter O.'s South Korea tourist visa was approved", when: '3 days ago' },
];
