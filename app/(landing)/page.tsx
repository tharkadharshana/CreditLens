import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import LogosStrip from '@/components/landing/LogosStrip';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Platform from '@/components/landing/Platform';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <LogosStrip />
      <Features />
      <HowItWorks />
      <Platform />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
