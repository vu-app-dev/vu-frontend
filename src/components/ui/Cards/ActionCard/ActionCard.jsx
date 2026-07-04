import { memo } from 'react';
import { useEntranceAnimation } from '../../../../hooks';
import PropTypes from 'prop-types';
import { Star } from 'lucide-react';
import { Button } from '../../Button';
import { Badge } from '../../Badge';
import './ActionCard.css';

const ICON_SIZE = 16;

export const ActionCard = memo(function ActionCard({
  title,
  subtitle,
  caption,
  showBadge = false,
  badgeText,
  badgeType = 'candidateState',
  badgeVariant = 'accepted',
  badgeIcon = false,
  showButton = false,
  buttonText = 'Remove',
  onButtonClick,
  descriptionTitle,
  showDescriptionIcon = false,
  descriptionNumber,
  content,
  className = '',
  density = 'default',
  animated = true,
}) {
  const { ref: cardRef, isVisible } = useEntranceAnimation(animated);

  return (
    <div
      ref={cardRef}
      className={[
        'action-card',
        density === 'compact' && 'action-card--compact',
        isVisible && 'action-card--visible',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header row - Title, Caption, Badge, and Button */}
      <div className="action-card__header">
        <h2 className="action-card__title">{title}</h2>
        <div className="action-card__header-right">
          {caption && <span className="action-card__caption">{caption}</span>}
          {showBadge && (
            <Badge type={badgeType} variant={badgeVariant} iconLeft={badgeIcon}>
              {badgeText}
            </Badge>
          )}
          {showButton && (
            <Button className="action-card__button" onClick={onButtonClick}>
              {buttonText}
            </Button>
          )}
        </div>
      </div>

      {/* Description row - Subtitle on left, icon/number/title on right */}
      {(subtitle || descriptionTitle) && (
        <div className="action-card__description-row">
          {subtitle && <p className="action-card__subtitle">{subtitle}</p>}
          {descriptionTitle && (
            <div className="action-card__description-meta">
              <span className="action-card__description-title">{descriptionTitle}</span>
              {showDescriptionIcon && (
                <Star className="action-card__description-icon" size={ICON_SIZE} />
              )}
              {descriptionNumber && (
                <span className="action-card__description-number">{descriptionNumber}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Content text */}
      {content && <p className="action-card__content">{content}</p>}
    </div>
  );
});

ActionCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  caption: PropTypes.string,
  showBadge: PropTypes.bool,
  badgeText: PropTypes.string,
  badgeType: PropTypes.oneOf(['candidateState', 'cheatingFlag', 'jobStatus', 'role']),
  badgeIcon: PropTypes.bool,
  badgeVariant: PropTypes.string,
  showButton: PropTypes.bool,
  buttonText: PropTypes.string,
  onButtonClick: PropTypes.func,
  descriptionTitle: PropTypes.string,
  showDescriptionIcon: PropTypes.bool,
  descriptionNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  content: PropTypes.string,
  className: PropTypes.string,
  density: PropTypes.oneOf(['default', 'compact']),
  animated: PropTypes.bool,
};
