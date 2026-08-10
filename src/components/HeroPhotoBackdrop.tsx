import { useEffect, useState } from 'react';
import './HeroPhotoBackdrop.css';

interface Props {
  images: string[];
  holdMs?: number;
}

export default function HeroPhotoBackdrop({ images, holdMs = 5000 }: Props) {
  const [active, setActive] = useState(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Only run on mobile widths — desktop keeps its existing hero untouched.
    const mq = window.matchMedia('(max-width: 900px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener('change', sync);

    if (reduced.matches) {
      return () => mq.removeEventListener('change', sync);
    }

    const t = setInterval(() => {
      if (!mq.matches || document.hidden) return;
      setActive((i) => (i + 1) % images.length);
    }, holdMs);

    return () => {
      mq.removeEventListener('change', sync);
      clearInterval(t);
    };
  }, [images.length, holdMs]);

  if (!enabled) return null;

  return (
    <div className="hero-photo-backdrop" aria-hidden="true">
      {images.map((src, i) => (
        <div
          key={src}
          className={i === active ? 'hpb-slide active' : 'hpb-slide'}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
      <div className="hpb-veil" />
    </div>
  );
}
