import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

const PARTICLE_COUNT = 600;

function ParticleCloud() {
  const ref = useRef();

  const positions = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 1.8 + Math.random() * 1.2;
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.06;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ff5d31" size={0.022} sizeAttenuation transparent opacity={0.85} />
    </points>
  );
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="landing-hero">
      <div className="landing-hero__canvas">
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 1.5]}>
          <ambientLight intensity={0.2} />
          <ParticleCloud />
          <EffectComposer>
            <Bloom intensity={0.5} luminanceThreshold={0.1} luminanceSmoothing={0.9} />
          </EffectComposer>
        </Canvas>
      </div>

      <div className="landing-hero__content">
        <motion.div
          className="landing-hero__text"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.span className="landing-label" variants={item}>
            HR Intelligence Platform
          </motion.span>
          <motion.h1 className="landing-hero__headline" variants={item}>
            Hire smarter.<br />Move faster.
          </motion.h1>
          <motion.p className="landing-hero__sub" variants={item}>
            AI-powered interviews, structured evaluations, and real-time candidate insights — in one place.
          </motion.p>
          <motion.div className="landing-hero__actions" variants={item}>
            <Button variant="primary" size="lg" onClick={() => navigate('/login')}>
              Get started
            </Button>
            <button
              className="landing-ghost-btn"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See how it works
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
