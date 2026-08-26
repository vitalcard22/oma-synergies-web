import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to the top (hero section) on every internal route change.
 * Uses two scroll calls: one immediately on pathname change, and one
 * deferred by a frame to handle any layout reflow from entrance animations
 * that could otherwise push the page down before the initial scroll fires.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Immediate call
    window.scrollTo(0, 0);
    // Deferred call catches any layout shift from entrance animations
    const id = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => cancelAnimationFrame(id);
  }, [pathname]);
  return null;
}
