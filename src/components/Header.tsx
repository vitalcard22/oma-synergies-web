import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoIcon from '../assets/logo-icon.png';
import './Header.css';

const NAV_ITEMS = [
  { to: '/services', label: 'Services' },
  { to: '/destinations', label: 'Destinations' },
  { to: '/tours', label: 'Tours' },
  { to: '/success-stories', label: 'Success Stories' },
  { to: '/about', label: 'About' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close the mobile menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // lock page scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header className={scrolled || menuOpen ? 'site-header scrolled' : 'site-header'}>
      <div className="wrap">
        <nav>
          <Link to="/" className="logo-mark">
            <img src={logoIcon} alt="Oma Synergies" loading="eager" />
            <span className="logo-text">
              <span className="logo-name">OMA SYNERGIES</span>
              <span className="logo-tagline">travels and tours</span>
            </span>
          </Link>
          <ul className="nav-links">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}><Link to={item.to}>{item.label}</Link></li>
            ))}
          </ul>
          <div className="nav-cta">
            <Link to="/portal" className="btn btn-outline">Client Login</Link>
            <Link to="/contact" className="btn btn-gold">Book a Consultation</Link>
          </div>
          <button
            className={menuOpen ? 'menu-toggle open' : 'menu-toggle'}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </div>

      <div className={menuOpen ? 'mobile-menu-overlay open' : 'mobile-menu-overlay'} onClick={() => setMenuOpen(false)} />

      <div className={menuOpen ? 'mobile-menu open' : 'mobile-menu'}>
        <ul className="mobile-nav-links">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}><Link to={item.to} onClick={() => setMenuOpen(false)}>{item.label}</Link></li>
          ))}
        </ul>
        <div className="mobile-nav-cta">
          <Link to="/portal" className="btn btn-outline" onClick={() => setMenuOpen(false)}>Client Login</Link>
          <Link to="/contact" className="btn btn-gold" onClick={() => setMenuOpen(false)}>Book a Consultation</Link>
        </div>
      </div>
    </header>
  );
}
