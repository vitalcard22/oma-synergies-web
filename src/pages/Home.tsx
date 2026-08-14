import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FlightBg from '../components/FlightBg';
import ServiceIcon from '../components/ServiceIcon';
import { useScrollReveal, useStaggerReveal } from '../hooks/useScrollReveal';
import { useCountUp } from '../hooks/useCountUp';
import logoIcon from '../assets/logo-icon.png';
import { DESTINATIONS } from '../data/destinations';
import { TESTIMONIALS } from '../data/testimonials';
import kcOverseasTeam from '../assets/kc-overseas-team.jpg';
import wwdTeamPhoto from '../assets/wwd-team.jpg';
import wwdStaffDesk from '../assets/wwd-staff-desk.jpg';
import wwdFamilyCart from '../assets/wwd-family-cart.jpg';
import wwdCheckinHandoff from '../assets/wwd-checkin-handoff.jpg';
import PhotoCrossfade from '../components/PhotoCrossfade';
import PageTurnCard from '../components/PageTurnCard';
import HeroPhotoBackdrop from '../components/HeroPhotoBackdrop';
import OrbitDestinations from '../components/OrbitDestinations';
import nantaLogo from '../assets/accreditations/nanta.png';
import ncaaLogo from '../assets/accreditations/ncaa.png';
import itpnLogo from '../assets/accreditations/itpn.png';
import visaPassportPhoto from '../assets/visa-passport.jpg';
import './Home.css';

const HEADLINE_WORDS = ['journey to world-class education', 'visa journey', 'journey to new destinations', 'journey to explore the world'];


const SERVICE_WORDS = ['Study', 'Visa', 'Travel', 'Tour'];

const ACCREDITATIONS = [
  { code: 'NANTA', logo: nantaLogo },
  { code: 'NCAA', logo: ncaaLogo },
  { code: 'ITPN', logo: itpnLogo },
];
const LEAD_TEXTS = [
  'From admission and visa processing to flights, tours, and accommodation Oma Synergies guides you end to end, with real-time tracking every step of the way.',
  'Admissions. Visas. Flights. Tours. Accommodation. One trusted partner tracked in real time from application to arrival.',
  'From admission to arrival, we guide every step, visas, flights, tours, accommodation, with real-time updates you can log in and see for yourself.',
];

// Mobile shows the shortest of the three variants, static rather than rotating.
// The longer versions run past five wrapped lines on a phone, and rotating a
// paragraph that long makes it hard to finish reading. This keeps all six
// things the originals communicate: admissions, visas, flights, tours,
// accommodation, and real-time tracking.
const LEAD_MOBILE = 'Admissions. Visas. Flights. Tours. Accommodation. One trusted partner tracked in real time from application to arrival.';

const SERVICES_CORE = [
  { icon: 'graduation' as const, title: 'Global Admissions Processing', desc: 'We manage your entire university and college admission process across premium global destinations, including: Americas & Europe: Canada, USA, UK, Ireland, France, Italy, Sweden, and Austria. Asia & Oceania: South Korea, Philippines, China, and New Zealand.', link: '/services/admissions' },
  { icon: 'passport' as const, title: 'Strategic Visa Application Support', desc: 'We provide end-to-end guidance for study permit and student visa applications. Our team oversees everything from initial file compilation to final submission, ensuring full compliance with immigration requirements.', link: '/services/visa' },
  { icon: 'scale' as const, title: 'Legal Document Review & Verification', desc: 'To maximize your approval success rate, our experts conduct rigorous reviews of all financial, academic, and legal documents to eliminate errors and strengthen your application profile.', link: '/services/document-review' },
  { icon: 'card' as const, title: 'Educational Financing & Study Loan Support', desc: 'Through our trusted global funding partners, we facilitate access to study loans covering up to 65% of your tuition and living expenses, easing the financial burden of relocation.', link: '/services/study-loan' },
  { icon: 'compass' as const, title: 'Comprehensive End-to-End Guidance', desc: 'From your very first consultation and school selection to the final visa approval, we provide continuous expert mentorship at every stage of your international education journey.', link: '/services' },
];

const SERVICES_TRAVEL = [
  { icon: 'home' as const, title: 'Relocation & Accommodation Assistance', desc: 'Our services extend beyond visa approvals. We assist students in securing safe, comfortable housing and offer essential guidance to help them settle smoothly into their new host countries.', link: '/services/relocation' },
];

const TOURS = [
  { name: 'Cape Town Explorer', meta: '7 Days · From ₦850,000' },
  { name: 'Dubai Long Weekend', meta: '4 Days · From ₦620,000' },
  { name: 'London Highlights', meta: '6 Days · From ₦1,150,000' },
  { name: 'Istanbul Discovery', meta: '5 Days · From ₦730,000' },
];


const WHY_US = [
  { title: 'Direct School Partnerships', desc: 'We work directly with top schools and international partners, giving your application real global credibility and access to better course options.' },
  { title: 'Guidance Built Just for You', desc: 'We study your unique background, career goals, and budget to give personal advice that fits your exact needs, never one-size-fits-all.' },
  { title: 'Expert Reviews to Avoid Mistakes', desc: 'Before any application is submitted, our team double-checks every detail to eliminate errors and keep approval rates high.' },
  { title: 'Travel Experts You Can Truly Trust', desc: 'Honest, well-trained guidance that helps you save money and make the right choices from day one.' },
  { title: 'Strong Documentation & Branding Help', desc: 'We arrange your files perfectly, and write SOPs and CVs that stand out to visa officers.' },
  { title: 'Stress-Free Visa & Flight Logistics', desc: 'From documents to flights and housing, we handle the heavy lifting, and with your client portal, you always know exactly what comes next.', featured: true },
  { title: 'Luxury Tours & Dream Vacations', desc: 'Beyond school runs, we plan luxury tour packages, honeymoons, solo getaways, and customized family vacations built around your comfort.' },
  { title: 'Up-to-Date Travel Rules', desc: 'Immigration laws and school intakes change fast. We stay on top of it so you never worry about outdated information.' },
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
  const heroStatsRef = useCountUp();

  const [headlineIdx, setHeadlineIdx] = useState(0);
  const [leadIdx, setLeadIdx] = useState(0);
  const [headlineVisible, setHeadlineVisible] = useState(true);
  const [leadVisible, setLeadVisible] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [orbitPulse, setOrbitPulse] = useState(false);
  const [serviceIdx, setServiceIdx] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Cycles the service word inside the mobile badge (Study -> Visa -> Travel -> Tour).
  // Mobile-only and motion-safe: desktop shows the full static list, and anyone
  // with reduced-motion enabled sees "Study" held steady rather than cycling.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mq = window.matchMedia('(max-width: 900px)');
    if (reduced.matches || !mq.matches) return;

    const t = setInterval(() => {
      setServiceIdx((i) => (i + 1) % SERVICE_WORDS.length);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const scrollToNext = () => {
    const board = document.querySelector('#what-we-do') || document.querySelector('.board-section');
    board?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const pulseOrbit = () => {
    setOrbitPulse(true);
    setTimeout(() => setOrbitPulse(false), 900);
  };

  useEffect(() => {
    const t = setInterval(() => {
      setHeadlineVisible(false);
      setTimeout(() => {
        setHeadlineIdx((i) => (i + 1) % HEADLINE_WORDS.length);
        setHeadlineVisible(true);
      }, 300);
    }, 4200);
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
        <HeroPhotoBackdrop image={wwdCheckinHandoff} />
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
        <div className="hero-map-layer-mobile">
          <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" stroke="#F0B124" strokeWidth="1.4" strokeDasharray="1 7" strokeLinecap="round">
              <path className="flight-path" d="M300,180 Q220,80 140,40" opacity="0.55" />
              <path className="flight-path" d="M300,180 Q340,60 380,20" opacity="0.5" />
              <path className="flight-path" d="M300,180 Q220,280 130,355" opacity="0.5" />
              <path className="flight-path" d="M300,180 Q370,220 390,300" opacity="0.45" />
            </g>
            <g fill="#F0B124">
              <circle cx="300" cy="180" r="4" opacity="0.9" />
              <circle cx="140" cy="40" r="3" opacity="0.7" />
              <circle cx="380" cy="20" r="3" opacity="0.7" />
              <circle cx="130" cy="355" r="3" opacity="0.7" />
              <circle cx="390" cy="300" r="3" opacity="0.7" />
            </g>
            <g>
              <path d="M0 0 L 7 -2 L 10 -8 L 12 -8 L 11 -1 L 18 1 L 18 3 L 11 4 L 10 11 L 8 11 L 7 3 Z" fill="#F0B124" />
              <animateMotion dur="7s" repeatCount="indefinite" path="M300,180 Q220,80 140,40" rotate="auto" />
            </g>
          </svg>
        </div>
        <div className={heroLoaded ? 'wrap hero-grid hero-in' : 'wrap hero-grid'}>
          <div className="hero-eyebrow-mobile hero-rise" style={{ transitionDelay: '80ms' }}>
            <div className="svc-block">
              <span className="svc-row">
                {SERVICE_WORDS.map((word, i) => (
                  <span key={word} className={i === serviceIdx ? 'svc-item active' : 'svc-item'}>
                    {word}
                  </span>
                ))}
              </span>
              <span className="svc-anchor">handled by one partner</span>
            </div>
          </div>
          <div className="hero-content">
            <div className="hero-eyebrow hero-rise" style={{ transitionDelay: '80ms' }}>
              <span className="eyebrow" style={{ margin: 0 }}>Study · Visa · Travel · Tour · One Trusted Partner</span>
            </div>
            <h1 className="hero-rise" style={{ transitionDelay: '340ms' }}>
              {/* Invisible sizers: one per phrase, all stacked in the same grid
                  cell. The h1 sizes to whichever actually wraps tallest, which
                  isn't necessarily the longest by character count. */}
              {HEADLINE_WORDS.map((phrase) => (
                <span className="h1-sizer" aria-hidden="true" key={phrase}>
                  Your {phrase} starts here.
                </span>
              ))}
              <span className="h1-live">
                Your{' '}
                <span className="cycle" style={{ opacity: headlineVisible ? 1 : 0 }}>
                  {HEADLINE_WORDS[headlineIdx]}
                </span>{' '}
                starts here.
              </span>
            </h1>
            <p className="lead hero-rise" style={{ transitionDelay: '440ms' }}>
              <span className="lead-sizers" aria-hidden="true">
                {LEAD_TEXTS.map((t) => (
                  <span className="lead-sizer" key={t}>{t}</span>
                ))}
              </span>
              <span className="lead-full" style={{ opacity: leadVisible ? 1 : 0 }}>
                {LEAD_TEXTS[leadIdx]}
              </span>
              <span className="lead-short">{LEAD_MOBILE}</span>
            </p>
            <div className="hero-actions hero-rise" style={{ transitionDelay: '540ms' }}>
              <Link to="/contact" className="btn btn-gold">Book a Consultation</Link>
              <Link to="/destinations" className="btn btn-outline">Explore Destinations</Link>
            </div>
            <div className="hero-mini-trust hero-rise" style={{ transitionDelay: '640ms' }} ref={heroStatsRef}>
              <div className="mini-stat"><span className="n">2018</span><span className="l">Established</span></div>
              <div className="mini-stat"><span className="n flap-val" data-target="1" data-suffix="K+">0</span><span className="l">Clients</span></div>
              <div className="mini-stat"><span className="n flap-val" data-target="97" data-suffix="%">0</span><span className="l">Satisfied</span></div>
              <div className="mini-stat"><span className="n flap-val" data-target="200" data-suffix="+">0</span><span className="l">E-Visas</span></div>
              <div className="mini-stat"><span className="n flap-val" data-target="2" data-suffix="K+">0</span><span className="l">Flights</span></div>
              <div className="mini-stat"><span className="n flap-val" data-target="200" data-suffix="+">0</span><span className="l">Hotels</span></div>
            </div>
          </div>
          <div
            className={orbitPulse ? 'orbit-stage hero-rise pulsing' : 'orbit-stage hero-rise'}
            style={{ transitionDelay: '200ms' }}
            onClick={pulseOrbit}
            role="presentation"
          >
            <div className="orbit-ring r1" />
            <div className="orbit-ring r2" />
            <OrbitDestinations />
            <div className="orbit-core"><img src={logoIcon} alt="Oma Synergies" loading="eager" /></div>
          </div>
        </div>
        <button className={heroLoaded ? 'hero-scroll-cue hero-rise hero-rise-in' : 'hero-scroll-cue hero-rise'} style={{ transitionDelay: '740ms' }} onClick={scrollToNext} aria-label="Scroll to next section">
          <div className="scroll-line" />SCROLL
        </button>
      </section>

      {/* TRUST BOARD */}
      <div className="board-section" ref={statsRef}>
        <div className="wrap">
          <div className="board-label">Track Record</div>
          <div className="board-grid">
            <div className="board-item"><div className="flap"><span className="flap-val" data-target="1" data-suffix="K+">0</span></div><div className="cap">Happy Clients</div></div>
            <div className="board-item"><div className="flap"><span className="flap-val" data-target="97" data-suffix="%">0</span></div><div className="cap"><span className="cap-full">Client Satisfaction</span><span className="cap-short">Satisfaction</span></div></div>
            <div className="board-item"><div className="flap"><span className="flap-val" data-target="200" data-suffix="+">0</span></div><div className="cap">E-Visas</div></div>
            <div className="board-item"><div className="flap"><span className="flap-val" data-target="2" data-suffix="K+">0</span></div><div className="cap"><span className="cap-full">Flights Booked</span><span className="cap-short">Flights</span></div></div>
            <div className="board-item"><div className="flap"><span className="flap-val" data-target="200" data-suffix="+">0</span></div><div className="cap"><span className="cap-full">Hotels Booked</span><span className="cap-short">Hotels</span></div></div>
          </div>
        </div>
      </div>

      {/* MEMBERSHIPS */}
      <div className="membership-strip">
        <div className="wrap">
          <div className="membership-label">Registered & Recognized By</div>
          <div className="membership-row">
            <div className="membership-badge"><span className="dot" />NANTA: National Association of Nigeria Travel Agencies</div>
            <div className="membership-badge"><span className="dot" />NCAA: Nigeria Civil Aviation Authority</div>
            <div className="membership-badge"><span className="dot" />ITPN: Institute for Tourism Professionals of Nigeria</div>
          </div>
          <div className="accred-row">
            {ACCREDITATIONS.map((a) => (
              <div className="accred-item" key={a.code}>
                <div className="accred-tile">
                  <img src={a.logo} alt={`${a.code} logo`} loading="lazy" />
                </div>
                <span className="accred-code">{a.code}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WHAT WE DO */}
      <section id="what-we-do">
        <div className="wrap">
          <div className="wwd-head-grid">
            <PageTurnCard />
            <div className="wwd-photo reveal">
              <PhotoCrossfade
                images={[wwdTeamPhoto, wwdStaffDesk, wwdFamilyCart, wwdCheckinHandoff]}
                alts={[
                  'Student excited with passport and travel plans ready',
                  'Oma Synergies staff member assisting a client',
                  'Family traveling together with luggage at the airport',
                  'Client handing over passport at the airline check-in counter',
                ]}
              />
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
              <span className="tag">Study &amp; Visa</span>
            </div>
            <div className="service-grid stagger">
              {SERVICES_CORE.map((s) => (
                <Link to={s.link} className="service-card" key={s.title}>
                  <div className="service-icon"><ServiceIcon icon={s.icon} /></div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                  <span className="learn">Learn More →</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="cluster reveal">
            <div className="cluster-head">
              <h3>Travel &amp; Tour</h3>
              <span className="tag">Travel &amp; Tour</span>
            </div>
            <div className="service-grid stagger">
              {SERVICES_TRAVEL.map((s) => (
                <Link to={s.link} className="service-card" key={s.title}>
                  <div className="service-icon"><ServiceIcon icon={s.icon} /></div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                  <span className="learn">Learn More →</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <div className="timeline-wrap" id="how-it-works">
        <FlightBg />
        <section>
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">How It Works</span>
              <h2 style={{ color: '#fff' }}>Our simple 4-step process</h2>
              <p style={{ color: 'var(--ink-muted)' }}>From your very first consultation to final approval, we provide continuous expert mentorship, with every stage visible in your client portal, not left to guesswork.</p>
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

            <div className="visa-photo-strip reveal">
              <div className="visa-photo-text">
                <span className="eyebrow">The Payoff</span>
                <p>From application to approval: real visas, real stamps.</p>
              </div>
              <div className="visa-photo-frame">
                <img src={visaPassportPhoto} alt="Visa application and approved passport stamps" loading="lazy" />
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
              <img src={kcOverseasTeam} alt="Our KC Overseas partner team" loading="lazy" />
              <span className="partners-photo-caption">Our KC Overseas Education partner team</span>
            </div>
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section id="destinations">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Destinations</span>
            <h2>12 flagship destinations. Worldwide reach.</h2>
            <p>Full admissions and visa guidance across our premium destinations in the Americas, Europe, Asia and Oceania, with support available for students and travelers headed anywhere else too.</p>
          </div>
          <div className="dest-grid reveal">
            {DESTINATIONS.map((d) => (
              <Link to={`/destinations/${d.slug}`} className="dest-card" key={d.slug}>
                <img src={d.img} alt={d.name} loading="lazy" />
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
        <FlightBg />
        <section>
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">Success Stories</span>
              <h2 style={{ color: '#fff' }}>Real clients. Real outcomes.</h2>
              <p style={{ color: 'var(--ink-muted)' }}>Shared with permission. Photos withheld by client request.</p>
            </div>
            <div className="test-track reveal">
              {TESTIMONIALS.map((t) => (
                <div className="test-card" key={t.name}>
                  <div className="test-top">
                    <div className="initial-badge">{t.initials}</div>
                    <div><div className="test-name">{t.name}</div><div className="test-meta">{t.serviceTag}: {t.meta}</div></div>
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
      <section className="why-choose-section">
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
          <span className="eyebrow reveal">One Trusted Partner</span>
          <h2 className="reveal">Let's map out your path, together</h2>
          <p className="reveal">Tell us where you're headed, study, visa, or travel, and we'll take it from there.</p>
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
