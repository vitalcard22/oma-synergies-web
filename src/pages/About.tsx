import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { GlobeIcon, PlaneIcon, GraduationCapIcon } from '../components/Icons';
import adaezePhoto from '../assets/team/adaeze.jpg';
import increasePhoto from '../assets/team/increase.jpg';
import nnennaPhoto from '../assets/team/nnenna.jpg';
import joshuaPhoto from '../assets/team/joshua.jpg';
import whoWeAreTeam from '../assets/who-we-are-team.jpg';
import applyBoardLogo from '../assets/partners/applyboard.png';
import kcOverseasLogo from '../assets/partners/kc-overseas.png';
import borderPassLogo from '../assets/partners/borderpass.png';
import passageLogo from '../assets/partners/passage.png';
import './About.css';

const PARTNERS = [
  { name: 'ApplyBoard', logo: applyBoardLogo },
  { name: 'KC Overseas Education', logo: kcOverseasLogo },
  { name: 'BorderPass', logo: borderPassLogo },
  { name: 'Passage', logo: passageLogo },
];

const TEAM = [
  { photo: adaezePhoto, name: 'Adaeze Ohazuruike', role: 'Founder & CEO', credential: { title: 'Certified UK Knowledge Agent & Counsellor', sub: 'British Council, via ApplyBoard, valid until 05/2028' } },
  { photo: increasePhoto, name: 'Increase Uchechukwu', role: 'Writer, SOP & CV Specialist' },
  { photo: nnennaPhoto, name: 'Ugwuoke Nnenna Juliet', role: 'Strategy and Operations Lead' },
  { photo: joshuaPhoto, name: 'Awoniyi Joshua Ayodeji', role: 'Research Assistant' },
];

const STORY = [
  { year: '2018', title: 'Our Foundation', text: 'We began our mission by empowering Nigerian students with expert career counseling, helping them identify the right academic paths to unlock their potential.' },
  { year: '2024', title: 'Expanding Globally', text: 'We took a bold leap forward, transitioning into an international consultancy dedicated to helping students navigate the complexities of studying, living, and working abroad.' },
  { year: '2026', title: 'Our Present Mission', text: 'Today, we serve as a comprehensive bridge to the world, providing end-to-end support for those ready to build a successful international career and a new life abroad.' },
];

export default function About() {
  useScrollReveal();

  return (
    <>
      <Header />

      <section className="about-hero">
        <div className="wrap about-hero-inner">
          <span className="eyebrow">About Us</span>
          <h1>Your trusted bridge to global opportunities</h1>
          <p>
            Oma Synergies Travels and Tours Ltd is committed to guiding students and travelers toward their global goals,
            from the classroom to the departure gate. Our experienced team combines deep expertise in international
            admissions, visa processing, and immigration support with a genuine passion for travel, giving every client
            personalized attention from first consultation to final approval.
          </p>
        </div>
      </section>

      <section className="who-section">
        <div className="wrap who-grid">
          <div className="who-copy reveal">
            <span className="eyebrow">Who We Are</span>
            <h2 style={{ margin: '14px 0 22px' }}>Guiding you from admission to arrival</h2>
            <p>
              We offer end-to-end support for admission processing, SOP and CV development, visa applications, legal
              document review, and study loan guidance, helping students navigate the path to studying abroad with
              clarity and confidence.
            </p>
            <p>
              Alongside this, we provide a full range of travel services, including domestic and international tour
              packages, customized itineraries, flight and hotel bookings, accommodation guidance, and corporate travel
              solutions.
            </p>
            <p>
              Whatever stage of the journey you're on, applying, relocating, or simply planning your next trip, Oma
              Synergies is the trusted partner guiding you every step of the way.
            </p>
          </div>
          <div className="who-photo reveal">
            <img src={whoWeAreTeam} alt="The Oma Synergies team at our Abuja office" loading="lazy" />
          </div>
        </div>
      </section>

      <div className="vm-wrap">
        <section className="vm-section">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">What Drives Us</span>
              <h2 style={{ color: '#fff' }}>Vision & Mission</h2>
            </div>
            <div className="vm-grid reveal">
              <div className="vm-card">
                <div className="vm-icon"><GlobeIcon size={22} /></div>
                <h3>Vision</h3>
                <p>To be the trusted bridge connecting people to global opportunities through seamless travel and study experiences.</p>
              </div>
              <div className="vm-card">
                <div className="vm-icon"><PlaneIcon size={22} /></div>
                <h3>Mission</h3>
                <p>To simplify travel and international transitions by providing reliable guidance, personalized support, and efficient solutions, helping our clients move, study, and explore the world with confidence.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="story-section">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Our Story</span>
            <h2>From career counseling to a global bridge</h2>
          </div>
          <div className="story-track reveal">
            {STORY.map((s) => (
              <div className="story-item" key={s.year}>
                <div className="story-dot" />
                <div className="story-year">{s.year}</div>
                <h4>{s.title}</h4>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="team-wrap">
        <section className="team-section">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">Our Team</span>
              <h2>Certified expertise you can verify</h2>
              <p>Real credentials you can verify yourself.</p>
            </div>
            <div className="team-grid reveal">
              {TEAM.map((m) => (
                <div className="team-card" key={m.name}>
                  <div className="team-avatar"><img src={m.photo} alt={m.name} loading="lazy" /></div>
                  <h4>{m.name}</h4>
                  <div className="team-role">{m.role}</div>
                  {m.credential && (
                    <div className="cred-badge">
                      <span className="cb-icon"><GraduationCapIcon size={16} /></span>
                      <div>
                        <div className="cb-title">{m.credential.title}</div>
                        <div className="cb-sub">{m.credential.sub}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="creds-wrap">
        <div className="wrap">
          <div className="creds-block">
            <div className="creds-label">Registered & Recognized By</div>
            <div className="creds-row">
              <div className="membership-badge"><span className="dot" />NANTA: National Association of Nigeria Travel Agencies</div>
              <div className="membership-badge"><span className="dot" />NCAA: Nigeria Civil Aviation Authority</div>
              <div className="membership-badge"><span className="dot" />ITPN: Institute for Tourism Professionals of Nigeria</div>
            </div>
          </div>
          <div className="creds-block">
            <div className="creds-label">Trusted Global Partners</div>
            <div className="partners-scroll-wrap">
              <div
                className="creds-row partners-row"
                onTouchStart={(e) => e.currentTarget.classList.add('is-paused')}
                onTouchEnd={(e) => e.currentTarget.classList.remove('is-paused')}
                onTouchCancel={(e) => e.currentTarget.classList.remove('is-paused')}
              >
                {PARTNERS.map((p) => (
                  <div className="partner-logo-card" key={p.name}>
                    <img src={p.logo} alt={p.name} loading="lazy" />
                  </div>
                ))}
                {PARTNERS.map((p) => (
                  <div className="partner-logo-card partner-logo-card-dup" key={`dup-${p.name}`} aria-hidden="true">
                    <img src={p.logo} alt="" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="about-cta">
        <div className="wrap">
          <span className="eyebrow reveal">Let's Talk</span>
          <h2 className="reveal">You've read our story. Let's start yours.</h2>
          <p className="reveal">One conversation is all it takes to find out where you stand.</p>
          <div className="about-cta-actions reveal">
            <Link to="/contact" className="btn btn-gold">Book a Consultation</Link>
            <Link to="/" className="btn btn-outline">Back to Home</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
