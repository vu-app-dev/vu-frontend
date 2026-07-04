import { memo, useCallback } from 'react';
import { useEntranceAnimation } from '../../../../hooks';
import PropTypes from 'prop-types';
import './InfoCard.css';

export const InfoCard = memo(function InfoCard({
  title,
  description,
  className = '',
  density = 'default',
  animated = true,
  onClick,
}) {
  const { ref: cardRef, isVisible } = useEntranceAnimation(animated);
  const isClickable = !!onClick;
  const handleKeyDown = useCallback(
    (event) => {
      if (!isClickable) return;
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      onClick(event);
    },
    [isClickable, onClick]
  );

  return (
    <div
      ref={cardRef}
      className={[
        'info-card',
        density === 'compact' && 'info-card--compact',
        isVisible && 'info-card--visible',
        isClickable && 'info-card--clickable',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <h3 className="info-card__title">{title}</h3>
      {description && <p className="info-card__description">{description}</p>}
    </div>
  );
});

InfoCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  className: PropTypes.string,
  density: PropTypes.oneOf(['default', 'compact']),
  animated: PropTypes.bool,
  onClick: PropTypes.func,
};
