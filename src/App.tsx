import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ScrollToTop from './components/ScrollToTop';
import './styles/global.css';

// Route-based code splitting: Home loads eagerly since it's the primary
// entry point for most visitors. Every other route (including the much
// heavier Admin panel and Client Portal) loads on demand, so a visitor
// who only views the homepage never downloads that code at all.
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const Destinations = lazy(() => import('./pages/Destinations'));
const DestinationDetail = lazy(() => import('./pages/DestinationDetail'));
const Tours = lazy(() => import('./pages/Tours'));
const Stories = lazy(() => import('./pages/Stories'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Admin = lazy(() => import('./pages/admin/Admin'));
const Portal = lazy(() => import('./pages/portal/Portal'));
const Placeholder = lazy(() => import('./pages/Placeholder'));

function RouteLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--navy-deep)',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '2.5px solid rgba(240,177,36,0.2)',
          borderTopColor: 'var(--gold)',
          animation: 'app-spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes app-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<RouteLoading />}>
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
      </Suspense>
    </BrowserRouter>
  );
}
