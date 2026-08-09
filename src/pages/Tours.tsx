import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Tours.css';

interface Tour {
  name: string;
  category: 'Group Tours' | 'Honeymoon' | 'Solo' | 'Family';
  duration: string;
  price: string;
  img: string;
}

const TOURS: Tour[] = [
  { name: 'Cape Town Explorer', category: 'Group Tours', duration: '7 Days', price: 'From ₦850,000 / person', img: 'https://images.unsplash.com/photo-1580060839134-75a50cfb0b7f?w=600&q=80' },
  { name: 'Dubai Long Weekend', category: 'Solo', duration: '4 Days', price: 'From ₦620,000 / person', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80' },
  { name: 'London Family Highlights', category: 'Family', duration: '6 Days', price: 'From ₦1,150,000 / family of 4', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80' },
  { name: 'Istanbul Discovery', category: 'Group Tours', duration: '5 Days', price: 'From ₦730,000 / person', img: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=600&q=80' },
  { name: 'Maldives Escape', category: 'Honeymoon', duration: '5 Days', price: 'From ₦2,100,000 / couple', img: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&q=80' },
  { name: 'Bali Solo Retreat', category: 'Solo', duration: '6 Days', price: 'From ₦980,000 / person', img: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=600&q=80' },
];

const CATEGORIES = ['all', 'Group Tours', 'Honeymoon', 'Solo', 'Family'] as const;

export default function Tours() {
  const [activeCat, setActiveCat] = useState<(typeof CATEGORIES)[number]>('all');
  const filtered = activeCat === 'all' ? TOURS : TOURS.filter((t) => t.category === activeCat);

  return (
    <>
      <Header />

      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">Tours & Packages</span>
          <h1>Travel should feel like a breath of fresh air</h1>
          <p>Beyond school runs: luxury tour packages, romantic honeymoons, solo getaways, and customized family vacations designed around your comfort.</p>
          <div className="cat-bar">
            {CATEGORIES.map((c) => (
              <button key={c} className={activeCat === c ? 'cat-btn active' : 'cat-btn'} onClick={() => setActiveCat(c)}>
                {c === 'all' ? 'All' : c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="tour-grid">
            {filtered.map((t) => (
              <div className="tour-card" key={t.name}>
                <div className="tour-img">
                  <img src={t.img} alt={t.name} />
                  <span className="tour-tag">Sample Package</span>
                </div>
                <div className="tour-body">
                  <h4>{t.name}</h4>
                  <div className="tour-meta"><span>{t.duration}</span><span>{t.category}</span></div>
                  <div className="tour-price">{t.price}</div>
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
        </div>
      </section>

      <Footer />
    </>
  );
}
