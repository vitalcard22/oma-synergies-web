import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Privacy.css';

const SECTIONS = [
  {
    id: 'who-we-are',
    title: '1. Who We Are',
  },
  {
    id: 'what-we-collect',
    title: '2. What We Collect',
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Your Data',
  },
  {
    id: 'sharing',
    title: '4. Who We Share It With',
  },
  {
    id: 'retention',
    title: '5. How Long We Keep It',
  },
  {
    id: 'your-rights',
    title: '6. Your Rights',
  },
  {
    id: 'cookies',
    title: '7. Cookies & Analytics',
  },
  {
    id: 'contact',
    title: '8. Contact Us',
  },
];

export default function Privacy() {
  return (
    <>
      <Header />

      <div className="legal-hero">
        <div className="wrap">
          <span className="eyebrow">Legal · Privacy Policy</span>
          <h1>Your Privacy Matters to Us</h1>
          <p className="party">
            This policy explains how <strong>Oma Synergies Travels and Tours Ltd</strong> collects, uses, and protects your personal data when you use our website or engage our services. We are committed to handling your information responsibly and transparently.
          </p>
          <div className="meta-line">Effective date: August 2026 · Applies to omasynergiestravel.com and all associated client engagements</div>
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

              <section id="who-we-are">
                <h2><span className="num">1</span>Who We Are</h2>
                <div className="clause">
                  <strong>Data Controller</strong>
                  <p>Oma Synergies Travels and Tours Ltd ("we", "us", "our") is the data controller for all personal information collected through this website and our service engagements. We are registered in Nigeria and operate from Block B8, 29/32 Utako Market Plaza, Abuja.</p>
                </div>
                <div className="clause">
                  <strong>How to Reach Us</strong>
                  <p>For any privacy-related enquiry, contact us at <a href="mailto:Omasynergiestravels@gmail.com">Omasynergiestravels@gmail.com</a> or call 0806 769 6464.</p>
                </div>
              </section>

              <section id="what-we-collect">
                <h2><span className="num">2</span>What We Collect</h2>
                <div className="clause">
                  <strong>Information You Give Us Directly</strong>
                  <p>When you submit an enquiry through our contact form, you provide your full name, email address, phone number, the service you are interested in, your intended destination, and a message describing your needs. When you engage our services formally, we may also collect copies of your passport, financial statements, academic transcripts, employment letters, and any other documents required for your visa application.</p>
                </div>
                <div className="clause">
                  <strong>Information Collected Automatically</strong>
                  <p>When you visit our website, our hosting provider may collect standard server log data — including your IP address, browser type, pages visited, and time of access. This information is used for security and performance monitoring only and is not linked to your identity.</p>
                </div>
                <div className="clause">
                  <strong>Information from Third Parties</strong>
                  <p>We do not purchase or acquire personal data from third-party data brokers. Any information we receive about you comes directly from you or from partner organisations (such as ApplyBoard, KC Overseas Education, BorderPass, or Passage) only in the context of a service you have actively requested.</p>
                </div>
              </section>

              <section id="how-we-use">
                <h2><span className="num">3</span>How We Use Your Data</h2>
                <div className="clause">
                  <strong>To Deliver Our Services</strong>
                  <p>The primary purpose for collecting your information is to provide the visa consultation and processing assistance you have requested — including document review, application preparation, embassy submission, and follow-up communications on your behalf.</p>
                </div>
                <div className="clause">
                  <strong>To Respond to Enquiries</strong>
                  <p>When you contact us through our website form or WhatsApp, we use your name, email, and phone number to respond to your request and provide the information or quote you asked for.</p>
                </div>
                <div className="clause">
                  <strong>To Comply with Legal Obligations</strong>
                  <p>We may be required to retain certain records for regulatory, tax, or legal compliance purposes under Nigerian law. In such cases, we retain only what is legally required and for no longer than the applicable retention period.</p>
                </div>
                <div className="clause">
                  <strong>What We Do Not Do</strong>
                  <p>We do not sell your personal data. We do not use your information for automated decision-making or profiling. We do not send unsolicited marketing communications. We will not contact you for purposes unrelated to the services you engaged us for without your explicit consent.</p>
                </div>
              </section>

              <section id="sharing">
                <h2><span className="num">4</span>Who We Share It With</h2>
                <div className="clause">
                  <strong>Embassies and Immigration Authorities</strong>
                  <p>To process your visa application, your personal data and supporting documents must be submitted to the relevant embassy, consulate, high commission, or visa application centre (e.g., VFS Global, TLScontact). Once submitted, your data is subject to the privacy policies of those institutions, which are outside our control.</p>
                </div>
                <div className="clause">
                  <strong>Authorised Partner Organisations</strong>
                  <p>We work with trusted partners — including ApplyBoard, KC Overseas Education, BorderPass, and Passage — who assist in specific aspects of the admissions and visa process. Data is shared with these partners only where necessary to fulfil your service request, and only with your knowledge.</p>
                </div>
                <div className="clause">
                  <strong>Service Providers</strong>
                  <p>We use third-party tools to run our website and communications, including web hosting, email, and messaging services. These providers act as data processors on our behalf and are contractually required to handle your data securely and only for the purposes we specify.</p>
                </div>
                <div className="clause">
                  <strong>Legal Requirements</strong>
                  <p>We may disclose your information if required to do so by law, court order, or regulatory authority. We will notify you of such a request where we are legally permitted to do so.</p>
                </div>
              </section>

              <section id="retention">
                <h2><span className="num">5</span>How Long We Keep It</h2>
                <div className="clause">
                  <strong>Active Clients</strong>
                  <p>We retain your application documents and correspondence for the duration of your service engagement plus 12 months, to allow for any follow-up queries, appeals, or re-applications.</p>
                </div>
                <div className="clause">
                  <strong>Enquiries That Did Not Convert</strong>
                  <p>If you submitted an enquiry but did not proceed with our services, we retain your contact details for up to 6 months and then delete them unless you have explicitly consented to further contact.</p>
                </div>
                <div className="clause">
                  <strong>Legal and Financial Records</strong>
                  <p>Records required for tax, accounting, or legal compliance may be retained for up to 7 years in line with Nigerian regulatory requirements. After this period, records are securely deleted.</p>
                </div>
              </section>

              <section id="your-rights">
                <h2><span className="num">6</span>Your Rights</h2>
                <div className="clause">
                  <strong>Access</strong>
                  <p>You have the right to request a copy of the personal data we hold about you at any time.</p>
                </div>
                <div className="clause">
                  <strong>Correction</strong>
                  <p>If any of your information is inaccurate or out of date, you have the right to request that we correct it promptly.</p>
                </div>
                <div className="clause">
                  <strong>Deletion</strong>
                  <p>You may request that we delete your personal data where we no longer have a legitimate reason to hold it. Note that we may not always be able to comply — for example, where records are required by law or needed to complete a service you requested.</p>
                </div>
                <div className="clause">
                  <strong>Objection and Withdrawal</strong>
                  <p>Where we process your data on the basis of consent, you may withdraw that consent at any time by contacting us. Withdrawal does not affect the lawfulness of processing already carried out.</p>
                </div>
                <div className="clause">
                  <strong>How to Exercise Your Rights</strong>
                  <p>Email us at <a href="mailto:Omasynergiestravels@gmail.com">Omasynergiestravels@gmail.com</a> with the subject line "Privacy Request". We will respond within 14 business days.</p>
                </div>
              </section>

              <section id="cookies">
                <h2><span className="num">7</span>Cookies & Analytics</h2>
                <div className="clause">
                  <strong>Essential Cookies Only</strong>
                  <p>Our website currently uses only the cookies strictly necessary for the site to function — such as remembering your session when you use the client portal. We do not currently use advertising cookies, third-party tracking pixels, or cross-site analytics that identify you personally.</p>
                </div>
                <div className="clause">
                  <strong>Future Changes</strong>
                  <p>If we introduce analytics tools or marketing trackers in the future, we will update this policy and, where required, obtain your consent before setting non-essential cookies.</p>
                </div>
              </section>

              <section id="contact">
                <h2><span className="num">8</span>Contact Us</h2>
                <div className="clause">
                  <strong>Questions or Concerns</strong>
                  <p>If you have any question about this Privacy Policy, how we handle your data, or wish to exercise any of your rights, please contact us:</p>
                </div>
                <div className="clause">
                  <strong>Oma Synergies Travels and Tours Ltd</strong>
                  <p>Block B8, 29/32 Utako Market Plaza, Abuja, Nigeria<br />Email: <a href="mailto:Omasynergiestravels@gmail.com">Omasynergiestravels@gmail.com</a><br />Phone: 0806 769 6464 · 0707 808 4746</p>
                </div>
                <div className="clause">
                  <strong>Updates to This Policy</strong>
                  <p>We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. The effective date at the top of this page will always reflect the most recent version. We encourage you to review this page periodically.</p>
                </div>
              </section>

              <div className="ack-box">
                <span className="eyebrow">Your Agreement</span>
                <p>
                  By using this website or submitting your information to us, you confirm that you have read and understood this Privacy Policy and consent to the collection and use of your data as described above. If you do not agree, please do not submit your information through our website.
                </p>
                <p style={{ marginTop: '12px' }}>
                  For questions about your visa application terms, see our{' '}
                  <Link to="/terms" style={{ color: 'var(--gold)' }}>Terms & Conditions</Link>.
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
