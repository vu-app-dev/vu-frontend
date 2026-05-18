import { AlertTriangle, Calendar, Lock } from 'lucide-react';
import './EditBanner.css';

const CONFIG = {
  active: {
    icon: AlertTriangle,
    cls: 'edit-banner--warning',
    title: 'Active Job',
    body: 'This job is live, so only scheduling can be changed. Job info and mocks are locked.',
  },
  scheduled: {
    icon: Calendar,
    cls: 'edit-banner--scheduled',
    title: 'Scheduled Job',
    body: 'This job is scheduled but not yet live. All edits will take effect before it goes public.',
  },
  closed: {
    icon: Lock,
    cls: 'edit-banner--closed',
    title: 'Closed Job',
    body: 'This job is no longer accepting applications. Closed jobs cannot be reopened.',
  },
};

export function EditBanner({ status }) {
  const cfg = CONFIG[status];
  if (!cfg) return null;

  const Icon = cfg.icon;

  return (
    <div className={`edit-banner ${cfg.cls}`}>
      <Icon size={16} className="edit-banner__icon" />
      <div className="edit-banner__body">
        <span className="edit-banner__title">{cfg.title}</span>
        <span className="edit-banner__text">{cfg.body}</span>
      </div>
    </div>
  );
}
