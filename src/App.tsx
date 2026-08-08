import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Destinations from './pages/Destinations';
import DestinationDetail from './pages/DestinationDetail';
import Tours from './pages/Tours';
import Stories from './pages/Stories';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Admin from './pages/admin/Admin';
import Portal from './pages/portal/Portal';
import Placeholder from './pages/Placeholder';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/destinations/:slug" element={<DestinationDetail />} />
        <Route path="/tours" element={<Tours />} />
        <Route path="/success-stories" element={<Stories />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/portal" element={<Portal />} />
        <Route path="*" element={<Placeholder title="Page Not Found" note="The page you're looking for doesn't exist." />} />
      </Routes>
    </BrowserRouter>
  );
}
