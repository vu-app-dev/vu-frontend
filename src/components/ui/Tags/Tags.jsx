import PropTypes from 'prop-types';
import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { Button } from '../Button';
import './Tags.css';

const EMPTY_TAGS = [];

export const Tags = memo(function Tags({
  title,
  tags = EMPTY_TAGS,
  onAdd,
  onRemove,
  variant = 'editable',
  showTitle = true,
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTagValue, setNewTagValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  useEffect(() => {
    if (isAdding) inputRef.current?.focus();
  }, [isAdding]);

  const isEditable = variant === 'editable';

  const handleRemoveTag = useCallback(
    (tag, index, e) => {
      e.stopPropagation();
      onRemove?.(tag, index);
    },
    [onRemove]
  );

  const handleSubmitTag = useCallback(() => {
    const trimmed = newTagValue.trim();
    if (trimmed && onAdd) {
      onAdd(trimmed);
      setNewTagValue('');
      inputRef.current?.focus();
    }
  }, [newTagValue, onAdd]);

  const handleCancelAdd = useCallback(() => {
    setNewTagValue('');
    setIsAdding(false);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmitTag();
      } else if (e.key === 'Escape') {
        handleCancelAdd();
      }
    },
    [handleSubmitTag, handleCancelAdd]
  );

  const handleAddClick = useCallback(() => setIsAdding(true), []);

  return (
    <div className={['tags', isVisible && 'tags--visible', className].filter(Boolean).join(' ')}>
      {showTitle && title && <h3 className="tags__title">{title}</h3>}

      <div className="tags__container">
        {tags.map((tag, index) => {
          const label =
            typeof tag === 'string' ? tag : String(tag?.name || tag?.label || tag || '');
          return (
          <div
            key={`${label}-${index}`}
            className={['tags__tag', isVisible && 'tags__tag--visible'].filter(Boolean).join(' ')}
            style={{ '--tag-index': index }}
          >
            <span className="tags__tag-text">{label}</span>
            {isEditable && (
              <button
                type="button"
                className="tags__tag-remove"
                onClick={(e) => handleRemoveTag(label, index, e)}
                aria-label={`Remove ${label}`}
              >
                <X size={14} />
              </button>
            )}
          </div>
        );
        })}

        {isEditable &&
          (isAdding ? (
            <div className="tags__input-wrapper">
              <input
                ref={inputRef}
                type="text"
                className="tags__input"
                value={newTagValue}
                onChange={(e) => setNewTagValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleCancelAdd}
                placeholder="Enter tag name"
                maxLength={30}
              />
              <button
                type="button"
                className="tags__input-submit"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSubmitTag();
                }}
                aria-label="Submit tag"
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              iconRight={<Plus size={14} />}
              onClick={handleAddClick}
            >
              Add
            </Button>
          ))}
      </div>
    </div>
  );
});

Tags.propTypes = {
  title: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  onAdd: PropTypes.func,
  onRemove: PropTypes.func,
  variant: PropTypes.oneOf(['editable', 'readonly']),
  showTitle: PropTypes.bool,
  className: PropTypes.string,
};
