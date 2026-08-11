import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { SERVICES } from '../data/services';
import './Services.css';

export default function Services() {
  useScrollReveal();
  const coreServices = SERVICES.filter((s) => s.cluster === 'Study Abroad & Visa');
  const travelServices = SERVICES.filter((s) => s.cluster === 'Travel');

  return (
    <>
      <Header />

      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">Our Services</span>
          <h1>Everything your journey abroad needs, all under one roof</h1>
          <p>Study, visa guidance, travel, and tour. Four core services, handled end to end by one trusted partner.</p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="svc-cluster reveal">
            <div className="svc-cluster-head">
              <h3>Study Abroad & Visa</h3>
              <span className="svc-tag">Study &amp; Visa</span>
            </div>
            <div className="svc-grid">
              {coreServices.map((s) => (
                <Link to={`/services/${s.slug}`} className="svc-card" key={s.slug}>
                  <div className="svc-icon">{s.icon}</div>
                  <h4>{s.title}</h4>
                  <p>{s.tagline}</p>
                  <span className="learn">View Service →</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="svc-cluster reveal">
            <div className="svc-cluster-head">
              <h3>Travel &amp; Tour</h3>
              <span className="svc-tag">Travel &amp; Tour</span>
            </div>
            <div className="svc-grid">
              {travelServices.map((s) => (
                <Link to={`/services/${s.slug}`} className="svc-card" key={s.slug}>
                  <div className="svc-icon">{s.icon}</div>
                  <h4>{s.title}</h4>
                  <p>{s.tagline}</p>
                  <span className="learn">View Service →</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="wrap">
          <span className="eyebrow reveal">Ready When You Are</span>
          <h2 className="reveal">Not sure which service you need?</h2>
          <p className="reveal">Book a free consultation and we'll map out exactly what your journey requires.</p>
          <div className="final-actions reveal">
            <Link to="/contact" className="btn btn-gold">Book a Consultation</Link>
            <Link to="/" className="btn btn-outline">Back to Home</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
