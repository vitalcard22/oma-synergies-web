import { useEffect, useRef } from 'react';

export function useCountUp() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const els = container.querySelectorAll<HTMLElement>('.flap-val');

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const target = parseInt(el.dataset.target || '0', 10);
            const suffix = el.dataset.suffix || '';
            const dur = 1200;
            const start = performance.now();
            function tick(now: number) {
              const p = Math.min((now - start) / dur, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              el.textContent = Math.round(target * eased) + suffix;
              if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return containerRef;
}
