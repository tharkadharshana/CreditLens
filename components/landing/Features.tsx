'use client';

import React from 'react';
import { useReveal } from '@/lib/hooks/useReveal';

const Features = () => {
  const revealRef = useReveal();

  return (
    <section className="features-section" id="features" ref={revealRef}>
      <div className="container">
        <div className="features-header reveal">
          <div className="section-label">Features</div>
          <h2 className="section-title">Everything your wallet needs.<br />Nothing it doesn't.</h2>
          <p className="section-sub">Built for power users who want real control — not another app that just shows you a graph.</p>
        </div>
        <div className="features-grid reveal">
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <div className="feature-title">iPhone Shortcuts Native</div>
            <div className="feature-desc">Tap once on your home screen to log a transaction. Our REST API accepts Shortcut data with a single POST — no app switching, no friction.</div>
            <span className="feature-tag feat-live">Live now</span>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🃏</div>
            <div className="feature-title">Multi-Card Command Centre</div>
            <div className="feature-desc">Every card in one view. Utilization rings, due date countdowns, statement cycles, available credit — all at a glance across every bank.</div>
            <span className="feature-tag feat-live">Live now</span>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <div className="feature-title">Auto-Categorisation</div>
            <div className="feature-desc">Merchant names are intelligently matched to categories. Pizza Hut becomes food, PickMe becomes transport — automatically, every time.</div>
            <span className="feature-tag feat-live">Live now</span>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👨‍👩‍👧</div>
            <div className="feature-title">Family Finance Hub</div>
            <div className="feature-desc">Invite household members with granular roles. See who spent what, share cards selectively, and manage the whole family's credit from one account.</div>
            <span className="feature-tag feat-live">Live now</span>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <div className="feature-title">Smart Budget Alerts</div>
            <div className="feature-desc">Set per-category, per-card budgets. Get alerted the moment you hit 80% — before you overspend, not after. Triggered in real-time via Shortcuts.</div>
            <span className="feature-tag feat-live">Live now</span>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <div className="feature-title">Live Statement View</div>
            <div className="feature-desc">See your exact statement balance right now — not end of month. Opening balance, current spend, minimum due, available credit — always live.</div>
            <span className="feature-tag feat-live">Live now</span>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <div className="feature-title">AI Spend Insights</div>
            <div className="feature-desc">Monthly AI-generated summaries of your patterns. "You spent 34% more on dining this month. Here's why and how to fix it."</div>
            <span className="feature-tag feat-coming">Coming Q3 2025</span>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔁</div>
            <div className="feature-title">Recurring Detection</div>
            <div className="feature-desc">Subscriptions and recurring charges are automatically flagged so you always know what's coming before the statement does.</div>
            <span className="feature-tag feat-coming">Coming Q3 2025</span>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <div className="feature-title">Open Shortcut Platform</div>
            <div className="feature-desc">Beyond finance — any iPhone Shortcut can push data to CreditLens. Health, habits, home automation, productivity. The platform grows with you.</div>
            <span className="feature-tag feat-coming">Coming Q4 2025</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
