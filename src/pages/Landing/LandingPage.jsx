import { useEffect, useRef, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowDownRight, ShieldCheck } from 'lucide-react';
import PixelBlast from '../../components/reactbits/PixelBlast';
import {
  AudienceSection,
  CapabilityIndex,
  DecisionRoom,
  EvidenceFlow,
  FinalCTA,
  LandingFooter,
  LandingHeader,
  LandingShowcase,
} from './components';
import { useLandingLenis } from './useLandingLenis';
import { getActiveTheme, THEMES, toggleTheme as toggleAppTheme } from '../../utils';
import './LandingPage.css';

const heroRoutes = [
  {
    label: 'Candidate experience',
    meta: 'Clear from setup to finish',
    copy: 'A focused interview with visible progress.',
    href: '#why-vu',
  },
  {
    label: 'Hiring team',
    meta: 'Evidence ready to review',
    copy: 'CV, transcript, integrity, and report. Connected.',
    href: '#decisions',
  },
];

export function LandingPage() {
  useLandingLenis();

  const showcaseRef = useRef(null);
  const landingRootRef = useRef(null);
  const heroContentRef = useRef(null);
  const heroRoutesRef = useRef(null);
  const scrollIndicatorRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [theme, setTheme] = useState(() => getActiveTheme());
  const [hideNavigation, setHideNavigation] = useState(false);
  const [isHeroBackgroundActive, setIsHeroBackgroundActive] = useState(true);
  const { scrollYProgress } = useScroll({
    target: showcaseRef,
    offset: ['start end', 'start 18%'],
  });
  const showcaseScale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
  const showcaseY = useTransform(scrollYProgress, [0, 1], [54, 0]);
  const isLightTheme = theme === THEMES.light;

  const handleThemeToggle = () => {
    setTheme((currentTheme) => toggleAppTheme(currentTheme));
  };

  useEffect(() => {
    document.documentElement.classList.add('landing-page-active');
    return () => document.documentElement.classList.remove('landing-page-active');
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let frame = 0;
    let navigationHidden = false;
    let heroBackgroundActive = true;

    const updateLandingScroll = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const page = document.documentElement;
      const scrollMax = Math.max(page.scrollHeight - page.clientHeight, 1);
      const progress = Math.min(currentScrollY / scrollMax, 1);
      const thumbHeight = Math.min(Math.max((page.clientHeight / page.scrollHeight) * 100, 6), 18);
      const shouldHideNavigation = currentScrollY > 104 && currentScrollY > lastScrollY;
      const shouldKeepHeroBackground = currentScrollY < window.innerHeight * 1.08;
      const heroProgress = reduceMotion
        ? 0
        : Math.min(currentScrollY / Math.max(window.innerHeight * 0.86, 1), 1);
      const heroContentOpacity = 1 - heroProgress * 0.7;
      const heroRoutesOpacity = 1 - heroProgress * 0.9;
      const heroDim = heroProgress * 0.62;

      if (shouldHideNavigation !== navigationHidden) {
        navigationHidden = shouldHideNavigation;
        setHideNavigation(shouldHideNavigation);
      }

      if (shouldKeepHeroBackground !== heroBackgroundActive) {
        heroBackgroundActive = shouldKeepHeroBackground;
        setIsHeroBackgroundActive(shouldKeepHeroBackground);
      }

      heroContentRef.current?.style.setProperty('--landing-hero-opacity', heroContentOpacity);
      heroRoutesRef.current?.style.setProperty('--landing-hero-opacity', heroRoutesOpacity);
      landingRootRef.current?.style.setProperty('--landing-hero-dim', heroDim);
      scrollIndicatorRef.current?.style.setProperty('--landing-scroll-top', `${progress * (100 - thumbHeight)}%`);
      scrollIndicatorRef.current?.style.setProperty('--landing-scroll-height', `${thumbHeight}%`);

      lastScrollY = currentScrollY;
      frame = 0;
    };

    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateLandingScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    updateLandingScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reduceMotion]);

  return (
    <div ref={landingRootRef} className="landing-root">
      <LandingHeader
        hideNavigation={hideNavigation}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />

      <div className="landing-pixel-background" aria-hidden="true">
        {isHeroBackgroundActive ? (
          <PixelBlast
            variant="square"
            pixelSize={4}
            color={isLightTheme ? '#cc4423' : '#ff5d31'}
            patternScale={3}
            patternDensity={0.9}
            pixelSizeJitter={0.1}
            enableRipples={!reduceMotion}
            globalRipples={!reduceMotion}
            rippleSpeed={0.22}
            rippleThickness={0.08}
            rippleIntensityScale={0.9}
            liquid={false}
            speed={reduceMotion ? 0 : 0.3}
            edgeFade={0.12}
            noiseAmount={0}
            transparent
          />
        ) : null}
      </div>
      <div className="landing-hero-dimmer" aria-hidden="true" />

      <div ref={scrollIndicatorRef} className="landing-scroll-indicator" aria-hidden="true">
        <span />
      </div>

      <main id="top">
        <section className="landing-hero" aria-labelledby="landing-hero-title">
          <div ref={heroContentRef} className="landing-hero__content">
            <motion.div
              className="landing-hero__badge"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42 }}
            >
              <ShieldCheck size={14} aria-hidden="true" />
              Structured interview intelligence
            </motion.div>
            <motion.h1
              id="landing-hero-title"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <span>Your Virtual</span>
              <span>Interview</span>
            </motion.h1>
            <motion.p
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            >
              Run adaptive interviews and turn every answer into evidence your hiring team can review.
            </motion.p>
          </div>

          <motion.div
            ref={heroRoutesRef}
            className="landing-hero__routes"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {heroRoutes.map((route) => (
              <a key={route.label} href={route.href}>
                <span>{route.label}<em>{route.meta}</em></span>
                <strong>{route.copy}</strong>
                <ArrowDownRight size={16} aria-hidden="true" />
              </a>
            ))}
          </motion.div>
        </section>

        <section className="landing-scroll-sheet" aria-label="VU platform">
          <section id="platform" ref={showcaseRef} className="landing-showcase" aria-label="Platform overview">
            <motion.div
              className="landing-showcase__motion"
              style={{
                scale: reduceMotion ? 1 : showcaseScale,
                y: reduceMotion ? 0 : showcaseY,
              }}
            >
              <div className="landing-showcase__heading">
                <span>Inside VU</span>
                <h2>Interview intelligence, connected.</h2>
                <p>From CV context to shortlist, every signal stays linked to the candidate.</p>
              </div>
              <LandingShowcase />
            </motion.div>
          </section>

          <EvidenceFlow />
          <DecisionRoom />
          <AudienceSection />
          <CapabilityIndex />
          <FinalCTA />
          <LandingFooter />
        </section>
      </main>
    </div>
  );
}
