import { memo } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { SidebarButton } from '../../ui/SidebarButton';
import { User } from '../../ui/User';
import './Sidebar.css';

const EMPTY_NAV = [];

export const Sidebar = memo(function Sidebar({
  logo,
  navItems = EMPTY_NAV,
  user,
  className = '',
  collapsed = false,
  isDrawerOpen = false,
  onDrawerClose,
}) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={['sidebar-backdrop', isDrawerOpen && 'sidebar-backdrop--open']
          .filter(Boolean)
          .join(' ')}
        onClick={onDrawerClose}
        aria-hidden="true"
      />
      <aside
        className={[
          'sidebar',
          collapsed && 'sidebar--collapsed',
          isDrawerOpen && 'sidebar--drawer-open',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="sidebar__content">
          {/* Logo + close */}
          <div className="sidebar__logo">
            {logo || <span className="sidebar__logo-placeholder">VU</span>}
            {onDrawerClose && (
              <button
                type="button"
                className="sidebar__close"
                onClick={onDrawerClose}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="sidebar__nav">
            {navItems.map((item) => (
              <div key={item.id || item.label}>
                {item.separator && <div className="sidebar__separator" />}
                <SidebarButton
                  icon={item.icon}
                  label={item.label}
                  isActive={item.isActive}
                  onClick={item.onClick}
                  subItems={item.subItems}
                  collapsed={collapsed}
                />
              </div>
            ))}
          </nav>
        </div>

        {/* User */}
        {user && (
          <div className="sidebar__user">
            <User name={user.name} email={user.email} icon={user.icon} />
          </div>
        )}
      </aside>
    </>
  );
});

Sidebar.propTypes = {
  logo: PropTypes.node,
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.elementType,
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string.isRequired,
      isActive: PropTypes.bool,
      onClick: PropTypes.func,
      separator: PropTypes.bool,
      subItems: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
  className: PropTypes.string,
  collapsed: PropTypes.bool,
  isDrawerOpen: PropTypes.bool,
  onDrawerClose: PropTypes.func,
};
