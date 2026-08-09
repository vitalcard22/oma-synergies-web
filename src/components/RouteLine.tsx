import { useEffect, useRef, useState } from 'react';
import './RouteLine.css';

export default function RouteLine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [planeStyle, setPlaneStyle] = useState({ left: '0%', top: '0%', rotate: 90 });
  const mouseOffset = useRef({ x: 0, y: 0 });
  const scrollPoint = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const path = pathRef.current;
    if (!container || !path) return;

    const totalLength = path.getTotalLength();
    let rafId: number;

    const computeFromScroll = () => {
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      // progress 0 -> 1 as the container travels through the viewport
      const raw = (vh - rect.top) / (vh + rect.height);
      const progress = Math.min(1, Math.max(0, raw));

      const point = path.getPointAtLength(progress * totalLength);
      const viewBox = path.ownerSVGElement!.viewBox.baseVal;

      const xPct = (point.x / viewBox.width) * 100;
      const yPct = (point.y / viewBox.height) * 100;

      scrollPoint.current = { x: xPct, y: yPct };
      applyPosition();
    };

    const applyPosition = () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const magnetX = prefersReduced ? 0 : mouseOffset.current.x;
      const magnetY = prefersReduced ? 0 : mouseOffset.current.y;
      setPlaneStyle({
        left: `${scrollPoint.current.x + magnetX}%`,
        top: `${scrollPoint.current.y + magnetY}%`,
        rotate: 100,
      });
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
      // small magnetic pull toward cursor, clamped
      const dx = Math.max(-3, Math.min(3, (relX - scrollPoint.current.x) * 0.06));
      const dy = Math.max(-3, Math.min(3, (relY - scrollPoint.current.y) * 0.06));
      mouseOffset.current = { x: dx, y: dy };
      applyPosition();
    };

    computeFromScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    container.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('scroll', onScroll);
      container.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="route-line" ref={containerRef}>
      <svg viewBox="0 0 100 600" preserveAspectRatio="none">
        <path
          ref={pathRef}
          d="M20,10 C60,120 10,240 40,360 C65,460 15,540 30,590"
          fill="none"
          stroke="#F0B124"
          strokeWidth="1.2"
          strokeDasharray="1 8"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
      <div
        className="route-plane"
        style={{ left: planeStyle.left, top: planeStyle.top, transform: `translate(-50%,-50%) rotate(${planeStyle.rotate}deg)` }}
      >
        <svg width="18" height="18" viewBox="0 0 20 20">
          <path d="M0 0 L 7 -2 L 10 -8 L 12 -8 L 11 -1 L 18 1 L 18 3 L 11 4 L 10 11 L 8 11 L 7 3 Z" fill="#F0B124" transform="translate(1,8)" />
        </svg>
      </div>
    </div>
  );
}
