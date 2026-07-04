import PropTypes from 'prop-types';
import './AppLogo.css';

const V_PATH =
  'M44.4105 0L90.1136 143.665H91.8679L137.663 0H181.982L116.797 189.091H65.277L0 0H44.4105Z';
const U_PATH =
  'M313.738 0H353.716V122.798C353.716 136.586 350.423 148.651 343.837 158.991C337.312 169.332 328.172 177.396 316.415 183.182C304.659 188.906 290.963 191.768 275.329 191.768C259.633 191.768 245.906 188.906 234.15 183.182C222.393 177.396 213.252 169.332 206.728 158.991C200.203 148.651 196.941 136.586 196.941 122.798V0H236.919V119.382C236.919 126.584 238.489 132.985 241.628 138.587C244.829 144.188 249.322 148.589 255.108 151.79C260.894 154.991 267.634 156.591 275.329 156.591C283.084 156.591 289.824 154.991 295.549 151.79C301.335 148.589 305.797 144.188 308.937 138.587C312.137 132.985 313.738 126.584 313.738 119.382V0Z';
const DOT_PATH =
  'M416.716 172.268C416.716 161.499 407.986 152.768 397.216 152.768C386.447 152.768 377.716 161.499 377.716 172.268C377.716 183.038 386.447 191.768 397.216 191.768C407.986 191.768 416.716 183.038 416.716 172.268Z';

export function AppLogo({ size = 'md', className = '' }) {
  return (
    <span
      className={['app-logo', `app-logo--${size}`, className].filter(Boolean).join(' ')}
      role="img"
      aria-label="VU"
    >
      <svg
        className="app-logo__svg"
        viewBox="0 0 417 192"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <path className="app-logo__word" d={V_PATH} />
        <path className="app-logo__word" d={U_PATH} />
        <path className="app-logo__dot" d={DOT_PATH} />
      </svg>
    </span>
  );
}

AppLogo.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};
