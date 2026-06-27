import { useEffect } from 'react';
import Lenis from 'lenis';
import { LandingNav } from './components/LandingNav';
import { Hero } from './sections/Hero';
import { ProblemStats } from './sections/ProblemStats';
import { HowItWorks } from './sections/HowItWorks';
import { Features } from './sections/Features';
import { Metrics } from './sections/Metrics';
import { FinalCTA } from './sections/FinalCTA';
import './LandingPage.css';

export function LandingPage() {
  useEffect(() => {
    const lenis = new Lenis();
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    const id = requestAnimationFrame(raf);
    return () => { lenis.destroy(); cancelAnimationFrame(id); };
  }, []);

  return (
    <div className="landing-root">
      <LandingNav />
      <Hero />
      <ProblemStats />
      <HowItWorks />
      <Features />
      <Metrics />
      <FinalCTA />
      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} VU · All rights reserved</span>
      </footer>
    </div>
  );
}
