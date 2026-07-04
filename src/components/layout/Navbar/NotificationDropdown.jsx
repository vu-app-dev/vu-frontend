import { memo } from 'react';
import PropTypes from 'prop-types';
import { Bell, X } from 'lucide-react';
import './NotificationDropdown.css';

const DUMMY_NOTIFICATIONS = [
  {
    id: 1,
    userName: 'Mohammed Ali',
    userAvatar: 'MA',
    message: 'Submitted a join request to the Acme Technologies workspace.',
    time: '5 mins ago',
    unread: true,
  },
  {
    id: 2,
    userName: 'Sarah Johnson',
    userAvatar: 'SJ',
    message: 'Reviewed Chen Wei for the Data Analyst role and left detailed feedback.',
    time: '21 mins ago',
    unread: true,
  },
  {
    id: 3,
    userName: 'Daniel Reed',
    userAvatar: 'DR',
    message: 'Created a new mock interview: "Backend Coding Challenge".',
    time: '3 hrs ago',
    unread: false,
  },
  {
    id: 4,
    userName: 'Omar Al-Hassan',
    userAvatar: 'OA',
    message: 'Changed Elena Volkov to Shortlisted for UX Designer.',
    time: '3 hrs ago',
    unread: false,
  },
  {
    id: 5,
    userName: 'James Park',
    userAvatar: 'JP',
    message: 'Updated the Frontend Developer job posting with new evaluation criteria.',
    time: '1 day ago',
    unread: false,
  },
];

export const NotificationDropdown = memo(function NotificationDropdown({ onClose, open }) {
  const notifications = DUMMY_NOTIFICATIONS;
  const hasNotifications = notifications.length > 0;

  if (!open) return null;

  return (
    <div className="notification-dropdown open" role="dialog" aria-label="Notifications">
      <div className="notification-dropdown__header">
        <div className="notification-dropdown__title-wrapper">
          <Bell size={18} className="notification-dropdown__icon" />
          <h3 className="notification-dropdown__title">Notifications</h3>
        </div>
        <button
          type="button"
          className="notification-dropdown__close"
          onClick={onClose}
          aria-label="Close notifications"
        >
          <X size={18} />
        </button>
      </div>

      <div className="notification-dropdown__body">
        {hasNotifications ? (
          <ul className="notification-dropdown__list">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={['notification-item', notification.unread && 'notification-item--unread']
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="notification-item__avatar">{notification.userAvatar}</div>
                <div className="notification-item__content">
                  <div className="notification-item__header">
                    <span className="notification-item__name">{notification.userName}</span>
                    <span className="notification-item__time">{notification.time}</span>
                  </div>
                  <p className="notification-item__message">{notification.message}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="notification-dropdown__empty">
            <Bell size={48} className="notification-dropdown__empty-icon" />
            <h4 className="notification-dropdown__empty-title">No notifications yet</h4>
            <p className="notification-dropdown__empty-text">
              When you get notifications, they&apos;ll show up here
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

NotificationDropdown.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};
