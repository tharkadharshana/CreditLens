'use client';

import React, { useState, useEffect } from 'react';
import { useReveal } from '@/lib/hooks/useReveal';

const steps = [
  {
    title: 'Add your cards',
    desc: 'Enter your card details — bank, limit, statement day, due date. Takes 60 seconds per card. No bank login required, ever.'
  },
  {
    title: 'Copy your API key',
    desc: 'One click to copy your unique key from Settings. This authenticates your iPhone Shortcuts without any login flow.'
  },
  {
    title: 'Set up the Shortcut',
    desc: 'Our Shortcut Helper walks you through every step. Paste your API key + card ID, add it to your home screen. Done in under 2 minutes.'
  },
  {
    title: 'Tap. Log. Done.',
    desc: 'Every time you spend, tap your Shortcut. Enter the amount and merchant. CreditLens receives it instantly, updates your balance, and checks your budgets.'
  }
];

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const revealRef = useReveal();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="how-section" id="how" ref={revealRef}>
      <div className="container">
        <div className="how-grid">
          <div>
            <div className="section-label reveal">How It Works</div>
            <h2 className="section-title reveal">From tap to<br />tracked in seconds.</h2>
            <div className="steps">
              {steps.map((step, idx) => (
                <div 
                  key={idx} 
                  className={`step ${activeStep === idx ? 'active' : ''}`} 
                  onClick={() => setActiveStep(idx)}
                >
                  <div className="step-num">{String(idx + 1).padStart(2, '0')}</div>
                  <div className="step-content">
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="how-visual">
            {/* Visual Panel 0 */}
            <div className={`visual-panel ${activeStep === 0 ? 'active' : ''}`} style={{ display: activeStep === 0 ? 'flex' : 'none' }}>
              <div className="mock-card" style={{ width: '100%' }}>
                <div className="mock-card-head">Add New Card</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                  <div style={{ height: '30px', background: 'var(--bg4)', borderRadius: '6px' }}></div>
                  <div style={{ height: '30px', background: 'var(--bg4)', borderRadius: '6px' }}></div>
                  <div style={{ height: '30px', background: 'var(--accent)', borderRadius: '6px' }}></div>
                </div>
              </div>
            </div>

            {/* Visual Panel 1 */}
            <div className={`visual-panel ${activeStep === 1 ? 'active' : ''}`} style={{ display: activeStep === 1 ? 'flex' : 'none' }}>
              <div className="api-block">
                <span className="json-brace">{'{'}</span><br />
                &nbsp;&nbsp;<span className="json-key">"api_key"</span>: <span className="json-str">"cl_live_7x9yk2..."</span>,<br />
                &nbsp;&nbsp;<span className="json-key">"status"</span>: <span className="json-str">"active"</span><br />
                <span className="json-brace">{'}'}</span>
              </div>
            </div>

            {/* Visual Panel 2 */}
            <div className={`visual-panel ${activeStep === 2 ? 'active' : ''}`} style={{ display: activeStep === 2 ? 'flex' : 'none' }}>
              <div className="phone-mock">
                <div className="phone-notch"></div>
                <div className="phone-screen">
                  <div className="phone-shortcut-item">
                    <div className="shortcut-icon" style={{ background: '#7c6cfa' }}>⚡</div>
                    <div>
                      <div className="shortcut-name">Log Transaction</div>
                      <div className="shortcut-desc">CreditLens Integration</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Panel 3 */}
            <div className={`visual-panel ${activeStep === 3 ? 'active' : ''}`} style={{ display: activeStep === 3 ? 'flex' : 'none' }}>
              <div className="mock-stat" style={{ width: '100%' }}>
                <div className="mock-stat-label">Last Ingested</div>
                <div className="mock-stat-val" style={{ color: 'var(--green)' }}>Success</div>
                <div className="mock-stat-sub">Keells Super · 2,450 LKR</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
