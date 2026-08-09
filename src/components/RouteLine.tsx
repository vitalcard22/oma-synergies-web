import { useEffect, useRef, useState } from 'react';
import './RouteLine.css';

// Key points the plane travels through, as percentages of the container (x, y)
const KEY_POINTS: [number, number][] = [
  [30, 2],
  [55, 20],
  [20, 40],
  [45, 60],
  [65, 80],
  [35, 98],
];

function pointOnPath(progress: number): { x: number; y: number } {
  const segments = KEY_POINTS.length - 1;
  const scaled = Math.min(0.9999, Math.max(0, progress)) * segments;
  const i = Math.floor(scaled);
  const t = scaled - i;
  const [x1, y1] = KEY_POINTS[i];
  const [x2, y2] = KEY_POINTS[Math.min(i + 1, segments)];
  return { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t };
}

function buildSvgPath(): string {
  return KEY_POINTS.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1] * 6}`).join(' ');
}

export default function RouteLine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 30, y: 2 });
  const [angle, setAngle] = useState(120);
  const mouseOffset = useRef({ x: 0, y: 0 });
  const basePos = useRef({ x: 30, y: 2 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let rafId: number;

    const computeFromScroll = () => {
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      const raw = (vh - rect.top) / (vh + rect.height);
      const progress = Math.min(1, Math.max(0, raw));
      const point = pointOnPath(progress);
      const ahead = pointOnPath(Math.min(1, progress + 0.02));
      const dx = ahead.x - point.x;
      const dy = (ahead.y - point.y) * 6;
      const rad = Math.atan2(dy, dx);
      basePos.current = point;
      setAngle((rad * 180) / Math.PI + 90);
      applyPosition();
    };

    const applyPosition = () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const mx = prefersReduced ? 0 : mouseOffset.current.x;
      const my = prefersReduced ? 0 : mouseOffset.current.y;
      setPos({ x: basePos.current.x + mx, y: basePos.current.y + my });
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(computeFromScroll);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!window.matchMedia('(pointer: fine)').matches) return;
      const rect = container.getBoundingClientRect();
      const relX = ((e.clientX - rect.left) / rect.width) * 100;
      const relY = ((e.clientY - rect.top) / rect.height) * 100;
      const dx = Math.max(-2.5, Math.min(2.5, (relX - basePos.current.x) * 0.05));
      const dy = Math.max(-2.5, Math.min(2.5, (relY - basePos.current.y) * 0.05));
      mouseOffset.current = { x: dx, y: dy };
      applyPosition();
    };

    computeFromScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    container.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      container.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="route-line" ref={containerRef}>
      <svg viewBox="0 0 100 600" preserveAspectRatio="none">
        <path
          d={buildSvgPath()}
          fill="none"
          stroke="#F0B124"
          strokeWidth="1.2"
          strokeDasharray="1 8"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
      <div
        className="route-plane"
        style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: `translate(-50%,-50%) rotate(${angle}deg)` }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#F0B124">
          <path d="M21 6.5L3 12.8L9.8 14.1L11.5 21L14.2 15.3L21 6.5Z" />
        </svg>
      </div>
    </div>
  );
}
