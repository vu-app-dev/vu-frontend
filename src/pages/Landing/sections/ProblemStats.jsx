import { motion } from 'framer-motion';
import { useEntranceAnimation } from '../../../hooks';

const STATS = [
  { stat: '73%', description: 'of hiring managers say unstructured interviews lead to bias and inconsistent decisions.' },
  { stat: '2×', description: 'longer time-to-hire when candidate evaluation relies on manual processes.' },
  { stat: '60%', description: 'of candidates drop off due to poor application experience.' },
];

function StatRow({ stat, description, index }) {
  const { ref, isVisible } = useEntranceAnimation(true, 0.3);
  return (
    <motion.div
      ref={ref}
      className="landing-stat-row"
      initial={{ opacity: 0, y: 28 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="landing-stat-row__number">{stat}</span>
      <p className="landing-stat-row__desc">{description}</p>
    </motion.div>
  );
}

export function ProblemStats() {
  return (
    <section className="landing-section landing-problem">
      <div className="landing-section__inner">
        <span className="landing-section-num">1.0</span>
        <h2 className="landing-section__title">The problem with hiring today</h2>
        <div className="landing-stats-list">
          {STATS.map((s, i) => (
            <StatRow key={s.stat} {...s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
