import { memo } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import './AppliedFilterChips.css';

export const AppliedFilterChips = memo(function AppliedFilterChips({
  count = 0,
  onClearAll,
  className = '',
}) {
  if (!count) return null;

  return (
    <div
      className={['applied-filter-chips', className].filter(Boolean).join(' ')}
      aria-label={`${count} applied ${count === 1 ? 'filter' : 'filters'}`}
    >
      <span aria-live="polite">{count} applied</span>
      <button
        type="button"
        className="applied-filter-chips__clear"
        onClick={onClearAll}
        aria-label={`Clear ${count} applied ${count === 1 ? 'filter' : 'filters'}`}
        title="Clear all filters"
      >
        <X size={13} aria-hidden="true" />
      </button>
    </div>
  );
});

AppliedFilterChips.propTypes = {
  count: PropTypes.number,
  onClearAll: PropTypes.func.isRequired,
  className: PropTypes.string,
};
