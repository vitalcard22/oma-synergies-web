import { useEffect, useRef, useState } from 'react';
import { GraduationCapIcon, CompassIcon } from './Icons';
import './PageTurnCard.css';

const READ_TIME = 9000;
const SCROLL_THRESHOLD = 260;

interface Face {
  icon: 'study' | 'travel';
  label: string;
  title: string;
  body: string;
  titleColor?: string;
}

const FACES: [Face, Face] = [
  {
    icon: 'study',
    label: 'Study · Visa · Consultancy',
    title: 'Start your journey',
    body: "Dreaming of studying abroad, securing your visa, or taking the next step toward a global future? We make it happen. From choosing the right destination and school to expert visa guidance and personalized consultancy, we're with you every step of the way.",
  },
  {
    icon: 'travel',
    label: 'Travel · Tourism',
    title: 'Explore the world',
    body: "Your journey doesn't end when your visa is approved, that's where the adventure begins. From unforgettable holidays and exciting tours to flights, accommodation, and destination experiences, we help you travel, explore, and create memories around the world.",
    titleColor: 'var(--gold)',
  },
];

export default function PageTurnCard() {
  const [state, setState] = useState<0 | 1>(0);
  const [foldOn, setFoldOn] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [settleKey, setSettleKey] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const cooldownRef = useRef(false);
  const scrollAccum = useRef(0);
  const lastScrollY = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const flip = () => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;
    setState((s) => (s === 0 ? 1 : 0));
    setFoldOn(true);
    setIsFlipping(true);
    setProgressKey((k) => k + 1);
    setTimeout(() => {
      setFoldOn(false);
      setSettleKey((k) => k + 1);
    }, 550);
    setTimeout(() => {
      cooldownRef.current = false;
      setIsFlipping(false);
    }, 1300);
  };

  const resetTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(flip, READ_TIME);
  };

  useEffect(() => {
    resetTimer();
    lastScrollY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = Math.abs(y - lastScrollY.current);
      lastScrollY.current = y;
      const zone = zoneRef.current;
      if (!zone) return;
      const rect = zone.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;
      scrollAccum.current += delta;
      if (scrollAccum.current > SCROLL_THRESHOLD) {
        scrollAccum.current = 0;
        flip();
        resetTimer();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const zone = zoneRef.current;
    const tilt = tiltRef.current;
    if (!zone || !tilt) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const onMove = (e: MouseEvent) => {
      const rect = zone.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      tilt.style.transform = `rotateY(${relX * 6}deg) rotateX(${relY * -6}deg)`;
    };
    const onLeave = () => {
      tilt.style.transform = 'rotateY(0deg) rotateX(0deg)';
    };

    zone.addEventListener('mousemove', onMove);
    zone.addEventListener('mouseleave', onLeave);
    return () => {
      zone.removeEventListener('mousemove', onMove);
      zone.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div className="ptc-zone reveal" ref={zoneRef}>
      <div className="ptc-tilt" ref={tiltRef}>
        <div className="ptc-shadow" data-folding={foldOn} />
        <div className="ptc-flipper" data-folding={isFlipping} style={{ transform: state === 1 ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
          {FACES.map((f, i) => (
            <div
              key={i}
              className="ptc-face"
              style={i === 1 ? { transform: 'rotateY(180deg)' } : undefined}
            >
              <div className="ptc-label-row">
                {f.icon === 'study' ? <GraduationCapIcon size={14} /> : <CompassIcon size={14} />}
                <span className="ptc-label">{f.label}</span>
              </div>
              <h2 key={`${i}-${settleKey}`} className="ptc-title" style={{ color: f.titleColor }}>
                {f.title}
              </h2>
              <p className="ptc-body">{f.body}</p>
              <div className="ptc-fold" data-side={i} data-on={foldOn} />
            </div>
          ))}
        </div>
      </div>

      <div className="ptc-progress-track">
        <div key={progressKey} className="ptc-progress-fill" />
      </div>

      <div className="ptc-dots">
        <span className={state === 0 ? 'ptc-dot active' : 'ptc-dot'} />
        <span className={state === 1 ? 'ptc-dot active' : 'ptc-dot'} />
      </div>
    </div>
  );
}
