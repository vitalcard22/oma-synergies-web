import { lazy, Suspense, Component, type ReactNode, type ComponentType } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ScrollToTop from './components/ScrollToTop';
import './styles/global.css';

// Wraps a route's dynamic import so a failed chunk fetch - almost always
// caused by the browser having an older build of the app cached while a
// newer deploy has since overwritten that chunk's file on the server,
// giving a 404 - recovers automatically with a single hard reload
// instead of leaving the visitor on a blank page (which is what a
// rejected lazy() import does with nothing catching it). Only retries
// once per chunk per tab session (sessionStorage-gated), so a genuine,
// persistent failure doesn't loop forever - it falls through to
// RouteErrorBoundary below instead.
function lazyWithReload<T extends { default: ComponentType<any> }>(
  importer: () => Promise<T>,
  chunkName: string
) {
  return lazy(async () => {
    try {
      return await importer();
    } catch (err) {
      const key = `chunk-reload:${chunkName}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
        // A reload is already in flight - return a promise that never
        // resolves so React doesn't try to render anything in the meantime.
        return new Promise<T>(() => {});
      }
      throw err;
    }
  });
}

// Route-based code splitting: Home loads eagerly since it's the primary
// entry point for most visitors. Every other route (including the much
// heavier Admin panel and Client Portal) loads on demand, so a visitor
// who only views the homepage never downloads that code at all.
const About = lazyWithReload(() => import('./pages/About'), 'About');
const Contact = lazyWithReload(() => import('./pages/Contact'), 'Contact');
const Services = lazyWithReload(() => import('./pages/Services'), 'Services');
const ServiceDetail = lazyWithReload(() => import('./pages/ServiceDetail'), 'ServiceDetail');
const Destinations = lazyWithReload(() => import('./pages/Destinations'), 'Destinations');
const DestinationDetail = lazyWithReload(() => import('./pages/DestinationDetail'), 'DestinationDetail');
const Tours = lazyWithReload(() => import('./pages/Tours'), 'Tours');
const Stories = lazyWithReload(() => import('./pages/Stories'), 'Stories');
const Terms = lazyWithReload(() => import('./pages/Terms'), 'Terms');
const Privacy = lazyWithReload(() => import('./pages/Privacy'), 'Privacy');
const Admin = lazyWithReload(() => import('./pages/admin/Admin'), 'Admin');
const Portal = lazyWithReload(() => import('./pages/portal/Portal'), 'Portal');
const Placeholder = lazyWithReload(() => import('./pages/Placeholder'), 'Placeholder');

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

// Catches anything that still fails after lazyWithReload's one retry
// (a genuinely broken chunk, not just a stale cache) so a visitor gets a
// legible "something went wrong" screen with a manual reload option,
// rather than the blank white page a crashed lazy import leaves behind
// with no error boundary in place.
class RouteErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            background: 'var(--navy-deep)',
            color: '#fff',
            textAlign: 'center',
            padding: 24,
          }}
        >
          <div>Something went wrong loading this page.</div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 22px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--gold)',
              color: 'var(--navy-deep)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <RouteErrorBoundary>
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
      </RouteErrorBoundary>
    </BrowserRouter>
  );
}
