import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import officePhoto from '../assets/office.jpg';
import logoIcon from '../assets/logo-icon.png';
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

      <section className="wa-spotlight">
        <div className="wrap-narrow">
          <span className="eyebrow">The Fastest Way To Reach Us</span>
          <h2>Most people just WhatsApp us</h2>
          <div className="wa-panels">
            <a className="wa-panel" href="https://wa.me/2348067696464" target="_blank" rel="noopener noreferrer">
              <span className="wa-panel-icon"><WhatsAppIcon size={26} /></span>
              <div>
                <div className="wa-panel-label">Message Us</div>
                <div className="wa-panel-value">0806 769 6464</div>
              </div>
            </a>
            <a className="wa-panel" href="https://wa.me/2347078084746" target="_blank" rel="noopener noreferrer">
              <span className="wa-panel-icon"><WhatsAppIcon size={26} /></span>
              <div>
                <div className="wa-panel-label">Message Us</div>
                <div className="wa-panel-value">0707 808 4746</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      <section className="contact-content">
        <div className="wrap-narrow contact-grid">
          <div className="form-card">
            {!submitted ? (
              <>
                <div className="form-intro">
                  <span className="eyebrow">Or, Write It Out</span>
                  <p>Prefer to lay it all out in one go? Fill this in and we'll follow up personally.</p>
                </div>
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
              </>
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
                <h4>Other Ways To Reach Us</h4>
                <p>Prefer email, a visit, or to follow along? We're there too.</p>
              </div>
              <div className="reach-orbit">
                <div className="reach-orbit-center">
                  <span className="reach-orbit-ring r1" />
                  <span className="reach-orbit-ring r2" />
                  <Link to="/">
                    <img src={logoIcon} alt="Oma Synergies – go to home" />
                  </Link>
                </div>
                <a className="reach-orbit-point p-email" href="mailto:Omasynergiestravels@gmail.com">
                  <span className="reach-badge email"><MailIcon size={16} /></span>
                  <div><div className="reach-label">Email</div><div className="reach-value">Omasynergiestravels@gmail.com</div></div>
                </a>
                <a className="reach-orbit-point p-office" href="https://www.google.com/maps?q=Block+B8,+29/32+Utako+Market+Plaza,+Abuja" target="_blank" rel="noopener noreferrer">
                  <span className="reach-badge location"><MapPinIcon size={16} /></span>
                  <div><div className="reach-label">Visit Our Office</div><div className="reach-value">Block B8, 29/32 Utako Market Plaza, Abuja</div></div>
                </a>
                <div className="reach-orbit-point p-social">
                  <span className="reach-badge social"><InstagramIcon size={16} /></span>
                  <div className="reach-social-links">
                    <div className="reach-label">Follow Us</div>
                    <div className="reach-social-row">
                      <a href="https://www.instagram.com/omasynergiestravelsandtours" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon size={16} /></a>
                      <a href="https://www.tiktok.com/@omasynergiestravel" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><TikTokIcon size={16} /></a>
                      <a href="https://www.linkedin.com/company/oma-synergies-travels-and-tours/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><LinkedInIcon size={16} /></a>
                      <a href="https://x.com/OmaSynergies" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"><XIcon size={16} /></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="office-photo-card">
              <img src={officePhoto} alt="Our Oma Synergies office in Abuja" loading="lazy" />
              <span className="office-photo-caption">Visit us at our Abuja office</span>
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
