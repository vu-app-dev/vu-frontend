import { memo } from 'react';
import PropTypes from 'prop-types';
import { Filter } from 'lucide-react';
import { Button } from '../../ui/Button';
import { SearchInput } from '../../ui/Input';
import './Shortcuts.css';

export const Shortcuts = memo(function Shortcuts({
  filterLabel = 'Filters',
  filterCount,
  onFilterClick,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search',
  secondaryAction,
  primaryAction,
  filterSlot,
  children,
  className = '',
}) {
  return (
    <div
      className={['shortcuts', children && 'shortcuts--with-inline', className]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Left Section */}
      <div className="shortcuts__left">
        <Button variant="secondary" iconRight={<Filter size={16} />} onClick={onFilterClick}>
          {filterLabel}
        </Button>
        {filterCount && (
          <>
            <span className="shortcuts__separator" />
            <span className="shortcuts__count">{filterCount}</span>
          </>
        )}
        {filterSlot && (
          <>
            <span className="shortcuts__separator" />
            {filterSlot}
          </>
        )}
        {children && (
          <>
            <span className="shortcuts__separator" />
            {children}
          </>
        )}
      </div>

      {/* Right Section */}
      <div className="shortcuts__right">
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
        {secondaryAction && (
          <Button
            variant="secondary"
            iconLeft={
              secondaryAction.iconPosition !== 'right' &&
              secondaryAction.icon && <secondaryAction.icon size={16} />
            }
            iconRight={
              secondaryAction.iconPosition === 'right' &&
              secondaryAction.icon && <secondaryAction.icon size={16} />
            }
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        )}
        {primaryAction && (
          <Button
            variant="primary"
            iconLeft={
              primaryAction.iconPosition !== 'right' &&
              primaryAction.icon && <primaryAction.icon size={16} />
            }
            iconRight={
              primaryAction.iconPosition === 'right' &&
              primaryAction.icon && <primaryAction.icon size={16} />
            }
            onClick={primaryAction.onClick}
          >
            {primaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
});

Shortcuts.propTypes = {
  filterLabel: PropTypes.string,
  filterCount: PropTypes.string,
  onFilterClick: PropTypes.func,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  secondaryAction: PropTypes.shape({
    label: PropTypes.string.isRequired,
    icon: PropTypes.elementType,
    iconPosition: PropTypes.oneOf(['left', 'right']),
    onClick: PropTypes.func,
  }),
  primaryAction: PropTypes.shape({
    label: PropTypes.string.isRequired,
    icon: PropTypes.elementType,
    iconPosition: PropTypes.oneOf(['left', 'right']),
    onClick: PropTypes.func,
  }),
  filterSlot: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
};
