import React from 'react';
import { syne, dmSans, dmMono } from '../fonts';
import '../landing.css';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}>
      {children}
    </div>
  );
}
