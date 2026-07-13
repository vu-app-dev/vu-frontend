import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import './CardNav.css';

const DEFAULT_ITEMS = [
  { label: 'Product', href: '#platform' },
  { label: 'Company', href: '#experience' },
  { label: 'Buy', href: '/login' },
  { label: 'Contact', href: '#features' },
];

const MotionCursor = motion.li;

export const CardNav = ({ items = DEFAULT_ITEMS, className = '', ariaLabel = 'Primary' }) => {
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <nav className={['nav-tabs', className].filter(Boolean).join(' ')} aria-label={ariaLabel}>
      <ul
        className="nav-tabs__list"
        onMouseLeave={() => {
          setPosition((current) => ({
            ...current,
            opacity: 0,
          }));
        }}
      >
        {items.map((item) => (
          <Tab key={`${item.label}-${item.href}`} item={item} setPosition={setPosition} />
        ))}
        <Cursor position={position} />
      </ul>
    </nav>
  );
};

function Tab({ item, setPosition }) {
  const ref = useRef(null);

  return (
    <li
      ref={ref}
      className="nav-tabs__item"
      onMouseEnter={() => {
        if (!ref.current) return;

        const { width } = ref.current.getBoundingClientRect();
        setPosition({
          left: ref.current.offsetLeft,
          width,
          opacity: 1,
        });
      }}
    >
      <a className="nav-tabs__link" href={item.href}>
        {item.label}
      </a>
    </li>
  );
}

function Cursor({ position }) {
  return (
    <MotionCursor
      aria-hidden="true"
      className="nav-tabs__cursor"
      animate={position}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
    />
  );
}

CardNav.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
    })
  ),
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
};

Tab.propTypes = {
  item: PropTypes.shape({
    label: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
  }).isRequired,
  setPosition: PropTypes.func.isRequired,
};

Cursor.propTypes = {
  position: PropTypes.shape({
    left: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    opacity: PropTypes.number.isRequired,
  }).isRequired,
};

export default CardNav;
