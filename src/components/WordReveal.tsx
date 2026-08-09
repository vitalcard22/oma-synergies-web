import { useEffect, useRef, useState } from 'react';
import './WordReveal.css';

interface Props {
  text: string;
  className?: string;
}

export default function WordReveal({ text, className }: Props) {
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
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = text.split(' ');

  return (
    <span className={`word-reveal ${className || ''}`} ref={ref}>
      {words.map((word, i) => (
        <span className="word-mask" key={i}>
          <span
            className={triggered ? 'word-inner in' : 'word-inner'}
            style={{ transitionDelay: `${i * 90}ms` }}
          >
            {word}
          </span>
        </span>
      )).reduce((acc, el, i) => (i === 0 ? [el] : [...acc, ' ', el]), [] as React.ReactNode[])}
    </span>
  );
}
