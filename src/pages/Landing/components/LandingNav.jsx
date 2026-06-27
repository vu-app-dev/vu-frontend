import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLogo } from '../../../components/ui/AppLogo';
import { Button } from '../../../components/ui/Button';

export function LandingNav() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={['landing-nav', scrolled && 'landing-nav--scrolled'].filter(Boolean).join(' ')}>
      <div className="landing-nav__inner">
        <AppLogo size="md" />
        <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
          Get started
        </Button>
      </div>
    </nav>
  );
}
