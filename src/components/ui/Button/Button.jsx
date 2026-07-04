import { memo } from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const VARIANTS = ['primary', 'secondary', 'ghost', 'success', 'danger', 'dashed'];
const SIZES = ['sm', 'lg'];

/**
 * Button component designed for high-end SaaS dashboards.
 * Optimized with React.memo for high-density performance.
 */
export const Button = memo(function Button({
  className = '',
  variant = 'primary',
  size = 'sm',
  disabled = false,
  loading = false,
  iconLeft,
  iconRight,
  children,
  type = 'button',
  ...props
}) {
  const safeVariant = VARIANTS.includes(variant) ? variant : 'primary';
  const safeSize = SIZES.includes(size) ? size : 'sm';
  const isIconOnly = !children && (iconLeft || iconRight);

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`btn btn--${safeVariant} btn--${safeSize} ${isIconOnly ? 'btn--icon-only' : ''} ${className}`.trim()}
      {...props}
    >
      {loading ? (
        <span className="btn__loader" aria-hidden="true" />
      ) : (
        <>
          {iconLeft && <span className="btn__icon btn__icon--left">{iconLeft}</span>}
          {children && <span className="btn__label">{children}</span>}
          {iconRight && <span className="btn__icon btn__icon--right">{iconRight}</span>}
        </>
      )}
    </button>
  );
});

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(VARIANTS),
  size: PropTypes.oneOf(SIZES),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  iconLeft: PropTypes.node,
  iconRight: PropTypes.node,
  children: PropTypes.node,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};
