import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { TOURS, GROUP_DISCOUNT_PERCENT, GROUP_DISCOUNT_MIN_SIZE, formatNaira, formatDuration, getDiscountedFromPrice } from '../data/tours';
import './Tours.css';

const CATEGORIES = ['all', 'Group Tours', 'Honeymoon', 'Solo', 'Family'] as const;

// The 10% discount genuinely only applies to parties of 4+, so showing it
// while someone is specifically browsing Honeymoon (2 people) or Solo (1
// person) is irrelevant at best and misleading at worst - neither hits the
// threshold. Group Tours and Family plausibly do, and on the unfiltered
// "all" view there's no single traveler-type context to contradict, so the
// general framing stays.
function getPricingNote(activeCat: (typeof CATEGORIES)[number]) {
  if (activeCat === 'Honeymoon') {
    return { showDiscount: false, note: "Priced per person, contact us for your couple's package quote." };
  }
  if (activeCat === 'Solo') {
    return { showDiscount: false, note: 'Priced per person, contact us to confirm your solo travel quote.' };
  }
  return { showDiscount: true, note: 'Final price depends on group size and dates, contact us for an exact quote.' };
}

export default function Tours() {
  const [activeCat, setActiveCat] = useState<(typeof CATEGORIES)[number]>('all');
  const filtered = activeCat === 'all' ? TOURS : TOURS.filter((t) => t.categories.includes(activeCat));
  const pricingNote = getPricingNote(activeCat);

  return (
    <>
      <Header />

      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">Tours & Packages</span>
          <h1>Travel should feel like a breath of fresh air</h1>
          <p>Group getaways, honeymoons, solo trips, and family vacations, every destination below is bookable for any of them. Groups of {GROUP_DISCOUNT_MIN_SIZE}+ save {GROUP_DISCOUNT_PERCENT}% per person.</p>
          <div className="cat-bar">
            {CATEGORIES.map((c) => (
              <button key={c} className={activeCat === c ? 'cat-btn active' : 'cat-btn'} onClick={() => setActiveCat(c)}>
                {c === 'all' ? 'All' : c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="tours-content">
        <div className="wrap">
          <div className="tour-grid">
            {filtered.map((t) => (
              <div className="tour-card" key={t.slug}>
                <div className="tour-body">
                  <h4>{t.name}</h4>
                  <div className="tour-meta"><span>{formatDuration(t.nights)}</span></div>
                  <div className="tour-cats">
                    {t.categories.map((c) => (
                      <span className="tour-cat-tag" key={c}>{c}</span>
                    ))}
                  </div>
                  <div className="tour-price">
                    {formatNaira(t.fromPrice)}<span> {t.perPersonSharing ? 'per person sharing, from' : 'per person, from'}</span>
                  </div>
                  {pricingNote.showDiscount && (
                    <div className="tour-discount">
                      {formatNaira(getDiscountedFromPrice(t.fromPrice))} per person for groups of {GROUP_DISCOUNT_MIN_SIZE}+ <span>({GROUP_DISCOUNT_PERCENT}% off)</span>
                    </div>
                  )}
                  <p className="tour-note">{pricingNote.note}</p>
                  <Link to="/contact" className="tour-book-btn">Book Now →</Link>
                </div>
              </div>
            ))}
          </div>

          <div className="custom-cta">
            <div>
              <h3>Don't see what you're looking for?</h3>
              <p>Every trip can be fully customized, tell us your dates, budget, and vibe, and we'll build something just for you.</p>
            </div>
            <Link to="/contact" className="btn btn-gold">Request a Custom Trip</Link>
          </div>

          <div className="tour-terms">
            <h3>Terms &amp; Conditions</h3>
            <ul>
              <li>Package rates displayed are subject to change and availability.</li>
              <li>Flight rates are not inclusive.</li>
              <li>Offer is not inclusive of travel expenses like travel insurance, medical expenses, laundry, beverages, meals, activities &amp; personal transfers, etc., other than stated above.</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
