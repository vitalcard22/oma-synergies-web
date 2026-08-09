export interface ServiceStep {
  title: string;
  desc: string;
}

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface Service {
  slug: string;
  icon: string;
  cluster: 'Study Abroad & Visa' | 'Travel';
  title: string;
  tagline: string;
  description: string;
  included: string[];
  steps: ServiceStep[];
  faqs: ServiceFaq[];
  ctaHeadline: string;
}

export const SERVICES: Service[] = [
  {
    slug: 'admissions',
    icon: '🎓',
    cluster: 'Study Abroad & Visa',
    title: 'Global Admissions Processing',
    tagline: 'Securing university and college admissions across top destinations worldwide.',
    description:
      'Securing university and college admissions across top destinations in Europe, the Americas, Asia, and Oceania (including Canada, USA, UK, Ireland, France, Italy, Sweden, Austria, South Korea, Philippines, China, and New Zealand).',
    included: [
      'School and program selection based on your profile and goals',
      'Application compilation and submission to your chosen institutions',
      'Direct coordination with our partner universities for stronger credibility',
      'Tracking of admission decisions and offer letters',
    ],
    steps: [
      { title: 'Consultation', desc: 'We assess your academic background, goals, and budget.' },
      { title: 'School Matching', desc: 'We recommend schools and programs that genuinely fit.' },
      { title: 'Application', desc: 'We compile and submit your application on your behalf.' },
      { title: 'Offer & Next Steps', desc: 'You receive your admission letter and move to visa stage.' },
    ],
    faqs: [
      {
        q: "Can I apply for a Master's program with an HND?",
        a: "Yes. We work with partner universities that accept Higher National Diploma (HND) qualifications for direct Master's programs or pre-Master's pathway programs, depending on the country and course.",
      },
      {
        q: 'How long does the admission process take?',
        a: 'It varies by school and country, but is typically part of a 3-6 month overall study abroad timeline.',
      },
    ],
    ctaHeadline: "Let's find your right school",
  },
  {
    slug: 'branding',
    icon: '✍️',
    cluster: 'Study Abroad & Visa',
    title: 'Professional Academic & Career Branding',
    tagline: 'SOPs, Letters of Intent, and CVs that stand out to admission boards and visa officers.',
    description:
      'Expert drafting, editing, and review of tailored Statements of Purpose (SOP), Letters of Intent, and professional Curriculum Vitae (CV) to strongly align with foreign university standards and visa requirements.',
    included: [
      'Custom-written Statement of Purpose tailored to your target school',
      'Letters of Intent aligned to program and country requirements',
      'Professional CV formatting and content review',
      'Editing rounds until the document is ready to submit',
    ],
    steps: [
      { title: 'Discovery', desc: 'We learn your story, achievements, and goals.' },
      { title: 'Drafting', desc: 'We write a tailored SOP, LOI, and/or CV for you.' },
      { title: 'Review & Polish', desc: "You review, we refine until it's ready." },
      { title: 'Final Delivery', desc: 'Submission-ready documents in hand.' },
    ],
    faqs: [
      {
        q: 'Do you write the SOP from scratch or edit mine?',
        a: 'Both are available. We can write a tailored SOP from scratch, or review and strengthen a draft you already have.',
      },
    ],
    ctaHeadline: "Let's tell your story properly",
  },
  {
    slug: 'visa',
    icon: '🛂',
    cluster: 'Study Abroad & Visa',
    title: 'End-to-End Visa Application Support',
    tagline: 'Comprehensive management of student visas and study permits, start to finish.',
    description:
      'Comprehensive management of student visas and study permit processes, providing full guidance from document compilation to final submission.',
    included: [
      'Full visa document checklist and compilation guidance',
      'Application form completion support',
      'Biometrics and interview preparation guidance',
      'Submission tracking through to decision',
    ],
    steps: [
      { title: 'Document Compilation', desc: 'We gather and organize everything required.' },
      { title: 'Application Review', desc: 'Every detail double-checked before submission.' },
      { title: 'Submission', desc: 'Your visa application is formally submitted.' },
      { title: 'Decision & Next Steps', desc: 'We guide you through approval or, if needed, reapplication.' },
    ],
    faqs: [
      {
        q: 'What happens if my visa is refused?',
        a: 'If you have a past refusal, we perform a strict review of your previous application to find what went wrong. We then fix the gaps in your documentation, update your SOP, and help you reapply with a much stronger file.',
      },
      {
        q: 'How long does visa processing take?',
        a: "This depends on the destination country's current processing times. We'll give you a realistic estimate during consultation.",
      },
    ],
    ctaHeadline: "Let's get your visa right",
  },
  {
    slug: 'document-review',
    icon: '⚖️',
    cluster: 'Study Abroad & Visa',
    title: 'Document Review & Profile Verification',
    tagline: 'Rigorous review to eliminate errors and strengthen your application.',
    description:
      'Rigorous evaluation of academic, financial, and legal documents by industry experts to minimize errors and maximize visa approval rates.',
    included: [
      'Academic transcript and certificate verification',
      'Financial document review for consistency and sufficiency',
      'Legal document checks before submission',
      'Error flagging before anything reaches an embassy',
    ],
    steps: [
      { title: 'Document Intake', desc: 'You share your academic, financial, and legal documents.' },
      { title: 'Expert Review', desc: 'Our team checks for errors, gaps, and inconsistencies.' },
      { title: 'Corrections', desc: 'We flag what needs fixing before it becomes a problem.' },
      { title: 'Sign-Off', desc: 'Your file is ready for confident submission.' },
    ],
    faqs: [
      {
        q: 'What documents do you typically review?',
        a: 'Academic transcripts and certificates, bank/financial statements, and any legal documents required for your specific visa or admission application.',
      },
    ],
    ctaHeadline: "Let's strengthen your file",
  },
  {
    slug: 'study-loan',
    icon: '💳',
    cluster: 'Study Abroad & Visa',
    title: 'Study Loan Facilitation',
    tagline: 'Funding support covering up to 65% of tuition and living expenses.',
    description:
      'Connecting students with trusted global funding partners to secure education loans covering up to 65% of tuition and living expenses.',
    included: [
      'Eligibility assessment for study loan options',
      'Introduction to trusted global funding partners',
      'Application guidance for loan approval',
      "Support coordinating loan terms with your admission timeline",
    ],
    steps: [
      { title: 'Eligibility Check', desc: 'We assess your situation against funding partner criteria.' },
      { title: 'Partner Introduction', desc: 'We connect you with the right funding partner.' },
      { title: 'Application Support', desc: 'We guide you through the loan application.' },
      { title: 'Approval', desc: 'Funding secured alongside your study plans.' },
    ],
    faqs: [
      {
        q: 'Do you assist with study loans?',
        a: 'Yes. We partner with trusted global financial institutions to help eligible students secure educational loans that cover up to 65% of their tuition and living expenses.',
      },
    ],
    ctaHeadline: "Let's ease the financial load",
  },
  {
    slug: 'flights',
    icon: '✈️',
    cluster: 'Travel',
    title: 'Comprehensive Flight Bookings & Travel Logistics',
    tagline: 'Flight bookings, visa-purpose reservations, and accommodation, all handled in one place.',
    description:
      'Handling itinerary planning, competitive flight bookings, flight reservations for visa purposes, and hotel or short-let accommodations for corporate, family, or student travelers.',
    included: [
      'Competitive flight booking across airlines and routes',
      'Flight reservations specifically for visa application presentation',
      'Hotel and short-let accommodation booking',
      'Itinerary planning for corporate, family, or student travel',
    ],
    steps: [
      { title: 'Travel Brief', desc: 'Tell us your dates, destination, and travel purpose.' },
      { title: 'Options & Booking', desc: 'We source and book the best-fit flights and stays.' },
      { title: 'Confirmation', desc: 'You receive confirmed bookings and documents.' },
      { title: 'Travel Day Support', desc: "We're reachable if anything changes last minute." },
    ],
    faqs: [
      {
        q: 'Do you handle flight bookings and hotel reservations?',
        a: 'Yes, absolutely. Beyond admissions and visas, we handle competitive flight bookings, flight reservations needed for visa presentation, and hotel or short-let accommodations to ensure you travel seamlessly.',
      },
    ],
    ctaHeadline: "Let's book your journey",
  },
  {
    slug: 'relocation',
    icon: '🏠',
    cluster: 'Travel',
    title: 'Relocation & Destination Assistance',
    tagline: 'Settling in safely, from housing to your first days abroad.',
    description:
      'Post-visa support to help students and travelers secure safe long-term housing, prepare for airport departure, and transition smoothly into their new international communities.',
    included: [
      'Housing search and safe accommodation guidance',
      'Pre-departure checklist and preparation support',
      'Local orientation guidance for your new city',
      'Ongoing support as you settle in',
    ],
    steps: [
      { title: 'Housing Search', desc: 'We help you find safe, suitable accommodation.' },
      { title: 'Pre-Departure Prep', desc: 'Checklist and guidance before you fly.' },
      { title: 'Arrival Support', desc: 'Orientation guidance for your new city.' },
      { title: 'Settling In', desc: 'We stay reachable as you find your footing.' },
    ],
    faqs: [
      {
        q: 'Does this service continue after my visa is approved?',
        a: 'Yes, this is specifically post-visa support, covering housing, departure prep, and settling into your new community.',
      },
    ],
    ctaHeadline: "Let's help you settle in",
  },
];

export function getServiceBySlug(slug: string | undefined): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
