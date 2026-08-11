import { useEffect, useRef, useState } from 'react';
import './OrbitDestinations.css';

const DESTINATIONS = ['TORONTO', 'LONDON', 'SEOUL', 'DUBLIN', 'MILAN', 'AUCKLAND'];

const STEP = 360 / DESTINATIONS.length;
const REVEAL_ANGLE = 270; // top of the circle
const LAP_MS = 40000; // one lap per 40s, matching the ring spin

export default function OrbitDestinations() {
  const [angle, setAngle] = useState(0);
  const [label, setLabel] = useState<string | null>(null);
  const [scaledRadius, setScaledRadius] = useState(190);
  const containerRef = useRef<HTMLDivElement>(null);

  // Desktop's orbit ring is much larger than mobile's, so the points need to
  // sit on a correspondingly larger circle to stay on the ring.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const small = window.matchMedia('(max-width: 480px)');
    const sync = () => {
      setScaledRadius(small.matches ? 100 : mq.matches ? 115 : 190);
    };
    sync();
    mq.addEventListener('change', sync);
    small.addEventListener('change', sync);
    return () => {
      mq.removeEventListener('change', sync);
      small.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const el = containerRef.current;
    if (!el) return;

    let raf: number | undefined;
    let running = false;
    let last = performance.now();
    let current = 0;
    let lastRevealed = -1;
    let labelTimer: number | undefined;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;

      if (!running || document.hidden) {
        raf = undefined;
        return;
      }

      current = (current + (dt * 360) / LAP_MS) % 360;
      setAngle(current);

      // Reveal a label as each point crosses the top of the arc.
      for (let i = 0; i < DESTINATIONS.length; i++) {
        const pointAngle = (current + i * STEP) % 360;
        if (Math.abs(pointAngle - REVEAL_ANGLE) < 1.5 && lastRevealed !== i) {
          lastRevealed = i;
          const name = DESTINATIONS[i];
          setLabel(name);
          window.clearTimeout(labelTimer);
          labelTimer = window.setTimeout(() => setLabel(null), 1900);
          break;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf === undefined) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    // Pause entirely when off-screen so we aren't burning frames or battery
    // while the visitor reads further down the page.
    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
        if (running) start();
      },
      { threshold: 0 }
    );
    io.observe(el);

    const onVisibility = () => {
      if (!document.hidden && running) start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearTimeout(labelTimer);
      if (raf !== undefined) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="orbit-destinations" ref={containerRef} aria-hidden="true">
      {DESTINATIONS.map((name, i) => {
        const a = ((angle + i * STEP) % 360) * (Math.PI / 180);
        const x = Math.cos(a) * scaledRadius;
        const y = Math.sin(a) * scaledRadius;
        return (
          <span
            key={name}
            className="orbit-dest-point"
            style={{ transform: `translate(${x}px, ${y}px)` }}
          />
        );
      })}
      <span className={label ? 'orbit-dest-label showing' : 'orbit-dest-label'}>{label}</span>
    </div>
  );
}
