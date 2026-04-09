'use client';

import React, { useState } from 'react';
import { useReveal } from '@/lib/hooks/useReveal';
import Link from 'next/link';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const revealRef = useReveal();

  return (
    <section className="pricing-section" id="pricing" ref={revealRef}>
      <div className="container">
        <div className="pricing-header reveal">
          <div className="section-label">Pricing</div>
          <h2 className="section-title">Investment in your peace of mind.</h2>
          <p className="section-sub">Start free, upgrade when you're ready for total power. No hidden fees.</p>
        </div>

        <div className="pricing-toggle reveal" style={{display: 'flex', justifyContent: 'center'}}>
          <div className="pricing-toggle">
            <div 
              className={`ptab ${!isAnnual ? 'active' : ''}`} 
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </div>
            <div 
              className={`ptab ${isAnnual ? 'active' : ''}`} 
              onClick={() => setIsAnnual(true)}
            >
              Annual (Save 20%)
            </div>
          </div>
        </div>

        <div className="pricing-grid reveal">
          {/* Free Tier */}
          <div className="pricing-card">
            <div className="plan-name">Free Forever</div>
            <div className="plan-price"><sup>$</sup>0</div>
            <div className="plan-period">per month</div>
            <ul className="plan-features">
              <li><span className="check">✓</span>Track up to 2 cards</li>
              <li><span className="check">✓</span>iPhone Shortcuts integration</li>
              <li><span className="check">✓</span>Basic categories</li>
              <li><span className="check">✓</span>Standard email support</li>
            </ul>
            <Link href="/register" className="plan-cta plan-cta-outline" style={{textAlign: 'center', display: 'block', textDecoration: 'none'}}>
              Start for free
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="pricing-card featured">
            <div className="plan-name">Pro</div>
            <div className="plan-price"><sup>$</sup>{isAnnual ? '4' : '5'}</div>
            <div className="plan-period">per month{isAnnual ? ', billed annually' : ''}</div>
            <ul className="plan-features">
              <li><span className="check">✓</span>Unlimited cards</li>
              <li><span className="check">✓</span>Auto-categorisation</li>
              <li><span className="check">✓</span>Custom budget alerts</li>
              <li><span className="check">✓</span>AI-powered spend insights</li>
              <li><span className="check">✓</span>Export to CSV/Excel</li>
            </ul>
            <Link href="/register" className="plan-cta plan-cta-fill" style={{textAlign: 'center', display: 'block', textDecoration: 'none'}}>
              Get Started Pro
            </Link>
          </div>

          {/* Family Tier */}
          <div className="pricing-card">
            <div className="plan-name">Family</div>
            <div className="plan-price"><sup>$</sup>{isAnnual ? '7' : '9'}</div>
            <div className="plan-period">per month{isAnnual ? ', billed annually' : ''}</div>
            <ul className="plan-features">
              <li><span className="check">✓</span>Everything in Pro</li>
              <li><span className="check">✓</span>Up to 10 family members</li>
              <li><span className="check">✓</span>Shared household dashboard</li>
              <li><span className="check">✓</span>Per-member spend analysis</li>
              <li><span className="check">✓</span>Granular card permissions</li>
            </ul>
            <Link href="/register" className="plan-cta plan-cta-outline" style={{textAlign: 'center', display: 'block', textDecoration: 'none'}}>
              Start 14-day free trial
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
