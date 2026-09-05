import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTestimonials } from '../hooks/useTestimonials';
import { getInitials } from '../utils/initials';
import './Stories.css';

const FILTERS = ['all', 'Study', 'Tourist', 'Business'] as const;

export default function Stories() {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('all');
  const { testimonials, loading } = useTestimonials();
  const filtered = activeFilter === 'all' ? testimonials : testimonials.filter((t) => t.category === activeFilter);

  return (
    <>
      <Header />

      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">Success Stories</span>
          <h1>What our clients say</h1>
          <p>Shared with permission. Photos withheld by client request.</p>
          <div className="filter-bar">
            {FILTERS.map((f) => (
              <button key={f} className={activeFilter === f ? 'filter-btn active' : 'filter-btn'} onClick={() => setActiveFilter(f)}>
                {f === 'all' ? 'All' : f === 'Business' ? 'Business & Other' : f}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="stories-grid-section">
        <div className="wrap">
          {loading ? (
            <div className="empty-state">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">No stories to show yet in this category.</div>
          ) : (
            <div className="story-grid">
              {filtered.map((t) => (
                <div className="story-card" key={t.id}>
                  <div className="story-top">
                    <div className="initial-badge">{getInitials(t.client_name)}</div>
                    <div><div className="story-name">{t.client_name}</div><div className="story-meta">{t.destination}</div></div>
                  </div>
                  <p className="story-quote">"{t.quote}"</p>
                  {t.service_tag && <span className="service-tag">{t.service_tag}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="video-section">
        <section>
          <div className="wrap">
            <span className="eyebrow">In Their Own Words</span>
            <h2 style={{ color: '#fff', marginTop: 12 }}>Video Testimonials</h2>
            <div className="video-slot-large">
              <div className="play-icon">▶</div>
              Video testimonials coming soon
            </div>
          </div>
        </section>
      </div>

      <section className="final-cta">
        <div className="wrap">
          <span className="eyebrow">Your Story Could Be Next</span>
          <h2>Let's start your journey</h2>
          <p>Book a free consultation and let's see what's possible for you.</p>
          <div className="final-actions">
            <a href="https://selar.com/088958q1eo" target="_blank" rel="noopener noreferrer" className="btn btn-gold">Book a Consultation</a>
            <Link to="/" className="btn btn-outline">Back to Home</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
