import PropTypes from 'prop-types';

export function LandingBrand({ compact = false }) {
  return (
    <span className={`landing-brand${compact ? ' landing-brand--compact' : ''}`} aria-hidden="true">
      VU<span>.</span>
    </span>
  );
}

LandingBrand.propTypes = {
  compact: PropTypes.bool,
};
