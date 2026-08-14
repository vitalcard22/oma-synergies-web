import { useEffect, useState, type CSSProperties } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
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
          <div className="icon-badge">{service.icon}</div>
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
                  <div className="p-num">{String(i + 1).padStart(2, '0')}</div>
                  <h4>{step.title}</h4>
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
            {service.faqs.map((f, i) => (
              <div className="faq-item" key={f.q}>
                <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)} style={{ cursor: 'pointer' }}>
                  {f.q}
                </div>
                {openFaq === i && <p>{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="wrap-narrow">
          <span className="eyebrow">Ready to Start?</span>
          <h2>{service.ctaHeadline}</h2>
          <p>Book a free consultation and we'll walk you through exactly what this service involves.</p>
          <div className="final-actions">
            <Link to="/contact" className="btn btn-gold">Book a Consultation</Link>
            <Link to="/services" className="btn btn-outline">View All Services</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
