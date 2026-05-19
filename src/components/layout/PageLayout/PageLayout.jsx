import { memo, useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from '../Sidebar';
import { Navbar } from '../Navbar';
import './PageLayout.css';

const EMPTY_NAV = [];
const EMPTY_BREADCRUMBS = [];

/* ── Media-query breakpoints (must match tokens.css) ── */
const BP_MOBILE = 768;
const BP_TABLET = 1024;

function getMode(width) {
  if (width < BP_MOBILE) return 'mobile';
  if (width < BP_TABLET) return 'tablet';
  return 'desktop';
}

function getInitialMode() {
  return typeof window === 'undefined' ? 'desktop' : getMode(window.innerWidth);
}

export const PageLayout = memo(function PageLayout({
  navItems = EMPTY_NAV,
  user,
  breadcrumbItems = EMPTY_BREADCRUMBS,
  logo,
  children,
  className = '',
  onNavigate,
}) {
  const [mode, setMode] = useState(getInitialMode);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mql640 = window.matchMedia(`(max-width: ${BP_MOBILE - 1}px)`);
    const mql1024 = window.matchMedia(`(max-width: ${BP_TABLET - 1}px)`);

    const update = () => {
      const newMode = getMode(window.innerWidth);
      setMode(newMode);
      if (newMode !== 'mobile') setDrawerOpen(false);
    };

    // Sync immediately and keep mode aligned with viewport changes.
    update();

    if (mql640.addEventListener) {
      mql640.addEventListener('change', update);
      mql1024.addEventListener('change', update);
    } else {
      mql640.addListener(update);
      mql1024.addListener(update);
    }

    window.addEventListener('resize', update);

    return () => {
      if (mql640.removeEventListener) {
        mql640.removeEventListener('change', update);
        mql1024.removeEventListener('change', update);
      } else {
        mql640.removeListener(update);
        mql1024.removeListener(update);
      }
      window.removeEventListener('resize', update);
    };
  }, []);

  const handleDrawerClose = useCallback(() => setDrawerOpen(false), []);
  const handleMenuToggle = useCallback(() => setDrawerOpen((prev) => !prev), []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  // Auto-close drawer when a nav item is clicked on mobile
  const wrappedNavItems = useMemo(
    () =>
      mode !== 'mobile'
        ? navItems
        : navItems.map((item) => ({
            ...item,
            onClick: () => {
              item.onClick?.();
              setDrawerOpen(false);
            },
            subItems: item.subItems?.map((sub) => ({
              ...sub,
              onClick: () => {
                sub.onClick?.();
                setDrawerOpen(false);
              },
            })),
          })),
    [navItems, mode]
  );

  const isMobile = mode === 'mobile';
  const isCollapsed = mode === 'tablet';

  return (
    <div
      className={[
        'page-layout',
        isMobile && 'page-layout--mobile',
        isMobile && drawerOpen && 'page-layout--drawer-open',
        isCollapsed && 'page-layout--tablet',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Sidebar
        logo={logo}
        navItems={wrappedNavItems}
        user={user}
        className="page-layout__sidebar"
        collapsed={isCollapsed}
        isDrawerOpen={drawerOpen}
        onDrawerClose={handleDrawerClose}
      />
      <div className="page-layout__main">
        <Navbar
          breadcrumbItems={breadcrumbItems}
          className="page-layout__navbar"
          user={user}
          onNavigate={onNavigate}
          showLogo={isMobile}
          logo={logo}
          onMenuToggle={isMobile ? handleMenuToggle : undefined}
        />
        <main className="page-layout__content">{children}</main>
      </div>
    </div>
  );
});

PageLayout.propTypes = {
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.elementType,
      label: PropTypes.string.isRequired,
      isActive: PropTypes.bool,
      onClick: PropTypes.func,
      separator: PropTypes.bool,
      subItems: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          isActive: PropTypes.bool,
          onClick: PropTypes.func,
        })
      ),
    })
  ),
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    icon: PropTypes.elementType,
  }),
  breadcrumbItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
      onClick: PropTypes.func,
    })
  ),
  logo: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  onNavigate: PropTypes.func,
};
