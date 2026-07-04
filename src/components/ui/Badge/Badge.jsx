import { memo } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';
import { BADGE_VARIANTS } from './variants.js';
import './Badge.css';

const ICON_SIZE = 14;

export const Badge = memo(function Badge({
  type = 'candidateState',
  variant,
  iconLeft,
  iconRight,
  dropdown,
  outline,
  onClick,
  children,
  className = '',
  ...props
}) {
  const config = BADGE_VARIANTS[type]?.[variant];
  if (!config) return null;

  const { label, color, Icon } = config;
  const isClickable = !!onClick || dropdown;

  return (
    <span
      className={[
        'badge',
        `badge--${color}`,
        outline && 'badge--outline',
        isClickable && 'badge--clickable',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      {...props}
    >
      {iconLeft && (
        <span className="badge__icon">
          {iconLeft === true ? <Icon size={ICON_SIZE} /> : iconLeft}
        </span>
      )}
      <span className="badge__label">{children != null && children !== '' ? children : label}</span>
      {iconRight && (
        <span className="badge__icon">
          {iconRight === true ? <Icon size={ICON_SIZE} /> : iconRight}
        </span>
      )}
      {dropdown && (
        <span className="badge__icon badge__dropdown">
          <ChevronDown size={ICON_SIZE} />
        </span>
      )}
    </span>
  );
});

Badge.propTypes = {
  type: PropTypes.oneOf(['candidateState', 'cheatingFlag', 'jobStatus', 'mockStatus', 'role'])
    .isRequired,
  variant: PropTypes.string.isRequired,
  iconLeft: PropTypes.oneOfType([PropTypes.bool, PropTypes.node]),
  iconRight: PropTypes.oneOfType([PropTypes.bool, PropTypes.node]),
  dropdown: PropTypes.bool,
  outline: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
};
