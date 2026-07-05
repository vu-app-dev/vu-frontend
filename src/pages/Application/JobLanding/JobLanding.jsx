import { memo } from 'react';
import PropTypes from 'prop-types';
import { ArrowRight, Calendar, Briefcase, TrendingUp, Clock, CalendarClock } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { QuickInfoCard } from '../../../components/ui/Cards';
import { APPLICATION } from '../../../api';
import './JobLanding.css';

export const JobLanding = memo(function JobLanding({ onApply }) {
  if (!APPLICATION) return null;

  const { job } = APPLICATION;
  const isScheduled = job.status === 'scheduled';
  const canApply = job.status === 'active';
  const totalMinutes = job.totalDuration;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const durationLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

  return (
    <div className="job-landing">
      <div className="job-landing__body">
        {/* Quick info cards */}
        <div className="job-landing__cards">
          <QuickInfoCard
            icon={<Briefcase />}
            number={job.jobType || 'Not set'}
            title="Job type"
            density="compact"
            animated={false}
          />
          <QuickInfoCard
            icon={<TrendingUp />}
            number={job.seniority || 'Not set'}
            title="Seniority"
            density="compact"
            animated={false}
          />
          <QuickInfoCard
            icon={<Clock />}
            number={durationLabel}
            title="Duration"
            density="compact"
            animated={false}
          />
          <QuickInfoCard
            icon={<CalendarClock />}
            number={job.deadline || 'No deadline'}
            title="Deadline"
            density="compact"
            animated={false}
          />
        </div>

        {/* About the role */}
        <section>
          <h2 className="job-landing__section-label">About the Role</h2>
          <p className="job-landing__description">{job.description}</p>
          {job.skills?.length > 0 && (
            <div className="job-landing__skills">
              {job.skills.map((skill) => (
                <span key={skill} className="job-landing__skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Status notice */}
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
      </div>

      {/* Sticky bar */}
      <div className="job-landing__sticky-bar">
        <div className="job-landing__bar-summary">
          <span>
            {job.mocksCount} {job.mocksCount === 1 ? 'interview' : 'interviews'}
          </span>
          <span className="job-landing__bar-dot" />
          <span>~{durationLabel}</span>
        </div>
        <Button
          variant="primary"
          size="sm"
          iconRight={<ArrowRight size={16} />}
          onClick={onApply}
          disabled={!canApply}
        >
          {canApply ? 'Continue' : isScheduled ? 'Not Open Yet' : 'Closed'}
        </Button>
      </div>
    </div>
  );
});

JobLanding.propTypes = {
  onApply: PropTypes.func.isRequired,
};
