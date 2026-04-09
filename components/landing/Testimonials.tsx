'use client';

import React from 'react';
import { useReveal } from '@/lib/hooks/useReveal';

const Testimonials = () => {
  const revealRef = useReveal();

  return (
    <section className="testimonials-section" ref={revealRef}>
      <div className="container">
        <div className="testimonials-grid reveal">
          <div className="testimonial">
            <div className="stars">★★★★★</div>
            <p className="testimonial-quote">Finally, an app that doesn't ask for my bank password. I log my Keells and PickMe spends in 2 seconds from the home screen. Pure magic.</p>
            <div className="testimonial-author">
              <div className="author-avatar" style={{background: 'var(--bg4)', color: 'var(--accent)'}}>AK</div>
              <div>
                <div className="author-name">Arjun K.</div>
                <div className="author-role">Tech Lead · Colombo</div>
              </div>
            </div>
          </div>
          <div className="testimonial">
            <div className="stars">★★★★★</div>
            <p className="testimonial-quote">Managing 4 credit cards used to be a nightmare of checking multiple apps. Now I see everything in one dashboard. The utilization rings are a lifesaver.</p>
            <div className="testimonial-author">
              <div className="author-avatar" style={{background: 'var(--bg4)', color: 'var(--green)'}}>SD</div>
              <div>
                <div className="author-name">Sarah D.</div>
                <div className="author-role">Digital Nomad</div>
              </div>
            </div>
          </div>
          <div className="testimonial">
            <div className="stars">★★★★★</div>
            <p className="testimonial-quote">The Shortcuts integration is the killer feature. I've even set up a Siri command to log my morning coffee. CreditLens is the future of data ingest.</p>
            <div className="testimonial-author">
              <div className="author-avatar" style={{background: 'var(--bg4)', color: 'var(--amber)'}}>TM</div>
              <div>
                <div className="author-name">Tharka M.</div>
                <div className="author-role">Product Designer</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
