import { Check, FileText, MonitorUp, ShieldCheck } from 'lucide-react';
import PropTypes from 'prop-types';
import { LandingBrand } from './LandingBrand';

const cards = [
  {
    kind: 'interview',
    eyebrow: 'Adaptive interview',
    title: 'Question, voice, and transcript in one place',
    copy: 'A focused workspace for every answer.',
  },
  {
    kind: 'resume',
    eyebrow: 'CV intelligence',
    title: 'Role context before the first question',
    copy: 'Relevant skills arrive ready to probe.',
  },
  {
    kind: 'analytics',
    eyebrow: 'Candidate analytics',
    title: 'See quality across the pipeline',
    copy: 'Compare progress without losing context.',
  },
  {
    kind: 'report',
    eyebrow: 'Evaluation report',
    title: 'Strengths, risks, and fit',
    copy: 'Evidence behind every rating.',
  },
  {
    kind: 'pipeline',
    eyebrow: 'Recruiter workflow',
    title: 'A clear next step for every candidate',
    copy: 'From applied to shortlist.',
  },
];

function InterviewPreview() {
  return (
    <div className="landing-preview landing-preview--interview">
      <div className="landing-preview__bar">
        <LandingBrand compact />
        <div className="landing-preview__tabs">
          <span>Technical</span>
          <span className="is-active">System design</span>
          <span>Behavioral</span>
        </div>
        <strong>24:18</strong>
      </div>
      <div className="landing-interview-preview__body">
        <div className="landing-interview-preview__voice">
          <span className="landing-interview-preview__orb">
            <LandingBrand compact />
          </span>
          <em>VU is speaking</em>
        </div>
        <div className="landing-interview-preview__answer">
          <span>Live transcript</span>
          <strong>
            I would isolate the render path first, then compare network, bundle, and query cost.
          </strong>
        </div>
        <div className="landing-interview-preview__status">
          <span><MonitorUp size={13} /> Full screen</span>
          <span><ShieldCheck size={13} /> Integrity active</span>
        </div>
      </div>
    </div>
  );
}

function ResumePreview() {
  return (
    <div className="landing-preview landing-preview--resume">
      <div className="landing-resume-preview__document">
        <div className="landing-resume-preview__heading">
          <FileText size={15} />
          <span>Resume parsed</span>
        </div>
        <span className="landing-resume-preview__line is-wide" />
        <span className="landing-resume-preview__line" />
        <span className="landing-resume-preview__line is-short" />
        <div className="landing-resume-preview__skills">
          <span>React</span>
          <span>API design</span>
          <span>Testing</span>
        </div>
      </div>
      <div className="landing-resume-preview__match">
        <span>Role alignment</span>
        <strong>Strong match</strong>
        <em><Check size={13} /> Ready for interview</em>
      </div>
    </div>
  );
}

function AnalyticsPreview() {
  return (
    <div className="landing-preview landing-preview--analytics">
      <div className="landing-analytics-preview__legend">
        <span>Candidate quality</span>
        <em>Current role</em>
      </div>
      <svg viewBox="0 0 520 168" role="img" aria-label="Candidate quality trend rising over time">
        <path className="grid" d="M18 36H502M18 84H502M18 132H502" />
        <path className="area" d="M20 138 C92 136 120 124 166 126 S250 104 294 98 S360 68 405 61 S462 35 500 27 L500 152 L20 152Z" />
        <path className="line" d="M20 138 C92 136 120 124 166 126 S250 104 294 98 S360 68 405 61 S462 35 500 27" />
        <circle cx="500" cy="27" r="5" />
      </svg>
      <div className="landing-analytics-preview__footer">
        <span>Applied</span>
        <span>Interviewed</span>
        <span>Ready for review</span>
      </div>
    </div>
  );
}

function ReportPreview() {
  return (
    <div className="landing-preview landing-preview--report">
      <div className="landing-report-preview__radar">
        <svg viewBox="0 0 160 160" aria-hidden="true">
          <path d="M80 16 136 48 136 112 80 144 24 112 24 48Z" />
          <path d="M80 39 116 59 116 101 80 122 44 101 44 59Z" />
          <path className="score" d="M80 28 126 61 111 111 78 126 39 96 51 52Z" />
        </svg>
      </div>
      <div className="landing-report-preview__signals">
        <span><em>Technical depth</em><i style={{ '--score': '86%' }} /></span>
        <span><em>Communication</em><i style={{ '--score': '78%' }} /></span>
        <span><em>Role fit</em><i style={{ '--score': '91%' }} /></span>
      </div>
    </div>
  );
}

function PipelinePreview() {
  const stages = [
    ['Applied', 'Candidate 014'],
    ['Interview', 'Candidate 021'],
    ['Report', 'Candidate 008'],
    ['Shortlist', 'Candidate 016'],
  ];

  return (
    <div className="landing-preview landing-preview--pipeline">
      {stages.map(([stage, candidate], index) => (
        <div key={stage} className={index === stages.length - 1 ? 'is-current' : ''}>
          <span>{stage}</span>
          <strong>{candidate}</strong>
          <em>{index === stages.length - 1 ? 'Ready' : 'Complete'}</em>
        </div>
      ))}
    </div>
  );
}

function ShowcaseVisual({ kind }) {
  if (kind === 'interview') return <InterviewPreview />;
  if (kind === 'resume') return <ResumePreview />;
  if (kind === 'analytics') return <AnalyticsPreview />;
  if (kind === 'report') return <ReportPreview />;
  return <PipelinePreview />;
}

ShowcaseVisual.propTypes = {
  kind: PropTypes.string.isRequired,
};

export function LandingShowcase() {
  return (
    <div className="landing-showcase__grid">
      {cards.map((card) => (
        <article key={card.kind} className={`landing-showcase-card landing-showcase-card--${card.kind}`}>
          <div className="landing-showcase-card__visual" aria-hidden="true">
            <ShowcaseVisual kind={card.kind} />
          </div>
          <div className="landing-showcase-card__copy">
            <p>{card.eyebrow}</p>
            <h2>{card.title}</h2>
            <span>{card.copy}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
