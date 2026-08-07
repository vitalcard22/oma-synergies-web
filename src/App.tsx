import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Placeholder from './pages/Placeholder';
import './styles/global.css';

const PORT_NOTE = 'This page exists as a full static prototype and is being ported into React next, following the same pattern used for the Home page.';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<Placeholder title="About Us" note={PORT_NOTE} />} />
        <Route path="/services" element={<Placeholder title="Our Services" note={PORT_NOTE} />} />
        <Route path="/services/:slug" element={<Placeholder title="Service Detail" note={PORT_NOTE} />} />
        <Route path="/destinations" element={<Placeholder title="Destinations" note={PORT_NOTE} />} />
        <Route path="/destinations/:slug" element={<Placeholder title="Destination Detail" note={PORT_NOTE} />} />
        <Route path="/tours" element={<Placeholder title="Tours & Packages" note={PORT_NOTE} />} />
        <Route path="/success-stories" element={<Placeholder title="Success Stories" note={PORT_NOTE} />} />
        <Route path="/contact" element={<Placeholder title="Contact Us" note={PORT_NOTE} />} />
        <Route path="/terms" element={<Placeholder title="Terms & Conditions" note={PORT_NOTE} />} />
        <Route path="/privacy" element={<Placeholder title="Privacy Policy" note={PORT_NOTE} />} />
        <Route path="/portal" element={<Placeholder title="Client Portal" note="Coming soon — you'll be able to log in and track your application in real time." />} />
        <Route path="*" element={<Placeholder title="Page Not Found" note="The page you're looking for doesn't exist." />} />
      </Routes>
    </BrowserRouter>
  );
}
