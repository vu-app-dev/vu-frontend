import { memo } from 'react';
import PropTypes from 'prop-types';
import './AppliedFilterChips.css';

export const AppliedFilterChips = memo(function AppliedFilterChips({
  chips = [],
  onClearAll,
  className = '',
}) {
  if (!chips.length) return null;
  const count = chips.length;

  return (
    <button
      type="button"
      className={['applied-filter-chips', className].filter(Boolean).join(' ')}
      onClick={onClearAll}
      aria-label={`Clear ${count} applied ${count === 1 ? 'filter' : 'filters'}`}
      title="Clear all filters"
    >
      {count} applied
    </button>
  );
});

AppliedFilterChips.propTypes = {
  chips: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  onClearAll: PropTypes.func,
  className: PropTypes.string,
};
