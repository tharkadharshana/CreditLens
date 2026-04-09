'use client';

import { useEffect, useRef } from 'react';

export const useReveal = () => {
  const ref = useRef<any>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
          }
        });
      },
      { threshold: 0.12 }
    );

    const currentRef = ref.current;
    if (currentRef) {
      if (currentRef.classList.contains('reveal')) {
        observer.observe(currentRef);
      } else {
        const revealElements = currentRef.querySelectorAll('.reveal');
        revealElements.forEach((el: Element) => observer.observe(el));
      }
    }

    return () => {
      if (currentRef) {
        const revealElements = currentRef.querySelectorAll('.reveal');
        revealElements.forEach((el: Element) => observer.unobserve(el));
      }
    };
  }, []);

  return ref;
};
