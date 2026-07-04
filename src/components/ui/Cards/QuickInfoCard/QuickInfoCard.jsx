import { memo } from 'react';
import { useEntranceAnimation } from '../../../../hooks';
import PropTypes from 'prop-types';
import './QuickInfoCard.css';

export const QuickInfoCard = memo(function QuickInfoCard({
  icon,
  number,
  title,
  className = '',
  density = 'default',
  animated = true,
}) {
  const { ref: cardRef, isVisible } = useEntranceAnimation(animated);

  return (
    <div
      ref={cardRef}
      className={[
        'quick-info-card',
        density === 'compact' && 'quick-info-card--compact',
        isVisible && 'quick-info-card--visible',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && <div className="quick-info-card__icon">{icon}</div>}

      <div className="quick-info-card__content">
        <div className="quick-info-card__number">
          {typeof number === 'number' ? number.toLocaleString() : number}
        </div>

        <div className="quick-info-card__title">{title}</div>
      </div>
    </div>
  );
});

QuickInfoCard.propTypes = {
  icon: PropTypes.node,
  number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  className: PropTypes.string,
  density: PropTypes.oneOf(['default', 'compact']),
  animated: PropTypes.bool,
};
