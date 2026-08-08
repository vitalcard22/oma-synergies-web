import { useState, type FormEvent } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import officePhoto from '../assets/office.jpg';
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
        <div className="wrap">
          <span className="eyebrow">Get In Touch</span>
          <h1>Let's talk about your journey</h1>
          <p>Whether it's admissions, visas, or travel — tell us what you need, and our team will follow up personally.</p>
        </div>
      </section>

      <section>
        <div className="wrap contact-grid">
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
                    <option>Not sure — need guidance</option>
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
                <button type="submit" className="btn btn-gold" disabled={sending}>
                  {sending ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            ) : (
              <div className="success-msg">
                <div className="icon">✓</div>
                <h3>Inquiry Received</h3>
                <p>Thank you — our team will reach out to you shortly at the contact details you provided.</p>
              </div>
            )}
          </div>

          <div className="info-col">
            <div className="info-card reach-card">
              <div className="reach-head">
                <h4>Reach Us Directly</h4>
                <p>Pick whatever's easiest — we're just as responsive on all of them.</p>
              </div>
              <a className="reach-row" href="mailto:Omasynergiestravels@gmail.com">
                <span className="reach-badge email">✉</span>
                <div><div className="reach-label">Email</div><div className="reach-value">Omasynergiestravels@gmail.com</div></div>
                <span className="reach-arrow">→</span>
              </a>
              <a className="reach-row" href="tel:+2348067696464">
                <span className="reach-badge phone">☎</span>
                <div><div className="reach-label">Call or WhatsApp</div><div className="reach-value">0806 769 6464</div></div>
                <span className="reach-arrow">→</span>
              </a>
              <a className="reach-row" href="tel:+2347078084746">
                <span className="reach-badge phone">☎</span>
                <div><div className="reach-label">Call or WhatsApp</div><div className="reach-value">0707 808 4746</div></div>
                <span className="reach-arrow">→</span>
              </a>
              <a className="reach-row" href="https://www.google.com/maps?q=Block+B8,+29/32+Utako+Market+Plaza,+Abuja" target="_blank" rel="noopener noreferrer">
                <span className="reach-badge location">📍</span>
                <div><div className="reach-label">Visit Our Office</div><div className="reach-value">Block B8, 29/32 Utako Market Plaza, Abuja</div></div>
                <span className="reach-arrow">→</span>
              </a>
            </div>

            <div className="office-photo-card">
              <img src={officePhoto} alt="Our Oma Synergies office in Abuja" />
              <span className="office-photo-caption">Visit us at our Abuja office</span>
            </div>

            <div className="info-card">
              <h4>Follow Us</h4>
              <div className="info-row"><a href="https://www.instagram.com/omasynergiestravelsandtours" target="_blank" rel="noopener noreferrer">Instagram</a></div>
              <div className="info-row"><a href="https://www.tiktok.com/@omasynergiestravel" target="_blank" rel="noopener noreferrer">TikTok</a></div>
              <div className="info-row"><a href="https://www.linkedin.com/company/oma-synergies-travels-and-tours/" target="_blank" rel="noopener noreferrer">LinkedIn</a></div>
              <div className="info-row"><a href="https://x.com/OmaSynergies" target="_blank" rel="noopener noreferrer">X (Twitter)</a></div>
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
