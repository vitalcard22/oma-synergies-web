export interface Testimonial {
  initials: string;
  name: string;
  meta: string;
  quote: string;
  filterTag: 'Study' | 'Tourist' | 'Business';
  serviceTag: string;
}

export const TESTIMONIALS: Testimonial[] = [
  { initials: 'E.A.', name: 'Egwu A.', meta: 'University of West Scotland, UK', filterTag: 'Study', serviceTag: 'Study Visa', quote: 'The entire process was smooth and professionally handled. From my admission to my UK study visa approval, I received excellent guidance every step of the way. I highly recommend their services.' },
  { initials: 'S.', name: 'Stephen', meta: 'France', filterTag: 'Tourist', serviceTag: 'Tourist Visa', quote: 'My France tourist visa was processed quickly and efficiently. The team kept me informed throughout the application process, making everything stress-free.' },
  { initials: 'O.J.', name: 'Okechukwu J.', meta: 'China', filterTag: 'Business', serviceTag: 'Business Visa', quote: 'Excellent service from start to finish. They helped me secure my China business visa without unnecessary delays and ensured all my documents were properly prepared.' },
  { initials: 'E.I.', name: 'Emmanuel I.', meta: 'Robert Gordon University, UK', filterTag: 'Study', serviceTag: 'Study Visa', quote: 'I appreciate the professionalism and attention to detail. Thanks to their support, I successfully obtained my UK study visa and can now pursue my education at Robert Gordon University.' },
  { initials: 'C.E.', name: 'Chimazuru E.', meta: 'University Canada West, Canada', filterTag: 'Study', serviceTag: 'Study Visa', quote: "I'm grateful for the outstanding support throughout my Canadian study visa application. Their expertise made the entire journey simple and successful." },
  { initials: 'T.K.', name: 'Tochukwu K.', meta: 'Ireland', filterTag: 'Study', serviceTag: 'Study Visa', quote: "The team was knowledgeable, responsive, and reliable. My Ireland study visa was approved, and I couldn't be happier with the service I received." },
  { initials: 'W.O.', name: 'Walter O.', meta: 'South Korea', filterTag: 'Tourist', serviceTag: 'Tourist Visa', quote: 'A seamless and professional experience. My South Korea tourist visa was approved without complications, and the communication throughout the process was excellent.' },
  { initials: 'G.N.', name: 'Goodluck N.', meta: 'Spain', filterTag: 'Tourist', serviceTag: 'Tourist Visa', quote: 'Thank you for making my Spain tourist visa application straightforward and stress-free. I truly appreciate your professionalism and dedication.' },
  { initials: 'G.A.', name: 'Gift A.', meta: 'Canada', filterTag: 'Business', serviceTag: 'Spousal Open Work Permit', quote: 'The guidance and support I received were exceptional. My Canada Spousal Open Work Permit was approved successfully, and I highly recommend this team to anyone seeking immigration assistance.' },
];
