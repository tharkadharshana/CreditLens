'use client';

import React from 'react';
import { useReveal } from '@/lib/hooks/useReveal';
import Link from 'next/link';

const CTA = () => {
  const revealRef = useReveal();

  return (
    <section className="cta-section" ref={revealRef}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="reveal">
          <div className="section-label" style={{ justifyContent: 'center', marginBottom: '20px' }}>Get started today</div>
          <h2 className="cta-headline">
            Your iPhone is already<br />capable of this.
          </h2>
          <p className="cta-sub">Take control of your credit in 2 minutes. Free forever. No bank login. No nonsense.</p>
          <div className="hero-cta" style={{ marginBottom: '12px' }}>
            <Link href="/register" className="btn-xl">
              Start for free
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <button className="btn-xl-ghost">Read the docs</button>
          </div>
          <div className="hero-note" style={{ justifyContent: 'center' }}>
            <span>✓ Free forever tier</span>
            <span>✓ No credit card required</span>
            <span>✓ Set up in 2 minutes</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
