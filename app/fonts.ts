import { Syne, DM_Sans, DM_Mono } from 'next/font/google';

export const syne = Syne({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

export const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});
