'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav style={{ 
      background: scrolled ? 'rgba(9,9,13,0.92)' : 'rgba(9,9,13,0.7)' 
    }}>
      <Link href="/" className="nav-logo">
        Credit<span>Lens</span>
      </Link>
      <div className="nav-links">
        <a href="#features">Features</a>
        <a href="#platform">Platform</a>
        <a href="#pricing">Pricing</a>
        <a href="#docs">Docs</a>
        <a href="#changelog">Changelog</a>
      </div>
      <div className="nav-right">
        <Link href="/login" className="btn-ghost">Sign in</Link>
        <Link href="/register" className="btn-primary">
          Get started free
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
