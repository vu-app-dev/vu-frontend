import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function useLandingLenis() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    const navigationType = window.performance?.getEntriesByType?.('navigation')?.[0]?.type;
    let lenis = null;
    let frameId = null;
    let hashFrameId = null;

    const scrollToCurrentHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;

      const target = document.getElementById(id);
      if (!target) return;

      if (lenis) {
        lenis.scrollTo(target, { immediate: true });
      } else {
        target.scrollIntoView();
      }
    };

    const restoreInitialScroll = () => {
      if (window.location.hash) {
        scrollToCurrentHash();
        return;
      }

      if (navigationType !== 'reload') return;

      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    };

    const stopLenis = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }

      if (hashFrameId !== null) {
        window.cancelAnimationFrame(hashFrameId);
        hashFrameId = null;
      }

      if (lenis) {
        lenis.destroy();
        lenis = null;
      }
    };

    const startLenis = () => {
      if (reducedMotion.matches || lenis) return;

      lenis = new Lenis({
        anchors: {
          lerp: 0.12,
        },
        lerp: 0.085,
        smoothWheel: true,
        syncTouch: false,
        touchMultiplier: 1,
        wheelMultiplier: 0.92,
        stopInertiaOnNavigate: true,
      });

      const raf = (time) => {
        lenis?.raf(time);
        frameId = window.requestAnimationFrame(raf);
      };

      frameId = window.requestAnimationFrame(raf);
    };

    const handleMotionPreferenceChange = () => {
      stopLenis();
      startLenis();
    };

    startLenis();
    hashFrameId = window.requestAnimationFrame(() => {
      hashFrameId = window.requestAnimationFrame(restoreInitialScroll);
    });
    reducedMotion.addEventListener('change', handleMotionPreferenceChange);
    window.addEventListener('hashchange', scrollToCurrentHash);
    window.addEventListener('pageshow', restoreInitialScroll);

    return () => {
      reducedMotion.removeEventListener('change', handleMotionPreferenceChange);
      window.removeEventListener('hashchange', scrollToCurrentHash);
      window.removeEventListener('pageshow', restoreInitialScroll);
      stopLenis();
    };
  }, []);
}
