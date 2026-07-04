import { memo, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { Button } from '../Button';
import './ConfirmDialog.css';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export const ConfirmDialog = memo(function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  showCancel = true,
  isBusy = false,
  closeOnOutsideClick = true,
  onConfirm,
  onClose,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;
    const focusId = window.setTimeout(() => dialogRef.current?.focus(), 0);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
        (element) => !element.hasAttribute('disabled')
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusId);
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropMouseDown = (event) => {
    if (!closeOnOutsideClick || event.target !== event.currentTarget) return;
    onClose();
  };

  return createPortal(
    <div className="confirm-dialog" onMouseDown={handleBackdropMouseDown}>
      <div
        ref={dialogRef}
        className="confirm-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        <div className="confirm-dialog__body">
          <h2 id={titleId} className="confirm-dialog__title">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="confirm-dialog__description">
              {description}
            </p>
          )}
        </div>

        <div className="confirm-dialog__actions">
          {showCancel && (
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isBusy}>
              {cancelLabel}
            </Button>
          )}
          <Button variant={confirmVariant} size="sm" onClick={onConfirm} loading={isBusy}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
});

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  confirmVariant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger', 'dashed']),
  showCancel: PropTypes.bool,
  isBusy: PropTypes.bool,
  closeOnOutsideClick: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
