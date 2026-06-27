import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function AnimatedCounter({ to, suffix = '', prefix = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: to,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        once: true,
      },
      onUpdate() {
        el.textContent = prefix + Math.round(obj.val) + suffix;
      },
    });
    return () => { tween.kill(); };
  }, [to, suffix, prefix]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}
