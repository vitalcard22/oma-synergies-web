import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { TESTIMONIALS } from '../data/testimonials';
import './Stories.css';

const FILTERS = ['all', 'Study', 'Tourist', 'Business'] as const;

export default function Stories() {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('all');
  const filtered = activeFilter === 'all' ? TESTIMONIALS : TESTIMONIALS.filter((t) => t.filterTag === activeFilter);

  return (
    <>
      <Header />

      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">Success Stories</span>
          <h1>Real clients. Real outcomes.</h1>
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

      <section>
        <div className="wrap">
          <div className="story-grid">
            {filtered.map((t) => (
              <div className="story-card" key={t.name}>
                <div className="story-top">
                  <div className="initial-badge">{t.initials}</div>
                  <div><div className="story-name">{t.name}</div><div className="story-meta">{t.meta}</div></div>
                </div>
                <p className="story-quote">"{t.quote}"</p>
                <span className="service-tag">{t.serviceTag}</span>
              </div>
            ))}
          </div>
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
            <Link to="/contact" className="btn btn-gold">Book a Consultation</Link>
            <Link to="/" className="btn btn-outline">Back to Home</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
