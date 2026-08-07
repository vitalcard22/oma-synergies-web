import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export function useStaggerReveal(selector: string, itemSelector: string) {
  useEffect(() => {
    const groups = document.querySelectorAll(selector);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.querySelectorAll(itemSelector).forEach((item) => item.classList.add('in'));
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    groups.forEach((g) => io.observe(g));
    return () => io.disconnect();
  }, [selector, itemSelector]);
}
