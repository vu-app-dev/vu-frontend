import { memo, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import './SidePanel.css';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export const SidePanel = memo(function SidePanel({
  isOpen,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeOnOutsideClick = true,
  onClose,
}) {
  const titleId = useId();
  const subtitleId = useId();
  const panelRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;
    const focusId = window.setTimeout(() => panelRef.current?.focus(), 0);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
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
    <div className="side-panel" onMouseDown={handleBackdropMouseDown}>
      <aside
        ref={panelRef}
        className={['side-panel__panel', `side-panel__panel--${size}`].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? subtitleId : undefined}
        tabIndex={-1}
      >
        <header className="side-panel__header">
          <div className="side-panel__heading">
            <h2 id={titleId} className="side-panel__title">
              {title}
            </h2>
            {subtitle && (
              <p id={subtitleId} className="side-panel__subtitle">
                {subtitle}
              </p>
            )}
          </div>
          <button type="button" className="side-panel__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="side-panel__body">{children}</div>

        {footer && <footer className="side-panel__footer">{footer}</footer>}
      </aside>
    </div>,
    document.body
  );
});

SidePanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  closeOnOutsideClick: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};
