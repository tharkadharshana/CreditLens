import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="logo">Credit<span>Lens</span></div>
          <p>Your iPhone. Supercharged. Start with credit card management — grow into a complete personal automation platform powered by Apple Shortcuts.</p>
          <div className="footer-social" style={{ marginTop: '20px' }}>
            <a href="#" className="social-btn">𝕏</a>
            <a href="#" className="social-btn" title="GitHub">⌥</a>
            <a href="#" className="social-btn" title="Discord">⊕</a>
          </div>
        </div>
        <div className="footer-col">
          <h5>Product</h5>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#">Changelog</a></li>
            <li><a href="#">Roadmap</a></li>
            <li><a href="#">Status</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Developers</h5>
          <ul>
            <li><a href="#">API Docs</a></li>
            <li><a href="#">Shortcut Setup</a></li>
            <li><a href="#">Ingest Reference</a></li>
            <li><a href="#">GitHub</a></li>
            <li><a href="#">SDKs</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Company</h5>
          <ul>
            <li><a href="#">About</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 CreditLens. Built in Sri Lanka 🇱🇰</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }}></span>
          All systems operational
        </span>
      </div>
    </footer>
  );
};

export default Footer;
