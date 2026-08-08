import canadaImg from '../assets/destinations/canada.jpg';
import usaImg from '../assets/destinations/usa.jpg';
import ukImg from '../assets/destinations/uk.jpg';
import irelandImg from '../assets/destinations/ireland.jpg';
import franceImg from '../assets/destinations/france.jpg';
import italyImg from '../assets/destinations/italy.jpg';
import austriaImg from '../assets/destinations/austria.jpg';
import southKoreaImg from '../assets/destinations/south-korea.jpg';
import philippinesImg from '../assets/destinations/philippines.jpg';
import chinaImg from '../assets/destinations/china.jpg';

export interface Destination {
  slug: string;
  name: string;
  region: 'Americas' | 'Europe' | 'Asia' | 'Oceania';
  img: string;
  processing: string;
  why: string;
  programs: string[];
  visaNote: string;
}

export const DESTINATIONS: Destination[] = [
  {
    slug: 'canada',
    name: 'Canada',
    region: 'Americas',
    img: canadaImg,
    processing: '8–12 weeks',
    why: 'Canada is home to globally recognized universities and offers one of the clearest pathways to permanent residency for international graduates through its post-graduation work permit system.',
    programs: ['Business Administration', 'Engineering', 'Information Technology', 'Nursing'],
    visaNote: 'Canada requires a study permit for most programs over 6 months, along with proof of acceptance, financial sufficiency, and a clean background check.',
  },
  {
    slug: 'usa',
    name: 'USA',
    region: 'Americas',
    img: usaImg,
    processing: '6–10 weeks',
    why: "The United States offers the world's largest and most diverse higher education system, with unmatched program variety, research funding, and campus life.",
    programs: ['Computer Science', 'MBA Programs', 'Engineering', 'Public Health'],
    visaNote: 'US study requires an F-1 student visa, an I-20 from your accepted institution, and a consular interview at the nearest US embassy.',
  },
  {
    slug: 'uk',
    name: 'United Kingdom',
    region: 'Europe',
    img: ukImg,
    processing: '3–6 weeks',
    why: 'The UK offers world-renowned universities, shorter degree durations than most countries, and a Graduate Route visa allowing two years of post-study work.',
    programs: ['Law', 'Business & Finance', 'Engineering', 'Medicine'],
    visaNote: 'UK study requires a Student visa (formerly Tier 4), a Confirmation of Acceptance for Studies (CAS), and proof of financial maintenance.',
  },
  {
    slug: 'ireland',
    name: 'Ireland',
    region: 'Europe',
    img: irelandImg,
    processing: '4–8 weeks',
    why: 'Ireland has become a growing tech and pharmaceutical hub within the EU, offering a generous 2-year post-study stay-back option for graduates.',
    programs: ['Data Science', 'Pharmaceutical Sciences', 'Business', 'Computer Science'],
    visaNote: "Non-EU students require a 'D' study visa for programs longer than 90 days, along with proof of enrollment and financial support.",
  },
  {
    slug: 'france',
    name: 'France',
    region: 'Europe',
    img: franceImg,
    processing: '4–8 weeks',
    why: 'France offers affordable, high-quality education with especially strong programs in business, engineering, and the arts, at a lower cost than many Western countries.',
    programs: ['Business (Grandes Écoles)', 'Fashion & Design', 'Engineering', 'Culinary Arts'],
    visaNote: 'Most non-EU students apply through Campus France and require a long-stay student visa (VLS-TS) once accepted.',
  },
  {
    slug: 'italy',
    name: 'Italy',
    region: 'Europe',
    img: italyImg,
    processing: '4–8 weeks',
    why: 'Italy combines a rich academic tradition with relatively low tuition at public universities, and strong programs in design, fashion, and engineering.',
    programs: ['Design & Fashion', 'Architecture', 'Engineering', 'Art History'],
    visaNote: "Non-EU students require a national 'D' visa for study, applied for through the Italian consulate after receiving admission.",
  },
  {
    slug: 'sweden',
    name: 'Sweden',
    region: 'Europe',
    img: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=1200&q=80',
    processing: '6–10 weeks',
    why: "Sweden's innovation-driven education system places strong emphasis on sustainability, technology, and research, with programs taught widely in English.",
    programs: ['Sustainability Studies', 'Engineering', 'Computer Science', 'Design'],
    visaNote: 'Non-EU students need a Swedish residence permit for studies, applied for online before arrival, alongside proof of tuition payment and finances.',
  },
  {
    slug: 'austria',
    name: 'Austria',
    region: 'Europe',
    img: austriaImg,
    processing: '6–10 weeks',
    why: 'Austria offers high academic standards and a lower cost of living relative to much of Western Europe, with central access to the rest of the EU.',
    programs: ['Music & Performing Arts', 'Business', 'Engineering', 'Medicine'],
    visaNote: 'Non-EU students require a student residence permit, applied for at the Austrian embassy before travel.',
  },
  {
    slug: 'south-korea',
    name: 'South Korea',
    region: 'Asia',
    img: southKoreaImg,
    processing: '6–10 weeks',
    why: 'South Korea is a fast-growing technology and business hub, with increasing scholarship opportunities for international students across top universities.',
    programs: ['Business & Trade', 'Engineering', 'Media & Design', 'Korean Studies'],
    visaNote: 'Study in Korea requires a D-2 student visa, supported by a Certificate of Admission from your university.',
  },
  {
    slug: 'philippines',
    name: 'Philippines',
    region: 'Asia',
    img: philippinesImg,
    processing: '3–6 weeks',
    why: 'The Philippines offers English-taught programs, a lower cost of living, and a welcoming environment for international students, especially in medical fields.',
    programs: ['Medicine', 'Nursing', 'Business Administration', 'Aviation'],
    visaNote: 'International students typically require a Student Visa (9(f)), processed through the Bureau of Immigration once accepted.',
  },
  {
    slug: 'china',
    name: 'China',
    region: 'Asia',
    img: chinaImg,
    processing: '6–10 weeks',
    why: 'China offers extensive scholarship programs and rapidly rising global university rankings, particularly strong in engineering and business.',
    programs: ['Engineering', 'International Business', 'Medicine', 'Mandarin Studies'],
    visaNote: 'Students require an X1 or X2 student visa, supported by a JW202 form issued by the admitting institution.',
  },
  {
    slug: 'new-zealand',
    name: 'New Zealand',
    region: 'Oceania',
    img: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1200&q=80',
    processing: '4–6 weeks',
    why: 'New Zealand offers a high quality of life, a safe environment, and straightforward post-study work pathways for international graduates.',
    programs: ['Agriculture & Environment', 'Business', 'Hospitality', 'Engineering'],
    visaNote: 'Most students require a Fee Paying Student Visa, supported by an Offer of Place from a registered institution.',
  },
];

export function getDestinationBySlug(slug: string | undefined): Destination | undefined {
  return DESTINATIONS.find((d) => d.slug === slug);
}
