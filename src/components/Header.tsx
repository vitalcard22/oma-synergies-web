import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logoIcon from '../assets/logo-icon.png';
import './Header.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={scrolled ? 'site-header scrolled' : 'site-header'}>
      <div className="wrap">
        <nav>
          <Link to="/" className="logo-mark">
            <img src={logoIcon} alt="Oma Synergies" />
            OMA SYNERGIES
          </Link>
          <ul className="nav-links">
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/destinations">Destinations</Link></li>
            <li><Link to="/tours">Tours</Link></li>
            <li><Link to="/success-stories">Success Stories</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
          <div className="nav-cta">
            <Link to="/portal" className="btn btn-outline">Client Login</Link>
            <Link to="/contact" className="btn btn-gold">Book a Consultation</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
