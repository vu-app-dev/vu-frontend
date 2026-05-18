import { memo } from 'react';
import PropTypes from 'prop-types';
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  Users,
  Globe,
  GraduationCap,
  ArrowRight,
  FileText,
  Calendar,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { EntityCard } from '../../../components/ui/Cards/EntityCard';
import { SectionTitle } from '../../../components/ui/SectionTitle';
import { APPLICATION } from '../../../api';
import './JobLanding.css';

/* ── Component ── */
export const JobLanding = memo(function JobLanding({ onApply }) {
  if (!APPLICATION) return null;

  const { job, company } = APPLICATION;
  const isScheduled = job.status === 'scheduled';
  const isClosed = job.status === 'closed';
  const canApply = job.status === 'active';
  const totalMinutes = job.totalDuration;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const durationLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;
  const availabilityLabel = isScheduled
    ? `Scheduled - opens ${job.startDate || 'soon'}`
    : isClosed
      ? 'Closed'
      : `Active - closes ${job.deadline}`;

  return (
    <div className="job-landing">
      {/* ── Top row: Entity Card + Quick Info ── */}
      <div className="job-landing__top">
        <div className="job-landing__entity-wrapper">
          <EntityCard
            showAvatar={false}
            userName={job.title}
            userEmail={`${company.name} · ${job.location} · ${job.jobType} · ${job.locationType}`}
            showBadge
            badgeType="jobStatus"
            badgeVariant={job.status || 'active'}
            caption={availabilityLabel}
            colLeft={{ icon: Briefcase, title: job.department, subtitle: 'Department' }}
            colMid={{ icon: GraduationCap, title: job.seniority, subtitle: 'Seniority' }}
            colRight={{ icon: Clock, title: durationLabel, subtitle: 'Total Duration' }}
            animated={false}
            className="job-landing__entity-card"
          />
          {/* ── About the Role + Skills (combined) ── */}
          <section className="job-landing__section">
            <SectionTitle>About the Role</SectionTitle>
            <p className="job-landing__description">{job.description}</p>
            <div className="job-landing__skills">
              {job.skills.map((skill) => (
                <span key={skill} className="job-landing__skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </div>
        {/* Quick Info sidebar */}
        <div className="job-landing__quick-info">
          <h3 className="job-landing__quick-info-title">Quick Info</h3>
          <div className="job-landing__quick-info-divider" />
          <div className="job-landing__quick-info-list">
            <div className="job-landing__quick-info-item">
              <Calendar size={16} />
              <div>
                <span className="job-landing__quick-info-label">
                  {isScheduled ? 'Opens' : 'Deadline'}
                </span>
                <span className="job-landing__quick-info-value">
                  {isScheduled ? job.startDate : job.deadline}
                </span>
              </div>
            </div>
            <div className="job-landing__quick-info-item">
              <FileText size={16} />
              <div>
                <span className="job-landing__quick-info-label">Assessments</span>
                <span className="job-landing__quick-info-value">{job.mocksCount} assessments</span>
              </div>
            </div>
            <div className="job-landing__quick-info-item">
              <Building2 size={16} />
              <div>
                <span className="job-landing__quick-info-label">Industry</span>
                <span className="job-landing__quick-info-value">{company.industry}</span>
              </div>
            </div>
            <div className="job-landing__quick-info-item">
              <Users size={16} />
              <div>
                <span className="job-landing__quick-info-label">Company Size</span>
                <span className="job-landing__quick-info-value">{company.size}</span>
              </div>
            </div>
            <div className="job-landing__quick-info-item">
              <Globe size={16} />
              <div>
                <span className="job-landing__quick-info-label">Website</span>
                {company.website ? (
                  <a
                    href={company.website}
                    className="job-landing__quick-info-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {company.website.replace('https://', '')}
                  </a>
                ) : (
                  <span className="job-landing__quick-info-value">Not provided</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Assessment Overview ── */}
      <section className="job-landing__section">
        <SectionTitle>Assessment Overview</SectionTitle>
        <div className="job-landing__assessments">
          {APPLICATION.mocks.map((mock, idx) => (
            <div key={mock.id} className="job-landing__assessment-card">
              <div className="job-landing__assessment-number">{idx + 1}</div>
              <div className="job-landing__assessment-info">
                <div className="job-landing__assessment-name-row">
                  <h4 className="job-landing__assessment-name">{mock.name}</h4>
                  <Badge
                    type="jobStatus"
                    variant={
                      mock.difficulty === 'Hard'
                        ? 'active'
                        : mock.difficulty === 'Medium'
                          ? 'scheduled'
                          : 'closed'
                    }
                  >
                    {mock.difficulty}
                  </Badge>
                </div>
                <div className="job-landing__assessment-meta">
                  <span className="job-landing__assessment-detail">
                    <Clock size={12} />
                    {mock.duration}
                  </span>
                  <span className="job-landing__assessment-detail">
                    <FileText size={12} />
                    {mock.type}
                  </span>
                </div>
              </div>
              <div className="job-landing__assessment-weight">
                <span className="job-landing__assessment-weight-label">Score Weight</span>
                <span className="job-landing__assessment-weight-value">{mock.weight}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Apply CTA ── */}
      {!canApply && (
        <section className="job-landing__notice">
          <Calendar size={16} />
          <div>
            <strong>{isScheduled ? 'This job is scheduled' : 'This job is closed'}</strong>
            <span>
              {isScheduled
                ? `Applications open on ${job.startDate || 'the scheduled open date'}.`
                : 'Applications are no longer being accepted.'}
            </span>
          </div>
        </section>
      )}

      <Button
        variant="primary"
        size="lg"
        className="job-landing__cta"
        iconRight={<ArrowRight size={16} />}
        onClick={onApply}
        disabled={!canApply}
      >
        {canApply ? 'Apply Now' : isScheduled ? 'Applications Not Open Yet' : 'Applications Closed'}
      </Button>
    </div>
  );
});

JobLanding.propTypes = {
  onApply: PropTypes.func.isRequired,
};
