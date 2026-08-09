import { useState, type FormEvent } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import officePhoto from '../assets/office.jpg';
import { MailIcon, WhatsAppIcon, MapPinIcon, InstagramIcon, TikTokIcon, LinkedInIcon, XIcon } from '../components/Icons';
import './Contact.css';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    // NOTE: front-end only for now. Once the backend exists, this will POST to the inquiry API.
    setTimeout(() => {
      setSubmitted(true);
      setSending(false);
    }, 700);
  };

  return (
    <>
      <Header />

      <section className="page-hero">
        <div className="wrap-narrow">
          <span className="eyebrow">Get In Touch</span>
          <h1>Let's talk about your journey</h1>
          <p>Tell us what you need, admissions, visas, or travel, and our team will follow up personally.</p>
        </div>
      </section>

      <section>
        <div className="wrap-narrow contact-grid">
          <div className="form-card">
            {!submitted ? (
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <label htmlFor="fullName">Full Name</label>
                  <input type="text" id="fullName" required placeholder="Your full name" />
                </div>
                <div className="form-two">
                  <div className="form-row">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" required placeholder="you@example.com" />
                  </div>
                  <div className="form-row">
                    <label htmlFor="phone">Phone Number</label>
                    <input type="tel" id="phone" required placeholder="0800 000 0000" />
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="service">Service Interested In</label>
                  <select id="service" required defaultValue="">
                    <option value="" disabled>Select a service</option>
                    <option>Global Admissions Processing</option>
                    <option>Professional Academic & Career Branding</option>
                    <option>End-to-End Visa Application Support</option>
                    <option>Document Review & Profile Verification</option>
                    <option>Study Loan Facilitation</option>
                    <option>Comprehensive Flight Bookings & Travel Logistics</option>
                    <option>Relocation & Destination Assistance</option>
                    <option>Tours & Packages</option>
                    <option>Not sure yet, need guidance</option>
                  </select>
                </div>
                <div className="form-row">
                  <label htmlFor="destination">Destination (if applicable)</label>
                  <select id="destination" defaultValue="">
                    <option value="">Select a destination (optional)</option>
                    <option>Canada</option><option>USA</option><option>United Kingdom</option>
                    <option>Ireland</option><option>France</option><option>Italy</option>
                    <option>Sweden</option><option>Austria</option><option>South Korea</option>
                    <option>Philippines</option><option>China</option><option>New Zealand</option>
                    <option>Somewhere else</option>
                  </select>
                </div>
                <div className="form-row">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" required placeholder="Tell us a bit about what you need help with..." />
                </div>
                <button type="submit" className="btn btn-gold" disabled={sending} style={{ width: '100%', justifyContent: 'center' }}>
                  {sending ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            ) : (
              <div className="success-msg">
                <div className="icon">✓</div>
                <h3>Inquiry Received</h3>
                <p>Thank you, our team will reach out to you shortly at the contact details you provided.</p>
              </div>
            )}
          </div>

          <div className="info-col">
            <div className="info-card reach-card">
              <div className="reach-head">
                <h4>Reach Us Directly</h4>
                <p>Pick whatever's easiest for you, we're just as responsive on all of them.</p>
              </div>
              <a className="reach-row" href="mailto:Omasynergiestravels@gmail.com">
                <span className="reach-badge email"><MailIcon size={17} /></span>
                <div><div className="reach-label">Email</div><div className="reach-value">Omasynergiestravels@gmail.com</div></div>
                <span className="reach-arrow">→</span>
              </a>
              <a className="reach-row" href="https://wa.me/2348067696464" target="_blank" rel="noopener noreferrer">
                <span className="reach-badge whatsapp"><WhatsAppIcon size={17} /></span>
                <div><div className="reach-label">WhatsApp</div><div className="reach-value">0806 769 6464</div></div>
                <span className="reach-arrow">→</span>
              </a>
              <a className="reach-row" href="https://wa.me/2347078084746" target="_blank" rel="noopener noreferrer">
                <span className="reach-badge whatsapp"><WhatsAppIcon size={17} /></span>
                <div><div className="reach-label">WhatsApp</div><div className="reach-value">0707 808 4746</div></div>
                <span className="reach-arrow">→</span>
              </a>
              <a className="reach-row" href="https://www.google.com/maps?q=Block+B8,+29/32+Utako+Market+Plaza,+Abuja" target="_blank" rel="noopener noreferrer">
                <span className="reach-badge location"><MapPinIcon size={17} /></span>
                <div><div className="reach-label">Visit Our Office</div><div className="reach-value">Block B8, 29/32 Utako Market Plaza, Abuja</div></div>
                <span className="reach-arrow">→</span>
              </a>
            </div>

            <div className="office-photo-card">
              <img src={officePhoto} alt="Our Oma Synergies office in Abuja" />
              <span className="office-photo-caption">Visit us at our Abuja office</span>
            </div>

            <div className="info-card follow-card">
              <h4>Follow Us</h4>
              <div className="follow-grid">
                <a className="follow-item" href="https://www.instagram.com/omasynergiestravelsandtours" target="_blank" rel="noopener noreferrer">
                  <InstagramIcon size={18} /><span>Instagram</span>
                </a>
                <a className="follow-item" href="https://www.tiktok.com/@omasynergiestravel" target="_blank" rel="noopener noreferrer">
                  <TikTokIcon size={18} /><span>TikTok</span>
                </a>
                <a className="follow-item" href="https://www.linkedin.com/company/oma-synergies-travels-and-tours/" target="_blank" rel="noopener noreferrer">
                  <LinkedInIcon size={18} /><span>LinkedIn</span>
                </a>
                <a className="follow-item" href="https://x.com/OmaSynergies" target="_blank" rel="noopener noreferrer">
                  <XIcon size={18} /><span>X (Twitter)</span>
                </a>
              </div>
            </div>

            <div className="map-card">
              <iframe
                src="https://www.google.com/maps?q=Block+B8,+29/32+Utako+Market+Plaza,+Abuja&output=embed"
                width="100%"
                height="220"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Oma Synergies office location"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
