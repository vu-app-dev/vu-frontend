import {
  CircleCheck,
  Clock,
  Star,
  Ban,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Sparkles,
  CalendarClock,
  CircleMinus,
  CirclePause,
  Crown,
  Pencil,
  Eye,
} from 'lucide-react';

/** Badge variant configurations - icon is component reference, rendered in Badge.jsx */
export const BADGE_VARIANTS = {
  candidateState: {
    accepted: { label: 'Accepted', color: 'green', Icon: CircleCheck },
    pending: { label: 'Pending', color: 'yellow', Icon: Clock },
    shortlist: { label: 'Shortlist', color: 'blue', Icon: Star },
    shortlisted: { label: 'Shortlist', color: 'blue', Icon: Star },
    rejected: { label: 'Rejected', color: 'red', Icon: Ban },
  },
  cheatingFlag: {
    clean: { label: 'Clean', color: 'green', Icon: ShieldCheck },
    flagged: { label: 'Flagged', color: 'yellow', Icon: ShieldAlert },
    critical: { label: 'Critical', color: 'red', Icon: ShieldX },
  },
  jobStatus: {
    active: { label: 'Active', color: 'green', Icon: Sparkles },
    scheduled: { label: 'Scheduled', color: 'yellow', Icon: CalendarClock },
    closed: { label: 'Closed', color: 'gray', Icon: CircleMinus },
    inactive: { label: 'Inactive', color: 'gray', Icon: CirclePause },
  },
  role: {
    owner: { label: 'Owner', color: 'purple', Icon: Crown },
    editor: { label: 'Editor', color: 'teal', Icon: Pencil },
    viewer: { label: 'Viewer', color: 'gray', Icon: Eye },
  },
};

export const BADGE_TYPES = Object.keys(BADGE_VARIANTS);
