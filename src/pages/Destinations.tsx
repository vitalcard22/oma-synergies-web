import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { DESTINATIONS } from '../data/destinations';
import './Destinations.css';

const REGIONS = ['all', 'Americas', 'Europe', 'Asia', 'Oceania'] as const;

export default function Destinations() {
  const [activeRegion, setActiveRegion] = useState<(typeof REGIONS)[number]>('all');

  const filtered = activeRegion === 'all' ? DESTINATIONS : DESTINATIONS.filter((d) => d.region === activeRegion);

  return (
    <>
      <Header />

      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">Destinations</span>
          <h1>12 flagship destinations. Worldwide reach.</h1>
          <p>Full admissions and visa guidance across our premium destinations in the Americas, Europe, Asia and Oceania, with support available for students and travelers headed anywhere else too.</p>
          <div className="filter-bar">
            {REGIONS.map((r) => (
              <button
                key={r}
                className={activeRegion === r ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setActiveRegion(r)}
              >
                {r === 'all' ? 'All' : r}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="dest-content">
        <div className="wrap">
          <div className="dest-grid">
            {filtered.map((d) => (
              <Link to={`/destinations/${d.slug}`} className="dest-card" key={d.slug}>
                <img src={d.img} alt={d.name} loading="lazy" />
                <div className="dest-overlay">
                  <div className="region">{d.region}</div>
                  <h4>{d.name}</h4>
                  <div className="stat">Processing: {d.processing}</div>
                </div>
              </Link>
            ))}
          </div>

          <div className="worldwide-note">
            <div>
              <h4>Headed somewhere not listed?</h4>
              <p>Our flagship destinations get full guides, but we support students and travelers worldwide. Reach out and we'll walk you through your specific country.</p>
            </div>
            <Link to="/contact" className="btn btn-outline-dark">Enquire About Another Destination →</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
