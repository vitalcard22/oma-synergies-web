import { useEffect } from 'react';

// threshold-based visibility (e.g. "15% of the element must be on screen")
// silently breaks for any element taller than viewportHeight / threshold -
// it can never reach that ratio no matter how far you scroll, so it stays
// invisible forever. That's exactly what happened to the mobile Destinations
// grid: 12 stacked cards made it ~5000px tall against a ~700-800px viewport,
// so the old 0.15 threshold could never be satisfied. rootMargin is relative
// to the viewport, not the target, so it works the same regardless of the
// element's own height - use that instead, everywhere .reveal/.stagger is used.
const REVEAL_ROOT_MARGIN = '0px 0px -10% 0px';

export function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0, rootMargin: REVEAL_ROOT_MARGIN }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export function useStaggerReveal(selector: string, itemSelector: string) {
  useEffect(() => {
    const groups = document.querySelectorAll(selector);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.querySelectorAll(itemSelector).forEach((item) => item.classList.add('in'));
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0, rootMargin: REVEAL_ROOT_MARGIN }
    );
    groups.forEach((g) => io.observe(g));
    return () => io.disconnect();
  }, [selector, itemSelector]);
}
