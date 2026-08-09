import { useEffect, useRef, useState, type ReactNode } from 'react';
import './CurtainReveal.css';

interface Props {
  children: ReactNode;
  as?: 'h2' | 'div';
}

export default function CurtainReveal({ children, as = 'h2' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);
  const Tag = as;

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

  return (
    <div className="curtain-wrap" ref={ref}>
      <Tag className="curtain-content">{children}</Tag>
      <div className={triggered ? 'curtain-veil lifted' : 'curtain-veil'} />
    </div>
  );
}
