import Header from '../components/Header';
import Footer from '../components/Footer';
import './Terms.css';

const SECTIONS = [
  {
    id: 'scope',
    title: '1. Scope of Service',
    clauses: [
      { h: 'Consultancy Only', p: 'Oma Synergies provides expert guidance, document review, and administrative assistance. We act as a facilitator between the Client and the relevant Embassy, Consulate, or High Commission.' },
      { h: 'No Guarantee of Approval', p: 'The final decision to grant or refuse a visa rests solely with the immigration authorities of the respective country. Oma Synergies does not influence, nor can we guarantee, the outcome of any application.' },
    ],
  },
  {
    id: 'responsibilities',
    title: '2. Client Responsibilities',
    clauses: [
      { h: 'Accuracy of Information', p: 'The Client is responsible for providing truthful, accurate, and complete information. Any rejection or ban resulting from forged documents, false declarations, or concealed facts is the sole liability of the Client.' },
      { h: 'Timely Submission', p: 'Clients must provide all requested documents within the timelines specified by our consultants to ensure processing within embassy windows.' },
      { h: 'Physical Presence', p: 'If an embassy requires biometrics (fingerprints) or an interview, the Client must attend in person as scheduled.' },
    ],
  },
  {
    id: 'fees',
    title: '3. Fees and Payments',
    clauses: [
      { h: 'Service Fees', p: 'Our professional service fees are for the consultancy, administrative work, and processing time. These fees are non-refundable, regardless of whether the visa is approved, refused, or withdrawn.' },
      { h: 'Embassy / Third-Party Fees', p: 'Visa application fees charged by embassies, VFS Global, or courier services are separate from our service fees and are governed by the refund policies of those respective institutions (usually non-refundable).' },
      { h: 'Price Changes', p: 'Embassy fees are subject to change based on exchange rates or government policy. The Client is responsible for paying any fee differences at the time of submission.' },
    ],
  },
  {
    id: 'processing',
    title: '4. Processing Times',
    clauses: [
      { h: 'Estimates Only', p: 'Any processing time provided by Oma Synergies is an estimate based on current embassy trends. We are not liable for delays caused by embassy backlogs, technical glitches, or administrative inquiries beyond our control.' },
      { h: 'Travel Bookings', p: 'We strongly advise Clients not to book non-refundable flights or hotels until a visa has been officially issued. Oma Synergies is not liable for financial losses incurred due to travel cancellations following a visa delay or refusal.' },
    ],
  },
  {
    id: 'liability',
    title: '5. Limitation of Liability',
    clauses: [
      { h: 'Loss of Documents', p: 'While we take extreme care with all original passports and documents, Oma Synergies is not liable for loss or damage to documents while they are in the possession of third parties (e.g., embassies, courier companies, or postal services).' },
      { h: 'Consequential Loss', p: 'We are not liable for any indirect or consequential loss (such as loss of business, missed academic start dates, or emotional distress) resulting from a visa decision or delay.' },
    ],
  },
  {
    id: 'privacy',
    title: '6. Confidentiality and Data Protection',
    clauses: [
      { h: 'Data Use', p: 'Oma Synergies is committed to protecting your privacy. All personal data, academic transcripts, and financial statements provided will be used strictly for the purpose of your visa application and will not be shared with unauthorized third parties.' },
    ],
  },
];

export default function Terms() {
  return (
    <>
      <Header />

      <div className="legal-hero">
        <div className="wrap">
          <span className="eyebrow">Legal · Terms of Service</span>
          <h1>Visa Application Terms & Conditions</h1>
          <p className="party">
            By engaging the services of <strong>Oma Synergies Travels and Tours Ltd</strong> for visa consultation and processing assistance, you (the "Client") agree to the following terms and conditions. These terms ensure a professional, transparent, and efficient working relationship between the agency and the applicant.
          </p>
          <div className="meta-line">Effective date: August 2026 · Applies to all visa consultation and processing engagements</div>
        </div>
      </div>

      <div className="legal-body">
        <div className="wrap">
          <div className="legal-grid">
            <aside className="toc">
              <h4>On This Page</h4>
              {SECTIONS.map((s) => (
                <a href={`#${s.id}`} key={s.id}>{s.title}</a>
              ))}
            </aside>

            <div className="legal-content">
              {SECTIONS.map((s, i) => (
                <section id={s.id} key={s.id}>
                  <h2><span className="num">{i + 1}</span>{s.title.replace(/^\d+\.\s*/, '')}</h2>
                  {s.clauses.map((c) => (
                    <div className="clause" key={c.h}>
                      <strong>{c.h}</strong>
                      <p>{c.p}</p>
                    </div>
                  ))}
                </section>
              ))}

              <div className="ack-box">
                <span className="eyebrow">Acknowledgment</span>
                <p>
                  By proceeding with your payment and application, you confirm that you have read, understood, and accepted these{' '}
                  <strong>Terms and Conditions</strong> in full.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
