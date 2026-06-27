import { AnimatedCounter } from '../components/AnimatedCounter';
import { useEntranceAnimation } from '../../../hooks';
import { motion } from 'framer-motion';

const METRICS = [
  { to: 500, suffix: '+', prefix: '', label: 'candidates evaluated' },
  { to: 3,   suffix: '×', prefix: '', label: 'faster time to hire' },
  { to: 98,  suffix: '%', prefix: '', label: 'candidate satisfaction' },
];

export function Metrics() {
  const { ref, isVisible } = useEntranceAnimation(true, 0.2);

  return (
    <section className="landing-metrics">
      <motion.div
        ref={ref}
        className="landing-metrics__inner"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
      >
        {METRICS.map(({ to, suffix, prefix, label }) => (
          <div key={label} className="landing-metric">
            <div className="landing-metric__number">
              <AnimatedCounter to={to} suffix={suffix} prefix={prefix} />
            </div>
            <p className="landing-metric__label">{label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
