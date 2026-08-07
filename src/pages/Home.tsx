import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useScrollReveal, useStaggerReveal } from '../hooks/useScrollReveal';
import { useCountUp } from '../hooks/useCountUp';
import logoIcon from '../assets/logo-icon.png';
import canadaImg from '../assets/destinations/canada.jpg';
import usaImg from '../assets/destinations/usa.jpg';
import ukImg from '../assets/destinations/uk.jpg';
import irelandImg from '../assets/destinations/ireland.jpg';
import kcOverseasTeam from '../assets/kc-overseas-team.jpg';
import wwdTeamPhoto from '../assets/wwd-team.jpg';
import './Home.css';

const HEADLINE_WORDS = ['global education', 'visa success', 'seamless travel'];
const LEAD_TEXTS = [
  'From admission and visa processing to flights, tours, and accommodation Oma Synergies guides you end to end, with real-time tracking every step of the way.',
  'Admissions. Visas. Flights. Tours. Accommodation. One trusted partner tracked in real time from application to arrival.',
  'From admission to arrival, we guide every step, visas, flights, tours, accommodation, with real-time updates you can actually see, not just promises.',
];

const SERVICES_CORE = [
  { icon: '🎓', title: 'Global Admissions Processing', desc: 'Securing university and college admissions across top destinations in Europe, the Americas, Asia, and Oceania.', link: '/services/admissions' },
  { icon: '✍️', title: 'Professional Academic & Career Branding', desc: 'Expert drafting and review of SOPs, Letters of Intent, and CVs tailored to foreign university and visa standards.', link: '/services/branding' },
  { icon: '🛂', title: 'End-to-End Visa Application Support', desc: 'Comprehensive management of student visas and study permits, from document compilation to final submission.', link: '/services/visa' },
  { icon: '⚖️', title: 'Document Review & Profile Verification', desc: 'Rigorous evaluation of academic, financial, and legal documents to minimize errors and maximize approval rates.', link: '/services/document-review' },
  { icon: '💳', title: 'Study Loan Facilitation', desc: 'Connecting you with trusted global funding partners for education loans covering up to 65% of tuition and living expenses.', link: '/services/study-loan' },
];

const SERVICES_TRAVEL = [
  { icon: '✈️', title: 'Comprehensive Flight Bookings & Travel Logistics', desc: 'Itinerary planning, competitive flight bookings, visa-purpose reservations, and hotel or short-let accommodation for every traveler.', link: '/services/flights' },
  { icon: '🏠', title: 'Relocation & Destination Assistance', desc: 'Post-visa support to secure safe housing, prepare for departure, and settle smoothly into your new international community.', link: '/services/relocation' },
];

const DESTINATIONS = [
  { name: 'Canada', img: canadaImg, processing: '8–12 weeks', slug: 'canada' },
  { name: 'USA', img: usaImg, processing: '6–10 weeks', slug: 'usa' },
  { name: 'United Kingdom', img: ukImg, processing: '3–6 weeks', slug: 'uk' },
  { name: 'Ireland', img: irelandImg, processing: '4–8 weeks', slug: 'ireland' },
  { name: 'France', img: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=600&q=80', processing: '4–8 weeks', slug: 'france' },
  { name: 'Italy', img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80', processing: '4–8 weeks', slug: 'italy' },
  { name: 'Sweden', img: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=600&q=80', processing: '6–10 weeks', slug: 'sweden' },
  { name: 'Austria', img: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=600&q=80', processing: '6–10 weeks', slug: 'austria' },
  { name: 'South Korea', img: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600&q=80', processing: '6–10 weeks', slug: 'south-korea' },
  { name: 'Philippines', img: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=600&q=80', processing: '3–6 weeks', slug: 'philippines' },
  { name: 'China', img: 'https://images.unsplash.com/photo-1508804052814-cd3ba865a116?w=600&q=80', processing: '6–10 weeks', slug: 'china' },
  { name: 'New Zealand', img: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=600&q=80', processing: '4–6 weeks', slug: 'new-zealand' },
];

const TOURS = [
  { name: 'Cape Town Explorer', meta: '7 Days · From ₦850,000' },
  { name: 'Dubai Long Weekend', meta: '4 Days · From ₦620,000' },
  { name: 'London Highlights', meta: '6 Days · From ₦1,150,000' },
  { name: 'Istanbul Discovery', meta: '5 Days · From ₦730,000' },
];

const TESTIMONIALS = [
  { initials: 'E.A.', name: 'Egwu A.', meta: 'Study — University of West Scotland, UK', quote: 'The entire process was smooth and professionally handled. From my admission to my UK study visa approval, I received excellent guidance every step of the way. I highly recommend their services.' },
  { initials: 'S.', name: 'Stephen', meta: 'Tourist Visa — France', quote: 'My France tourist visa was processed quickly and efficiently. The team kept me informed throughout the application process, making everything stress-free.' },
  { initials: 'O.J.', name: 'Okechukwu J.', meta: 'Business Visa — China', quote: 'Excellent service from start to finish. They helped me secure my China business visa without unnecessary delays and ensured all my documents were properly prepared.' },
  { initials: 'E.I.', name: 'Emmanuel I.', meta: 'Study — Robert Gordon University, UK', quote: 'I appreciate the professionalism and attention to detail. Thanks to their support, I successfully obtained my UK study visa and can now pursue my education at Robert Gordon University.' },
  { initials: 'C.E.', name: 'Chimazuru E.', meta: 'Study — University Canada West, Canada', quote: "I'm grateful for the outstanding support throughout my Canadian study visa application. Their expertise made the entire journey simple and successful." },
  { initials: 'T.K.', name: 'Tochukwu K.', meta: 'Study — Ireland', quote: "The team was knowledgeable, responsive, and reliable. My Ireland study visa was approved, and I couldn't be happier with the service I received." },
  { initials: 'W.O.', name: 'Walter O.', meta: 'Tourist Visa — South Korea', quote: 'A seamless and professional experience. My South Korea tourist visa was approved without complications, and the communication throughout the process was excellent.' },
  { initials: 'G.N.', name: 'Goodluck N.', meta: 'Tourist Visa — Spain', quote: 'Thank you for making my Spain tourist visa application straightforward and stress-free. I truly appreciate your professionalism and dedication.' },
  { initials: 'G.A.', name: 'Gift A.', meta: 'Spousal Open Work Permit — Canada', quote: 'The guidance and support I received were exceptional. My Canada Spousal Open Work Permit was approved successfully, and I highly recommend this team to anyone seeking immigration assistance.' },
];

const WHY_US = [
  { title: 'Direct School Partnerships', desc: 'We work directly with top schools and international partners, giving your application real global credibility and access to better course options.' },
  { title: 'Guidance Built Just for You', desc: 'We study your unique background, career goals, and budget to give personal advice that fits your exact needs — never one-size-fits-all.' },
  { title: 'Expert Reviews to Avoid Mistakes', desc: 'Before any application is submitted, our team double-checks every detail to eliminate errors and keep approval rates high.' },
  { title: 'Travel Experts You Can Truly Trust', desc: 'Honest, well-trained guidance that helps you save money and make the right choices from day one.' },
  { title: 'Strong Documentation & Branding Help', desc: 'We arrange your files perfectly, and write SOPs and CVs that stand out to visa officers.' },
  { title: 'Stress-Free Visa & Flight Logistics', desc: 'From documents to flights and housing, we handle the heavy lifting — and with your client portal, you always know exactly what comes next.', featured: true },
  { title: 'Luxury Tours & Dream Vacations', desc: 'Beyond school runs, we plan luxury tour packages, honeymoons, solo getaways, and customized family vacations built around your comfort.' },
  { title: 'Up-to-Date Travel Rules', desc: 'Immigration laws and school intakes change fast — we stay on top of it so you never worry about outdated information.' },
];

const FAQS = [
  { q: "Can I apply for a Master's program with an HND?", a: "Yes. We work with partner universities that accept Higher National Diploma (HND) qualifications for direct Master's programs or pre-Master's pathway programs, depending on the country and course." },
  { q: 'How long does the entire study abroad process take?', a: "The timeline usually takes between 3 to 6 months. This depends heavily on how fast the school processes your admission, the specific country's visa processing times, and how quickly you provide your documents." },
  { q: 'Do you assist with study loans?', a: 'Yes. We partner with trusted global financial institutions to help eligible students secure educational loans that cover up to 65% of their tuition and living expenses.' },
  { q: 'What happens if my visa is refused?', a: 'If you have a past refusal, we perform a strict review of your previous application to find what went wrong. We then fix the gaps in your documentation, update your Statement of Purpose (SOP), and help you reapply with a much stronger file.' },
  { q: 'Do you offer payment plans for your services?', a: 'Yes. We offer flexible, structured payment plans to make our service fees manageable for you while we handle your school application, CV/SOP branding, and visa processing.' },
  { q: 'Do you handle flight bookings and hotel reservations?', a: 'Yes, absolutely. Beyond admissions and visas, we handle competitive flight bookings, flight reservations needed for visa presentation, and hotel or short-let accommodations to ensure you travel seamlessly.' },
];

export default function Home() {
  useScrollReveal();
  useStaggerReveal('.service-grid.stagger', '.service-card');
  const statsRef = useCountUp();

  const [headlineIdx, setHeadlineIdx] = useState(0);
  const [leadIdx, setLeadIdx] = useState(0);
  const [headlineVisible, setHeadlineVisible] = useState(true);
  const [leadVisible, setLeadVisible] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setHeadlineVisible(false);
      setTimeout(() => {
        setHeadlineIdx((i) => (i + 1) % HEADLINE_WORDS.length);
        setHeadlineVisible(true);
      }, 300);
    }, 2600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setLeadVisible(false);
      setTimeout(() => {
        setLeadIdx((i) => (i + 1) % LEAD_TEXTS.length);
        setLeadVisible(true);
      }, 400);
    }, 30000);
    return () => clearInterval(t);
  }, []);

  // Cursor parallax on hero orbit + scroll parallax on map layer
  useEffect(() => {
    const heroEl = document.querySelector('.hero');
    const orbitStage = document.querySelector<HTMLElement>('.orbit-stage');
    const mapLayer = document.querySelector<HTMLElement>('.hero-map-layer');
    if (!heroEl || !orbitStage) return;

    const onMouseMove = (e: Event) => {
      const me = e as MouseEvent;
      const rect = orbitStage.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (me.clientX - cx) / rect.width;
      const dy = (me.clientY - cy) / rect.height;
      orbitStage.style.transform = `translate(${dx * 14}px, ${dy * 14}px)`;
    };
    const onMouseLeave = () => {
      orbitStage.style.transform = 'translate(0,0)';
    };
    const onScroll = () => {
      if (mapLayer && window.scrollY < window.innerHeight) {
        mapLayer.style.transform = `translateY(${window.scrollY * 0.15}px)`;
      }
    };

    orbitStage.style.transition = 'transform .4s ease-out';
    heroEl.addEventListener('mousemove', onMouseMove);
    heroEl.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('scroll', onScroll);
    return () => {
      heroEl.removeEventListener('mousemove', onMouseMove);
      heroEl.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <>
      <Header />

      {/* HERO */}
      <section className="hero">
        <div className="hero-map-layer">
          <svg viewBox="0 0 1200 620" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" stroke="#F0B124" strokeWidth="1.4" strokeDasharray="1 7" strokeLinecap="round">
              <path className="flight-path" d="M300,310 Q410,150 520,119" opacity="0.55" />
              <path className="flight-path" d="M300,310 Q230,210 160,143" opacity="0.5" />
              <path className="flight-path" d="M300,310 Q460,260 660,262" opacity="0.5" />
              <path className="flight-path" d="M300,310 Q650,430 1000,500" opacity="0.45" />
            </g>
            <g fill="#F0B124">
              <circle cx="300" cy="310" r="4" opacity="0.9" />
              <circle cx="520" cy="119" r="3" opacity="0.7" />
              <circle cx="160" cy="143" r="3" opacity="0.7" />
              <circle cx="660" cy="262" r="3" opacity="0.7" />
              <circle cx="1000" cy="500" r="3" opacity="0.7" />
            </g>
            <g>
              <path d="M0 0 L 7 -2 L 10 -8 L 12 -8 L 11 -1 L 18 1 L 18 3 L 11 4 L 10 11 L 8 11 L 7 3 Z" fill="#F0B124" />
              <animateMotion dur="7s" repeatCount="indefinite" path="M300,310 Q410,150 520,119" rotate="auto" />
            </g>
          </svg>
        </div>
        <div className="wrap hero-grid">
          <div>
            <div className="hero-eyebrow">
              <span className="eyebrow" style={{ margin: 0 }}>Study · Visa · Travel · Tour — One Trusted Partner</span>
            </div>
            <h1>
              Your journey to{' '}
              <span className="cycle" style={{ opacity: headlineVisible ? 1 : 0 }}>
                {HEADLINE_WORDS[headlineIdx]}
              </span>{' '}
              starts here
            </h1>
            <p className="lead" style={{ opacity: leadVisible ? 1 : 0, transition: 'opacity .4s ease' }}>
              {LEAD_TEXTS[leadIdx]}
            </p>
            <div className="hero-actions">
              <Link to="/contact" className="btn btn-gold">Book a Consultation</Link>
              <Link to="/destinations" className="btn btn-outline">Explore Destinations</Link>
            </div>
            <div className="hero-mini-trust">
              <div className="mini-stat"><span className="n">2018</span><span className="l">Established</span></div>
              <div className="mini-stat"><span className="n">12</span><span className="l">Flagship Destinations</span></div>
              <div className="mini-stat"><span className="n">7</span><span className="l">Services, One Roof</span></div>
            </div>
          </div>
          <div className="orbit-stage">
            <div className="orbit-ring r1" />
            <div className="orbit-ring r2" />
            <div className="orbit-core"><img src={logoIcon} alt="Oma Synergies" /></div>
          </div>
        </div>
        <div className="hero-scroll-cue"><div className="scroll-line" />SCROLL</div>
      </section>

      {/* TRUST BOARD */}
      <div className="board-section" ref={statsRef}>
        <div className="wrap">
          <div className="board-label">Track Record</div>
          <div className="board-grid">
            <div className="board-item"><div className="flap"><span className="flap-val" data-target="1" data-suffix="K+">0</span></div><div className="cap">Happy Clients</div></div>
            <div className="board-item"><div className="flap"><span className="flap-val" data-target="97" data-suffix="%">0</span></div><div className="cap">Client Satisfaction</div></div>
            <div className="board-item"><div className="flap"><span className="flap-val" data-target="200" data-suffix="+">0</span></div><div className="cap">E-Visas</div></div>
            <div className="board-item"><div className="flap"><span className="flap-val" data-target="2" data-suffix="K+">0</span></div><div className="cap">Flights Booked</div></div>
            <div className="board-item"><div className="flap"><span className="flap-val" data-target="200" data-suffix="+">0</span></div><div className="cap">Hotels Booked</div></div>
          </div>
        </div>
      </div>

      {/* MEMBERSHIPS */}
      <div className="membership-strip">
        <div className="wrap">
          <div className="membership-label">Registered & Recognized By</div>
          <div className="membership-row">
            <div className="membership-badge"><span className="dot" />NANTA — National Association of Nigeria Travel Agencies</div>
            <div className="membership-badge"><span className="dot" />NCAA — Nigeria Civil Aviation Authority</div>
            <div className="membership-badge"><span className="dot" />ITPN — Institute for Tourism Professionals of Nigeria</div>
          </div>
        </div>
      </div>

      {/* WHAT WE DO */}
      <section id="what-we-do">
        <div className="wrap">
          <div className="wwd-head-grid">
            <div className="section-head reveal">
              <span className="eyebrow">What We Do</span>
              <h2>Everything your move abroad needs — under one roof</h2>
              <p>Study abroad and visa support are where we started, and where we're strongest. Travel services round out the journey once your plans are set.</p>
            </div>
            <div className="wwd-photo reveal">
              <img src={wwdTeamPhoto} alt="Student excited with passport and travel plans ready" />
              <div className="wwd-photo-badge">
                <div>
                  <div className="num">2018</div>
                  <div className="lbl">Guiding Journeys Since</div>
                </div>
              </div>
            </div>
          </div>

          <div className="cluster reveal">
            <div className="cluster-head">
              <h3>Study Abroad & Visa</h3>
              <span className="tag">Core Services</span>
            </div>
            <div className="service-grid stagger">
              {SERVICES_CORE.map((s) => (
                <Link to={s.link} className="service-card" key={s.title}>
                  <div className="service-icon">{s.icon}</div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                  <span className="learn">Learn More →</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="cluster reveal">
            <div className="cluster-head">
              <h3>Travel</h3>
              <span className="tag secondary">Supporting Services</span>
            </div>
            <div className="service-grid stagger">
              {SERVICES_TRAVEL.map((s) => (
                <Link to={s.link} className="service-card" key={s.title}>
                  <div className="service-icon">{s.icon}</div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                  <span className="learn">Learn More →</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="partners-section">
        <div className="wrap">
          <div className="partners-grid">
            <div className="reveal">
              <span className="eyebrow">Partners</span>
              <h2 style={{ fontSize: 26, marginTop: 12 }}>Trusted Global Partners</h2>
              <p style={{ color: 'var(--slate)', marginTop: 10, fontSize: 14.5, maxWidth: 420 }}>We work with recognized international partners to give your application stronger credibility and better outcomes.</p>
              <div className="partners-row" style={{ marginTop: 30, justifyContent: 'flex-start' }}>
                <span className="partner-name">ApplyBoard</span>
                <span className="partner-name">KC Overseas Education</span>
                <span className="partner-name">BorderPass</span>
              </div>
            </div>
            <div className="partners-photo reveal">
              <img src={kcOverseasTeam} alt="Our KC Overseas partner team" />
              <span className="partners-photo-caption">Our KC Overseas Education partner team</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <div className="timeline-wrap" id="how-it-works">
        <section>
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">How It Works</span>
              <h2 style={{ color: '#fff' }}>Our simple 4-step process</h2>
              <p style={{ color: 'var(--ink-muted)' }}>From your very first consultation to final approval, we provide continuous expert mentorship — with every stage visible in your client portal, not left to guesswork.</p>
            </div>
            <div className="timeline reveal">
              <div className="timeline-track" />
              <div className="timeline-progress" />
              <div className="timeline-steps">
                <div className="t-step"><div className="t-num">01</div><h4>Consultation & Profile Evaluation</h4><p>We assess your academic background, career goals, and budget, then match you with the best schools, courses, and countries for you.</p></div>
                <div className="t-step"><div className="t-num">02</div><h4>School Admission & Document Prep</h4><p>We handle your school applications and help you craft a strong SOP and professional CV to secure your admission letter.</p></div>
                <div className="t-step"><div className="t-num">03</div><h4>Visa Support & Study Loans</h4><p>We review your documents carefully, guide your visa application, and help you access study loans covering up to 65% of expenses.</p></div>
                <div className="t-step"><div className="t-num">04</div><h4>Flight Booking & Relocation</h4><p>Once your visa is approved, we handle flights and travel plans, and help you find safe accommodation to settle in easily.</p></div>
              </div>
            </div>

            <div className="portal-preview reveal">
              <div>
                <span className="eyebrow" style={{ marginBottom: 10, display: 'inline-block' }}>The Client Portal</span>
                <h4>See exactly where your case stands, anytime</h4>
                <p>No more "any update?" emails. Log in and watch your admission, visa, and loan status move forward in real time.</p>
                <Link to="/portal" className="btn btn-outline">Preview Client Login →</Link>
              </div>
              <div className="portal-mock">
                <div className="row"><span>Profile Evaluation</span><span className="status-done">✓ Done</span></div>
                <div className="row"><span>Admission & SOP</span><span className="status-done">✓ Done</span></div>
                <div className="row"><span>Visa Application</span><span className="status-active">● In Progress</span></div>
                <div className="row"><span>Flight & Relocation</span><span className="status-pending">Pending</span></div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* DESTINATIONS */}
      <section id="destinations">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Destinations</span>
            <h2>12 flagship destinations. Worldwide reach.</h2>
            <p>Full admissions and visa guidance across our premium destinations in the Americas, Europe, Asia and Oceania — with support available for students and travelers headed anywhere else too.</p>
          </div>
          <div className="dest-grid reveal">
            {DESTINATIONS.map((d) => (
              <Link to={`/destinations/${d.slug}`} className="dest-card" key={d.slug}>
                <img src={d.img} alt={d.name} />
                <div className="dest-overlay">
                  <h4>{d.name}</h4>
                  <div className="stat">Avg. processing: {d.processing} <span className="placeholder-note">Sample</span></div>
                </div>
              </Link>
            ))}
          </div>
          <div className="dest-cta reveal"><Link to="/destinations" className="btn btn-outline-dark">View All Destinations Worldwide →</Link></div>
        </div>
      </section>

      {/* TOURS */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head reveal" style={{ marginBottom: 36 }}>
            <span className="eyebrow">Tours & Travel</span>
            <h2 style={{ fontSize: 26 }}>Curated trips, when you're ready to explore</h2>
          </div>
          <div className="tours-strip reveal">
            {TOURS.map((t) => (
              <div className="tour-card" key={t.name}>
                <div className="tour-img"><span className="placeholder-badge">Sample Package</span></div>
                <div className="tour-body">
                  <h4>{t.name}</h4>
                  <div className="meta">{t.meta}</div>
                  <Link to="/contact" className="tour-book-btn">Book Now →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <div className="test-wrap" id="stories">
        <section>
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">Success Stories</span>
              <h2 style={{ color: '#fff' }}>Real clients. Real outcomes.</h2>
              <p style={{ color: 'var(--ink-muted)' }}>Shared with permission — photos withheld by client request.</p>
            </div>
            <div className="test-track reveal">
              {TESTIMONIALS.map((t) => (
                <div className="test-card" key={t.name}>
                  <div className="test-top">
                    <div className="initial-badge">{t.initials}</div>
                    <div><div className="test-name">{t.name}</div><div className="test-meta">{t.meta}</div></div>
                  </div>
                  <p className="test-quote">"{t.quote}"</p>
                </div>
              ))}
              <div className="video-slot">
                <div style={{ width: 44, height: 44, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</div>
                Video testimonial<br />coming soon
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* WHY CHOOSE US */}
      <section>
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Why Choose Us</span>
            <h2>Why Choose Oma Synergies Travels and Tours?</h2>
          </div>
          <div className="why-grid reveal">
            {WHY_US.map((w) => (
              <div className={w.featured ? 'why-item featured' : 'why-item'} key={w.title}>
                {w.featured && <span className="badge-new">What Sets Us Apart</span>}
                <h4>{w.title}</h4>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
          <div className="why-tagline reveal">
            <p className="line-1">Choose peace of mind. Choose smart travel. Choose Oma Synergies Travels and Tours Ltd.</p>
            <p className="line-2">When your travel is handled right, everything feels easier.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <div className="section-head reveal">
            <span className="eyebrow">FAQ</span>
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="reveal">
            {FAQS.map((f, i) => (
              <div className={openFaq === i ? 'faq-item open' : 'faq-item'} key={f.q}>
                <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  {f.q}
                  <div className="faq-icon" />
                </div>
                <div className="faq-a" style={{ maxHeight: openFaq === i ? 200 : 0 }}>
                  <p>{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="wrap">
          <span className="eyebrow reveal">Ready When You Are</span>
          <h2 className="reveal">Let's map out your path — together</h2>
          <p className="reveal">Book a free consultation and we'll walk you through exactly what your journey looks like.</p>
          <div className="final-actions reveal">
            <Link to="/contact" className="btn btn-gold">Book a Consultation</Link>
            <Link to="/contact" className="btn btn-outline">Send an Inquiry</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
