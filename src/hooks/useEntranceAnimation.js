import { useEffect, useState, useRef } from 'react';

const DEFAULT_THRESHOLD = 0.2;

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function canAnimateEntrance(animated) {
  return (
    animated &&
    !prefersReducedMotion() &&
    typeof IntersectionObserver !== 'undefined'
  );
}

/**
 * Observes an element and flips `isVisible` to true once it enters the viewport.
 * If `animated` is false or the user prefers reduced motion, the element is visible immediately.
 *
 * @param {boolean} animated  Whether to animate entrance (default true)
 * @param {number}  threshold IntersectionObserver threshold (default 0.2)
 * @returns {{ ref: React.RefObject, isVisible: boolean }}
 */
export function useEntranceAnimation(animated = true, threshold = DEFAULT_THRESHOLD) {
  const ref = useRef(null);
  const shouldAnimate = canAnimateEntrance(animated);
  const [isVisible, setIsVisible] = useState(() => !shouldAnimate);

  useEffect(() => {
    if (!shouldAnimate) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [shouldAnimate, threshold]);

  return { ref, isVisible: isVisible || !shouldAnimate };
}
