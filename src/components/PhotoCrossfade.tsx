import { useEffect, useState } from 'react';
import './PhotoCrossfade.css';

interface Props {
  images: string[];
  alts: string[];
  holdMs?: number;
}

export default function PhotoCrossfade({ images, alts, holdMs = 4500 }: Props) {
  const [active, setActive] = useState(0);
  const [zoomIn, setZoomIn] = useState(true);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const interval = setInterval(() => {
      setActive((i) => (i + 1) % images.length);
      setZoomIn((z) => !z);
    }, holdMs);
    return () => clearInterval(interval);
  }, [images.length, holdMs]);

  return (
    <div className="photo-crossfade">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={alts[i] || ''}
          loading="lazy"
          className={
            i === active
              ? `pcf-slide active ${zoomIn ? 'zoom-in' : 'zoom-out'}`
              : 'pcf-slide'
          }
        />
      ))}
      <div className="pcf-dots">
        {images.map((_, i) => (
          <span key={i} className={i === active ? 'pcf-dot active' : 'pcf-dot'} />
        ))}
      </div>
    </div>
  );
}
