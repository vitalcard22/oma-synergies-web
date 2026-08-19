import { Link } from 'react-router-dom';
import logoIcon from '../assets/logo-icon.png';
import { InstagramIcon, TikTokIcon, LinkedInIcon, XIcon } from './Icons';
import './Footer.css';

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src={logoIcon} alt="Oma Synergies" loading="lazy" />
            <p>Guiding students and travelers toward international education and travel goals, with clarity, confidence, and expert support.</p>
          </div>
          <div className="footer-col">
            <h5>Quick Links</h5>
            <ul>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/destinations">Destinations</Link></li>
              <li><Link to="/tours">Tours</Link></li>
              <li><Link to="/success-stories">Success Stories</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Contact</h5>
            <ul>
              <li><a href="mailto:Omasynergiestravels@gmail.com">Omasynergiestravels@gmail.com</a></li>
              <li><a href="tel:+2348067696464">0806 769 6464</a></li>
              <li><a href="tel:+2347078084746">0707 808 4746</a></li>
              <li>Block B8, 29/32 Utako Market Plaza, Abuja</li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Follow</h5>
            <ul className="footer-social">
              <li><a href="https://www.instagram.com/omasynergiestravelsandtours" target="_blank" rel="noopener noreferrer"><InstagramIcon size={16} /><span>Instagram</span></a></li>
              <li><a href="https://www.tiktok.com/@omasynergiestravel" target="_blank" rel="noopener noreferrer"><TikTokIcon size={16} /><span>TikTok</span></a></li>
              <li><a href="https://www.linkedin.com/company/oma-synergies-travels-and-tours/" target="_blank" rel="noopener noreferrer"><LinkedInIcon size={16} /><span>LinkedIn</span></a></li>
              <li><a href="https://x.com/OmaSynergies" target="_blank" rel="noopener noreferrer"><XIcon size={16} /><span>X (Twitter)</span></a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Oma Synergies Travels and Tours Ltd. All Rights Reserved.</span>
          <span><Link to="/privacy">Privacy Policy</Link> · <Link to="/terms">Terms of Service</Link></span>
        </div>
      </div>
    </footer>
  );
}
