import { useEffect, useState, type CSSProperties } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ServiceIcon from '../components/ServiceIcon';
import { getServiceBySlug } from '../data/services';
import './ServiceDetail.css';

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = getServiceBySlug(slug);

  // scroll to top whenever the slug changes (navigating between service pages)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  return <ServiceDetailContent service={service} />;
}

function ServiceDetailContent({ service }: { service: NonNullable<ReturnType<typeof getServiceBySlug>> }) {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      <Header />

      <section className="service-hero">
        <div className="wrap-narrow">
          <Link to="/services" className="svc-back">← All Services</Link>
          <div className="icon-badge"><ServiceIcon icon={service.icon} /></div>
          <span className="eyebrow">{service.cluster}</span>
          <h1>{service.title}</h1>
          <p>{service.tagline}</p>
        </div>
      </section>

      <section className="svc-included">
        <div className="wrap-narrow">
          <div className="section-inner">
            <h2>What's Included</h2>
            <p>{service.description}</p>
            <div className="included-list">
              {service.included.map((item) => (
                <div className="included-item" key={item}>
                  <span className="check">✓</span>
                  <span className="txt">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="process-wrap">
        <section>
          <div className="wrap-narrow">
            <div className="section-inner">
              <h2 style={{ color: '#fff' }}>Our Process</h2>
            </div>
            <div className="process-steps" style={{ '--step-count': service.steps.length } as CSSProperties}>
              {service.steps.map((step, i) => (
                <div className="p-step" key={step.title}>
                  <div className="p-step-head">
                    <div className="p-num">{String(i + 1).padStart(2, '0')}</div>
                    <h4>{step.title}</h4>
                  </div>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="svc-faq">
        <div className="wrap-narrow">
          <div className="section-inner">
            <h2>Frequently Asked</h2>
            {service.faqs.map((f, i) => {
              const isOpen = openFaq === i;
              const panelId = `faq-panel-${i}`;
              const buttonId = `faq-button-${i}`;
              return (
                <div className="faq-item" key={f.q}>
                  <button
                    id={buttonId}
                    className="faq-q"
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenFaq(isOpen ? -1 : i)}
                  >
                    <span>{f.q}</span>
                    <span className={isOpen ? 'faq-chevron open' : 'faq-chevron'} aria-hidden="true">▾</span>
                  </button>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={isOpen ? 'faq-panel open' : 'faq-panel'}
                  >
                    <p>{f.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="wrap-narrow">
          <span className="eyebrow">Take The Next Step</span>
          <h2>{service.ctaHeadline}</h2>
          <p>A quick call, real answers, no pressure.</p>
          <div className="final-actions">
            <a href="https://selar.com/h5s9957y17" target="_blank" rel="noopener noreferrer" className="btn btn-gold">Book a Consultation</a>
            <Link to="/services" className="btn btn-outline">View All Services</Link>
          </div>
          <a href="https://wa.me/2348067696464" target="_blank" rel="noopener noreferrer" className="svc-whatsapp">
            Prefer WhatsApp? Message us →
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
