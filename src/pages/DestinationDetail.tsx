import { useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getDestinationBySlug } from '../data/destinations';
import './DestinationDetail.css';

export default function DestinationDetail() {
  const { slug } = useParams();
  const destination = getDestinationBySlug(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!destination) {
    return <Navigate to="/destinations" replace />;
  }

  const d = destination;

  return (
    <>
      <Header />

      <div className="hero-photo-tag">Sample Photo</div>
      <section className="dest-hero">
        <img src={d.img} alt={d.name} loading="eager" />
        <div className="wrap-narrow dest-hero-inner">
          <span className="eyebrow">{d.region}</span>
          <h1>Study & Travel to {d.name}</h1>
        </div>
      </section>

      <div className="stat-strip">
        <div className="wrap-narrow stat-row">
          <div className="stat-item"><div className="n">{d.processing}</div><div className="l">Avg. Visa Processing<span className="placeholder-note">Sample</span></div></div>
          <div className="stat-item"><div className="n">{d.region}</div><div className="l">Region</div></div>
          <div className="stat-item"><div className="n">7</div><div className="l">Services Available Here</div></div>
        </div>
      </div>

      <section>
        <div className="wrap-narrow two-col">
          <div>
            <h2>Why {d.name}</h2>
            <p>{d.why}</p>
            <h2 style={{ marginTop: 36 }}>Popular Programs</h2>
            <div className="program-list">
              {d.programs.map((p) => (
                <span className="program-chip" key={p}>{p}</span>
              ))}
            </div>
            <p style={{ marginTop: 10 }}><span className="placeholder-note">Sample list, actual programs depend on partner schools</span></p>
          </div>
          <div className="side-card">
            <h4>Visa Overview</h4>
            <p>{d.visaNote} This is a general overview, not legal advice. Your consultation will cover the exact requirements for your situation.</p>
            <h4>What's Included</h4>
            <p>Admissions guidance, SOP/CV support, visa application support, document review, and, where applicable, study loan facilitation, all handled for your {d.name} application.</p>
            <Link to="/contact" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>Start Your {d.name} Application</Link>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="wrap-narrow">
          <span className="eyebrow">Ready to Start?</span>
          <h2>Let's map your path to {d.name}</h2>
          <p>Book a free consultation and we'll walk you through exactly what's needed.</p>
          <div className="final-actions">
            <Link to="/contact" className="btn btn-gold">Book a Consultation</Link>
            <Link to="/destinations" className="btn btn-outline">View All Destinations</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
