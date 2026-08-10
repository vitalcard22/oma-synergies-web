import { useEffect, useState } from 'react';
import './HeroPhotoBackdrop.css';

interface Props {
  image: string;
}

export default function HeroPhotoBackdrop({ image }: Props) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Only mount on mobile widths — desktop keeps its existing hero untouched
    // and pays no image cost at all.
    const mq = window.matchMedia('(max-width: 900px)');
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  if (!enabled) return null;

  return (
    <div className="hero-photo-backdrop" aria-hidden="true">
      <div className="hpb-slide active" style={{ backgroundImage: `url(${image})` }} />
      <div className="hpb-veil" />
    </div>
  );
}
