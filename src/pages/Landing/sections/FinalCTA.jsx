import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { useEntranceAnimation } from '../../../hooks';

export function FinalCTA() {
  const navigate = useNavigate();
  const { ref, isVisible } = useEntranceAnimation(true, 0.3);

  return (
    <section className="landing-cta">
      <motion.div
        ref={ref}
        className="landing-cta__inner"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={isVisible ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="landing-cta__headline">Ready to transform your hiring?</h2>
        <p className="landing-cta__sub">Start for free — no credit card required.</p>
        <Button variant="primary" size="lg" onClick={() => navigate('/login')}>
          Get Started
        </Button>
      </motion.div>
    </section>
  );
}
