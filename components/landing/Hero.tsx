'use client';

import React from 'react';
import Link from 'next/link';
import { useReveal } from '@/lib/hooks/useReveal';

const Hero = () => {
  const revealRef = useReveal();

  return (
    <section className="hero">
      <div className="hero-grid"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="hero-badge">
        <div className="badge-dot"></div>
        Now in public beta · iPhone Shortcuts integration live
      </div>

      <h1 className="hero-headline">
        <span className="line1">Your iPhone.</span>
        <span className="line2">Supercharged.</span>
      </h1>

      <p className="hero-sub">
        CreditLens connects iPhone Shortcuts to a powerful command centre. Start with credit card tracking — grow into a complete personal automation platform.
      </p>

      <div className="hero-cta">
        <Link href="/register" className="btn-xl">
          Start for free
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
        <button className="btn-xl-ghost">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" />
          </svg>
          Watch demo
        </button>
      </div>

      <div className="hero-note">
        <span>✓ Free forever tier</span>
        <span>✓ No credit card required</span>
        <span>✓ 2-minute iPhone setup</span>
      </div>

      {/* DASHBOARD MOCKUP */}
      <div className="hero-mockup">
        <div className="mockup-glow"></div>
        <div className="mockup-frame">
          <div className="mockup-bar">
            <div className="mockup-dot" style={{ background: '#ff5f56' }}></div>
            <div className="mockup-dot" style={{ background: '#ffbd2e' }}></div>
            <div className="mockup-dot" style={{ background: '#27c93f' }}></div>
            <div className="mockup-url">app.creditlens.io/dashboard</div>
          </div>
          <div className="mockup-inner">
            {/* Sidebar */}
            <div className="mockup-sidebar">
              <div className="mock-logo">Credit<span>Lens</span></div>
              <div className="mock-nav">
                <div className="mock-item act"><div className="mock-pip"></div>Dashboard</div>
                <div className="mock-item"><div className="mock-pip"></div>Cards</div>
                <div className="mock-item"><div className="mock-pip"></div>Budgets</div>
                <div className="mock-item"><div className="mock-pip"></div>Transactions</div>
                <div className="mock-item"><div className="mock-pip" style={{ background: '#7c6cfa' }}></div>Analytics</div>
                <div className="mock-item"><div className="mock-pip"></div>Live Feed</div>
                <div className="mock-item"><div className="mock-pip"></div>Shortcuts</div>
              </div>
            </div>
            {/* Main area */}
            <div className="mockup-main">
              <div className="mock-header">
                <div className="mock-title">Command Centre</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ 
                    height: '20px', width: '70px', background: 'var(--bg3)', 
                    border: '1px solid var(--border)', borderRadius: '5px', 
                    display: 'flex', alignItems: 'center', padding: '0 8px', 
                    fontSize: '8px', color: 'var(--text3)' 
                  }}>
                    Setup iPhone
                  </div>
                  <div style={{ 
                    height: '20px', width: '60px', background: 'var(--accent)', 
                    borderRadius: '5px', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', fontSize: '8px', color: '#fff' 
                  }}>
                    + Add Card
                  </div>
                </div>
              </div>
              <div className="mock-stats">
                <div className="mock-stat"><div className="mock-stat-label">Available Credit</div><div className="mock-stat-val" style={{ color: '#1fd8a4', fontSize: '13px' }}>241,350</div><div className="mock-stat-sub">LKR · 61% avail</div></div>
                <div className="mock-stat"><div className="mock-stat-label">Monthly Spend</div><div className="mock-stat-val" style={{ color: '#f5a623', fontSize: '13px' }}>58,450</div><div className="mock-stat-sub">LKR · this period</div></div>
                <div className="mock-stat"><div className="mock-stat-label">Daily Avg</div><div className="mock-stat-val" style={{ color: '#4a9eff', fontSize: '13px' }}>1,948</div><div className="mock-stat-sub">LKR · 30 days</div></div>
                <div className="mock-stat"><div className="mock-stat-label">Outstanding</div><div className="mock-stat-val" style={{ color: '#f4566a', fontSize: '13px' }}>151,650</div><div className="mock-stat-sub">LKR · 3 cards</div></div>
              </div>
              <div className="mock-row">
                <div className="mock-card">
                  <div className="mock-card-head">Recent Transactions</div>
                  <div className="mock-tx"><div className="mock-tx-dot" style={{ background: 'rgba(249,115,22,0.15)' }}>🍔</div><div className="mock-tx-name">Pizza Hut<div style={{ fontSize: '7px', color: 'var(--text3)' }}>via Shortcut · food</div></div><div className="mock-tx-amt" style={{ color: '#f4566a' }}>-2,850</div></div>
                  <div className="mock-tx"><div className="mock-tx-dot" style={{ background: 'rgba(59,130,246,0.15)' }}>🚗</div><div className="mock-tx-name">PickMe<div style={{ fontSize: '7px', color: 'var(--text3)' }}>via Shortcut · transport</div></div><div className="mock-tx-amt" style={{ color: '#f4566a' }}>-1,200</div></div>
                  <div className="mock-tx"><div className="mock-tx-dot" style={{ background: 'rgba(139,92,246,0.15)' }}>🛍️</div><div className="mock-tx-name">Keells Super<div style={{ fontSize: '7px', color: 'var(--text3)' }}>manual · shopping</div></div><div className="mock-tx-amt" style={{ color: '#f4566a' }}>-4,320</div></div>
                  <div className="mock-tx"><div className="mock-tx-dot" style={{ background: 'rgba(31,216,164,0.15)' }}>💰</div><div className="mock-tx-name">HSBC Payment<div style={{ fontSize: '7px', color: 'var(--text3)' }}>manual · payment</div></div><div className="mock-tx-amt" style={{ color: '#1fd8a4' }}>+15,000</div></div>
                  <div style={{ marginTop: '8px' }}>
                    <div className="mock-card-head" style={{ marginBottom: '6px' }}>30-Day Trend</div>
                    <div className="mock-bars">
                      <div className="mock-bar" style={{ height: '30%' }}></div><div className="mock-bar" style={{ height: '60%' }}></div><div className="mock-bar" style={{ height: '25%' }}></div>
                      <div className="mock-bar" style={{ height: '75%' }}></div><div className="mock-bar" style={{ height: '40%' }}></div><div className="mock-bar" style={{ height: '85%' }}></div>
                      <div className="mock-bar" style={{ height: '50%' }}></div><div className="mock-bar" style={{ height: '70%' }}></div><div className="mock-bar" style={{ height: '35%' }}></div>
                      <div className="mock-bar" style={{ height: '90%' }}></div><div className="mock-bar" style={{ height: '55%' }}></div><div className="mock-bar" style={{ height: '100%' }}></div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="mock-card">
                    <div className="mock-card-head">Spend Mix</div>
                    <div className="mock-donut">
                      <svg width="50" height="50" viewBox="0 0 50 50">
                        <circle cx="25" cy="25" r="18" fill="none" stroke="var(--bg4)" strokeWidth="8"/>
                        <circle cx="25" cy="25" r="18" fill="none" stroke="#f97316" strokeWidth="8" strokeDasharray="34 79" strokeDashoffset="0" transform="rotate(-90 25 25)"/>
                        <circle cx="25" cy="25" r="18" fill="none" stroke="#3b82f6" strokeWidth="8" strokeDasharray="24 79" strokeDashoffset="-34" transform="rotate(-90 25 25)"/>
                        <circle cx="25" cy="25" r="18" fill="none" stroke="#8b5cf6" strokeWidth="8" strokeDasharray="14 79" strokeDashoffset="-58" transform="rotate(-90 25 25)"/>
                        <circle cx="25" cy="25" r="18" fill="none" stroke="#22d3a0" strokeWidth="8" strokeDasharray="7 79" strokeDashoffset="-72" transform="rotate(-90 25 25)"/>
                      </svg>
                      <div>
                        <div className="mock-legend-item"><div className="mock-legend-dot" style={{ background: '#f97316' }}></div>Food 43%</div>
                        <div className="mock-legend-item"><div className="mock-legend-dot" style={{ background: '#3b82f6' }}></div>Transport 31%</div>
                        <div className="mock-legend-item"><div className="mock-legend-dot" style={{ background: '#8b5cf6' }}></div>Shopping 18%</div>
                      </div>
                    </div>
                  </div>
                  <div className="mock-card">
                    <div className="mock-card-head">Your Cards</div>
                    <div className="mock-cc" style={{ background: 'linear-gradient(135deg,#0f3460,#533483)' }}>
                      <div className="mock-cc-bank" style={{ color: '#fff' }}>HSBC Platinum</div>
                      <div className="mock-cc-num" style={{ color: 'rgba(255,255,255,0.6)' }}>**** **** **** 4521</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px', color: 'rgba(255,255,255,0.6)' }}><span>Available: 91,350</span><span>39%</span></div>
                      <div className="mock-cc-bar"><div className="mock-cc-fill" style={{ width: '39%', background: '#f5a623' }}></div></div>
                    </div>
                    <div className="mock-cc" style={{ background: 'linear-gradient(135deg,#134e4a,#065f46)' }}>
                      <div className="mock-cc-bank" style={{ color: '#fff' }}>Sampath World MC</div>
                      <div className="mock-cc-num" style={{ color: 'rgba(255,255,255,0.6)' }}>**** **** **** 8832</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px', color: 'rgba(255,255,255,0.6)' }}><span>Available: 27,600</span><span>72%</span></div>
                      <div className="mock-cc-bar"><div className="mock-cc-fill" style={{ width: '72%', background: '#f4566a' }}></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
