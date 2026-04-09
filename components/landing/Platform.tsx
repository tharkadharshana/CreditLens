'use client';

import React from 'react';
import { useReveal } from '@/lib/hooks/useReveal';

const Platform = () => {
  const revealRef = useReveal();

  return (
    <section className="platform-section" id="platform" ref={revealRef}>
      <div className="container">
        <div className="platform-header reveal">
          <div className="section-label">The Platform</div>
          <h2 className="section-title">Beyond Credit Cards.</h2>
          <p className="section-sub">CreditLens is designed as an open ingest engine. While we focus on finance today, the architecture supports any data your iPhone can capture.</p>
        </div>

        <div className="platform-grid reveal">
          <div className="platform-item" style={{'--item-color': '#7c6cfa'} as any}>
            <div className="platform-icon">🏥</div>
            <div className="platform-name">Health & Fitness</div>
            <div className="platform-desc">Log workouts, water intake, or sleep data via Shortcuts to see health-wealth correlations.</div>
            <span className="platform-status" style={{background: 'rgba(124,108,250,0.1)', color: '#7c6cfa'}}>Q4 2025</span>
          </div>
          <div className="platform-item" style={{'--item-color': '#f4566a'} as any}>
            <div className="platform-icon">🏠</div>
            <div className="platform-name">Home Automation</div>
            <div className="platform-desc">Track energy usage or home maintenance logs through a unified command centre.</div>
            <span className="platform-status" style={{background: 'rgba(244,86,106,0.1)', color: '#f4566a'}}>Q1 2026</span>
          </div>
          <div className="platform-item" style={{'--item-color': '#1fd8a4'} as any}>
            <div className="platform-icon">📈</div>
            <div className="platform-name">Personal KPIs</div>
            <div className="platform-desc">Custom metrics. Log anything from "pages read" to "deep work hours" with one tap.</div>
            <span className="platform-status" style={{background: 'rgba(31,216,164,0.1)', color: '#1fd8a4'}}>Q1 2026</span>
          </div>
          <div className="platform-item" style={{'--item-color': '#4a9eff'} as any}>
            <div className="platform-icon">🔌</div>
            <div className="platform-name">Open API</div>
            <div className="platform-desc">Build your own integrations. Our ingest endpoint is fully documented and ready for your scripts.</div>
            <span className="platform-status" style={{background: 'rgba(74,158,255,0.1)', color: '#4a9eff'}}>Live</span>
          </div>
        </div>

        <div className="timeline reveal">
          <div className="timeline-item">
            <div className="tl-phase">Phase 1: Foundation</div>
            <div className="tl-title">Credit & Automation</div>
            <ul className="tl-items">
              <li>iPhone Shortcut Engine</li>
              <li>Multi-bank card tracking</li>
              <li>Family shared accounts</li>
            </ul>
          </div>
          <div className="timeline-item">
            <div className="tl-phase">Phase 2: Intelligence</div>
            <div className="tl-title">AI & Connectivity</div>
            <ul className="tl-items">
              <li>AI-powered spend insights</li>
              <li>Subscription detection</li>
              <li>Budget forecasting</li>
            </ul>
          </div>
          <div className="timeline-item">
            <div className="tl-phase">Phase 3: Ecosystem</div>
            <div className="tl-title">The Everything Log</div>
            <ul className="tl-items">
              <li>Health & Habit tracking</li>
              <li>Custom metric builder</li>
              <li>Third-party app marketplace</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Platform;
