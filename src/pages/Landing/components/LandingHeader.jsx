import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ArrowUpRight, Menu, Moon, Sun, X } from 'lucide-react';
import { LandingBrand } from './LandingBrand';
import { THEMES } from '../../../utils';

const navigation = [
  { label: 'Platform', href: '#platform' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Decisions', href: '#decisions' },
  { label: 'Why VU', href: '#why-vu' },
];

export function LandingHeader({ hideNavigation = false, theme, onThemeToggle }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLightTheme = theme === THEMES.light;

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  return (
    <header className={`landing-nav${hideNavigation ? ' landing-nav--tabs-hidden' : ''}`}>
      <a href="#top" className="landing-nav__brand" aria-label="VU home">
        <LandingBrand />
      </a>

      <nav className="landing-nav__links" aria-label="Landing page">
        {navigation.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="landing-nav__actions">
        <button
          type="button"
          className="landing-nav__theme"
          onClick={onThemeToggle}
          aria-label={isLightTheme ? 'Switch to dark mode' : 'Switch to light mode'}
          title={isLightTheme ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {isLightTheme ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
        </button>
        <a className="landing-nav__start" href="/login">
          <span>Get started</span>
          <span className="landing-nav__start-icon" aria-hidden="true">
            <ArrowUpRight size={15} />
          </span>
        </a>
        <button
          type="button"
          className="landing-nav__menu-button"
          aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isMenuOpen}
          aria-controls="landing-mobile-menu"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <nav
        id="landing-mobile-menu"
        className={`landing-nav__mobile${isMenuOpen ? ' is-open' : ''}`}
        aria-label="Mobile landing page"
      >
        {navigation.map((item) => (
          <a key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
            {item.label}
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        ))}
      </nav>
    </header>
  );
}

LandingHeader.propTypes = {
  hideNavigation: PropTypes.bool,
  theme: PropTypes.oneOf(Object.values(THEMES)).isRequired,
  onThemeToggle: PropTypes.func.isRequired,
};
