import { useEffect, useRef, useState } from 'react';
import './SplitFlap.css';

interface Props {
  text: string;
  className?: string;
}

export default function SplitFlap({ text, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTriggered(true);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span className={`split-flap ${className || ''}`} ref={ref}>
      {text.split('').map((ch, i) => (
        <span
          key={i}
          className={triggered ? 'flap-char in' : 'flap-char'}
          style={{ transitionDelay: `${i * 28}ms` }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </span>
  );
}
