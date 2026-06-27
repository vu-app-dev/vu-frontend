import { motion } from 'framer-motion';
import { ClipboardCheck, Sparkles, Users, UserCheck, BarChart2, Briefcase } from 'lucide-react';
import { useEntranceAnimation } from '../../../hooks';

const FEATURES = [
  { icon: ClipboardCheck, title: 'Structured Mocks', desc: 'Consistent, bias-free screening with configurable topic weights.' },
  { icon: Sparkles, title: 'AI Scoring', desc: 'Objective evaluation across criteria — not gut feel.' },
  { icon: Users, title: 'Candidate Pipeline', desc: 'Visual pipeline from application to offer, always up to date.' },
  { icon: UserCheck, title: 'Team Collaboration', desc: 'Multiple reviewers, role-based access: owner, editor, viewer.' },
  { icon: BarChart2, title: 'Real-time Insights', desc: 'Live dashboards on conversion, time-to-hire, and drop-off.' },
  { icon: Briefcase, title: 'Branded Experience', desc: 'Candidates see your company — not a generic hiring tool.' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function Features() {
  const { ref, isVisible } = useEntranceAnimation(true, 0.15);

  return (
    <section className="landing-section landing-features">
      <div className="landing-section__inner">
        <span className="landing-section-num">3.0</span>
        <h2 className="landing-section__title">Everything your team needs</h2>
        <motion.div
          ref={ref}
          className="landing-features-grid"
          variants={container}
          initial="hidden"
          animate={isVisible ? 'show' : 'hidden'}
        >
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} className="landing-feature-card" variants={cardVariant}>
              <div className="landing-feature-card__icon">
                <Icon size={20} />
              </div>
              <h3 className="landing-feature-card__title">{title}</h3>
              <p className="landing-feature-card__desc">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
