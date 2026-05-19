import { memo } from 'react';
import PropTypes from 'prop-types';
import './SidebarButton.css';

const EMPTY_SUBITEMS = [];

export const SidebarButton = memo(function SidebarButton({
  icon: Icon,
  label,
  isActive = false,
  onClick,
  subItems = EMPTY_SUBITEMS,
  collapsed = false,
  className = '',
}) {
  const hasSubItems = subItems.length > 0;
  const hasActiveSubItem = hasSubItems && subItems.some((item) => item.isActive);
  const isButtonActive = isActive || hasActiveSubItem;

  return (
    <div className={['sidebar-button-wrapper', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        className={[
          'sidebar-button',
          isButtonActive && 'sidebar-button--active',
          collapsed && 'sidebar-button--collapsed',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={onClick}
        title={collapsed ? label : undefined}
      >
        {Icon && (
          <span className="sidebar-button__icon" aria-hidden="true">
            <Icon size={20} />
          </span>
        )}
        {!collapsed && <span className="sidebar-button__label">{label}</span>}
      </button>

      {hasSubItems && isButtonActive && !collapsed && (
        <div className="sidebar-button__subitems">
          {subItems.map((subItem, index) => (
            <SidebarSubItem
              key={subItem.id || subItem.label || index}
              label={subItem.label}
              isActive={subItem.isActive}
              onClick={subItem.onClick}
            />
          ))}
        </div>
      )}
    </div>
  );
});

const SidebarSubItem = memo(function SidebarSubItem({ label, isActive, onClick }) {
  return (
    <button
      type="button"
      className={['sidebar-subitem', isActive && 'sidebar-subitem--active']
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
    >
      <span className="sidebar-subitem__label">{label}</span>
    </button>
  );
});

SidebarButton.propTypes = {
  icon: PropTypes.elementType,
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  subItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string.isRequired,
      isActive: PropTypes.bool,
      onClick: PropTypes.func,
    })
  ),
  className: PropTypes.string,
  collapsed: PropTypes.bool,
};

SidebarSubItem.propTypes = {
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
};
