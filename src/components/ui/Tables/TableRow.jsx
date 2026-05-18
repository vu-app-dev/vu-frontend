import { memo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { MoreHorizontal } from 'lucide-react';
import { RowMenu } from '../RowMenu';
import './TableRow.css';

export const TableRow = memo(function TableRow({
  children,
  showMenu = false,
  selected = false,
  onMenuClick,
  onMenuSelect,
  onMouseDown,
  onClick,
  className = '',
  gridTemplateColumns,
  menuOpen = false,
  onMenuClose,
  menuOptions,
}) {
  const isClickable = !!onClick;
  const menuBtnRef = useRef(null);

  const handleMenuClick = useCallback(
    (e) => {
      e.stopPropagation();
      onMenuClick?.(e);
    },
    [onMenuClick]
  );

  return (
    <div
      className={[
        'table-row',
        isClickable && 'table-row--clickable',
        selected && 'table-row--selected',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseDown={onMouseDown}
      onClick={onClick}
      role="row"
      style={gridTemplateColumns ? { display: 'grid', gridTemplateColumns } : undefined}
    >
      {children}
      {showMenu && (
        <div className="table-row__menu-wrapper">
          <button
            ref={menuBtnRef}
            className="table-row__menu"
            onClick={handleMenuClick}
            aria-label="Row actions"
          >
            <MoreHorizontal size={16} />
          </button>
          <RowMenu
            options={menuOptions}
            open={menuOpen}
            onClose={onMenuClose}
            onSelect={onMenuSelect}
            triggerRef={menuBtnRef}
          />
        </div>
      )}
    </div>
  );
});

TableRow.propTypes = {
  children: PropTypes.node.isRequired,
  showMenu: PropTypes.bool,
  selected: PropTypes.bool,
  onMenuClick: PropTypes.func,
  onMenuSelect: PropTypes.func,
  onMouseDown: PropTypes.func,
  onClick: PropTypes.func,
  className: PropTypes.string,
  gridTemplateColumns: PropTypes.string,
  menuOpen: PropTypes.bool,
  onMenuClose: PropTypes.func,
  menuOptions: PropTypes.array,
};
