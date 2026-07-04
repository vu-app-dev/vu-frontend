import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import './CardNav.css';

const MotionCursor = motion.li;

export const CardNav = () => {
  return <SlideTabs />;
};

const SlideTabs = () => {
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <ul
      onMouseLeave={() => {
        setPosition((pv) => ({
          ...pv,
          opacity: 0,
        }));
      }}
      className="card-nav__tabs"
    >
      <Tab setPosition={setPosition}>Home</Tab>
      <Tab setPosition={setPosition}>Pricing</Tab>
      <Tab setPosition={setPosition}>Features</Tab>
      <Tab setPosition={setPosition}>Docs</Tab>
      <Tab setPosition={setPosition}>Blog</Tab>

      <Cursor position={position} />
    </ul>
  );
};

const Tab = ({ children, setPosition }) => {
  const ref = useRef(null);

  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref?.current) return;

        const { width } = ref.current.getBoundingClientRect();

        setPosition({
          left: ref.current.offsetLeft,
          width,
          opacity: 1,
        });
      }}
      className="card-nav__tab"
    >
      {children}
    </li>
  );
};

const Cursor = ({ position }) => {
  return (
    <MotionCursor
      animate={{
        ...position,
      }}
      className="card-nav__cursor"
    />
  );
};

export default CardNav;
