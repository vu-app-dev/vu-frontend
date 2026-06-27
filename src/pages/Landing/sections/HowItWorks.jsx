import { motion } from 'framer-motion';
import { useEntranceAnimation } from '../../../hooks';

const STEPS = [
  { num: '01', title: 'Post a job', desc: 'Define the role, attach mock interviews, and set evaluation criteria in minutes.' },
  { num: '02', title: 'Candidates apply', desc: 'A structured application flow with built-in async mock interviews — no scheduling needed.' },
  { num: '03', title: 'Evaluate & decide', desc: 'Side-by-side scoring, team collaboration, and ranked results in one workspace.' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function HowItWorks() {
  const { ref, isVisible } = useEntranceAnimation(true, 0.2);

  return (
    <section id="how-it-works" className="landing-section landing-how">
      <div className="landing-section__inner">
        <span className="landing-section-num">2.0</span>
        <h2 className="landing-section__title">How it works</h2>
        <motion.div
          ref={ref}
          className="landing-steps"
          variants={container}
          initial="hidden"
          animate={isVisible ? 'show' : 'hidden'}
        >
          {STEPS.map((step) => (
            <motion.div key={step.num} className="landing-step-card" variants={cardVariant}>
              <span className="landing-step-card__num">{step.num}</span>
              <h3 className="landing-step-card__title">{step.title}</h3>
              <p className="landing-step-card__desc">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
