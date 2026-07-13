import { useRef } from 'react';
import {
  ArrowRight,
  AudioLines,
  BriefcaseBusiness,
  Check,
  ClipboardCheck,
  FileSearch,
  ListChecks,
  MonitorCheck,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import PropTypes from 'prop-types';
import { LandingBrand } from './LandingBrand';

const MotionSection = motion.section;

const evidenceSteps = [
  {
    label: 'Role context',
    title: 'Start with the work.',
    copy: 'Job requirements and CV signals shape the interview.',
    visual: 'role',
  },
  {
    label: 'Live answer',
    title: 'Keep the answer in context.',
    copy: 'Question, voice, and transcript remain synchronized.',
    visual: 'answer',
  },
  {
    label: 'Integrity trail',
    title: 'Know how the answer was given.',
    copy: 'Setup and session events stay visible.',
    visual: 'integrity',
  },
  {
    label: 'Evaluation',
    title: 'Review evidence, not a black box.',
    copy: 'Scores link back to transcript and role criteria.',
    visual: 'evaluation',
  },
];

const capabilities = [
  {
    icon: AudioLines,
    title: 'Adaptive interviews',
    copy: 'Questions respond to the role and the answer.',
  },
  {
    icon: FileSearch,
    title: 'CV context',
    copy: 'Skills become focused interview signals.',
  },
  {
    icon: ShieldCheck,
    title: 'Integrity evidence',
    copy: 'Setup and session events stay visible.',
  },
  {
    icon: ClipboardCheck,
    title: 'Evaluation reports',
    copy: 'Strengths, risks, evidence, and fit in one report.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Role workflows',
    copy: 'Jobs, assessments, links, and reviews stay connected.',
  },
  {
    icon: UserRoundCheck,
    title: 'Candidate analytics',
    copy: 'Compare progress while keeping the evidence nearby.',
  },
];

function Reveal({ as = 'div', className = '', children }) {
  const Component = as;
  return <Component className={className}>{children}</Component>;
}

Reveal.propTypes = {
  as: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

function ScrollStage({ id, className, labelledBy, children }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 96%', 'start 24%'],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [52, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.55, 1], [0.84, 1, 1]);

  return (
    <MotionSection
      ref={ref}
      id={id}
      className={className}
      aria-labelledby={labelledBy}
      style={{
        scale: reduceMotion ? 1 : scale,
        y: reduceMotion ? 0 : y,
        opacity: reduceMotion ? 1 : opacity,
      }}
    >
      {children}
    </MotionSection>
  );
}

ScrollStage.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string.isRequired,
  labelledBy: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

function EvidenceVisual({ type }) {
  if (type === 'role') {
    return (
      <div className="landing-evidence-visual landing-evidence-visual--role" aria-hidden="true">
        <span>Senior frontend engineer</span>
        <div><em>React architecture</em><em>API design</em><em>Testing</em></div>
        <strong><Check size={13} /> CV context ready</strong>
      </div>
    );
  }

  if (type === 'answer') {
    return (
      <div className="landing-evidence-visual landing-evidence-visual--answer" aria-hidden="true">
        <div className="landing-evidence-wave">
          {[18, 36, 24, 50, 32, 62, 42, 54, 28, 46, 22, 38].map((height, index) => (
            <i key={`${height}-${index}`} style={{ height: `${height}%` }} />
          ))}
        </div>
        <p>"I would isolate the render path, then verify where the delay begins."</p>
        <span>Transcript synchronized</span>
      </div>
    );
  }

  if (type === 'integrity') {
    return (
      <div className="landing-evidence-visual landing-evidence-visual--integrity" aria-hidden="true">
        {[
          [AudioLines, 'Microphone', 'Clear'],
          [MonitorCheck, 'Full screen', 'Active'],
          [ShieldCheck, 'Session', 'Verified'],
        ].map(([Icon, label, status]) => (
          <div key={label}><Icon size={15} /><span>{label}</span><strong>{status}</strong></div>
        ))}
      </div>
    );
  }

  return (
    <div className="landing-evidence-visual landing-evidence-visual--evaluation" aria-hidden="true">
      {[
        ['Technical depth', '86%'],
        ['Communication', '78%'],
        ['Role alignment', '91%'],
      ].map(([label, score]) => (
        <div key={label}><span>{label}</span><i><b style={{ '--score': score }} /></i></div>
      ))}
      <strong>Evidence attached to every dimension</strong>
    </div>
  );
}

EvidenceVisual.propTypes = {
  type: PropTypes.string.isRequired,
};

export function EvidenceFlow() {
  return (
    <ScrollStage id="workflow" className="landing-story-section landing-evidence-flow" labelledBy="workflow-title">
      <Reveal className="landing-evidence-flow__intro">
        <h2 id="workflow-title">A complete trail from role to report.</h2>
        <p>Every stage stays connected.</p>
        <a href="#decisions">See the decision room <ArrowRight size={15} /></a>
      </Reveal>

      <div className="landing-evidence-flow__steps">
        {evidenceSteps.map((step, index) => (
          <Reveal key={step.label} className="landing-evidence-step" delay={index * 0.04}>
            <div className="landing-evidence-step__number">{String(index + 1).padStart(2, '0')}</div>
            <div className="landing-evidence-step__copy">
              <p>{step.label}</p>
              <h3>{step.title}</h3>
              <span>{step.copy}</span>
            </div>
            <EvidenceVisual type={step.visual} />
          </Reveal>
        ))}
      </div>
    </ScrollStage>
  );
}

function DecisionRadar() {
  return (
    <div className="landing-decision-radar" aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <path d="M100 18 171 59 171 141 100 182 29 141 29 59Z" />
        <path d="M100 45 148 72 148 128 100 155 52 128 52 72Z" />
        <path d="M100 31 158 70 146 139 96 160 41 128 55 62Z" className="score" />
      </svg>
      <span>Role alignment</span>
    </div>
  );
}

export function DecisionRoom() {
  const candidates = [
    ['Candidate 014', 'Ready to shortlist', 'Strong'],
    ['Candidate 021', 'Needs team review', 'Review'],
    ['Candidate 008', 'Interview complete', 'Complete'],
  ];

  return (
    <ScrollStage id="decisions" className="landing-story-section landing-decision" labelledBy="decision-title">
      <Reveal className="landing-section-heading landing-section-heading--split">
        <h2 id="decision-title">Candidate and evidence. Side by side.</h2>
        <p>Compare the shortlist, then open the proof behind each result.</p>
      </Reveal>

      <Reveal className="landing-decision-room" delay={0.06}>
        <div className="landing-decision-room__topbar">
          <LandingBrand compact />
          <span>Senior frontend engineer</span>
          <strong>Review open</strong>
        </div>
        <div className="landing-decision-room__body">
          <aside className="landing-decision-list" aria-label="Candidate preview list">
            <div className="landing-decision-list__heading">
              <span>Candidate</span><span>Assessment</span>
            </div>
            {candidates.map(([name, state, assessment], index) => (
              <div key={name} className={index === 0 ? 'is-active' : ''}>
                <span className="landing-candidate-avatar">{String(index + 1).padStart(2, '0')}</span>
                <p><strong>{name}</strong><em>{state}</em></p>
                <b>{assessment}</b>
              </div>
            ))}
          </aside>

          <div className="landing-decision-detail">
            <div className="landing-decision-detail__header">
              <div><span>Candidate 014</span><strong>Evidence summary</strong></div>
              <em><ShieldCheck size={13} /> Integrity verified</em>
            </div>
            <div className="landing-decision-detail__analysis">
              <DecisionRadar />
              <div className="landing-decision-signals">
                {[
                  ['Technical reasoning', 'Strong', '86%'],
                  ['Communication', 'Clear', '78%'],
                  ['Role fit', 'Strong', '91%'],
                ].map(([label, state, score]) => (
                  <div key={label}><span>{label}<em>{state}</em></span><i><b style={{ '--score': score }} /></i></div>
                ))}
              </div>
            </div>
            <blockquote>
              <span>Evidence</span>
              “Explained the tradeoff, named the bottleneck, and proposed a measurable next step.”
            </blockquote>
          </div>
        </div>
      </Reveal>
    </ScrollStage>
  );
}

const candidateJourney = [
  'A clear application and PDF resume upload',
  'Setup checks before the interview begins',
  'A focused conversation with visible progress',
  'A calm finish with no confusing next step',
];

const teamJourney = [
  'One role-specific interview structure',
  'Consistent evidence across every candidate',
  'Integrity context beside the evaluation',
  'A review trail the whole team can follow',
];

export function AudienceSection() {
  return (
    <ScrollStage id="why-vu" className="landing-story-section landing-audiences" labelledBy="audiences-title">
      <Reveal className="landing-audiences__statement">
        <h2 id="audiences-title">Clear for candidates. Useful for teams.</h2>
      </Reveal>
      <div className="landing-audiences__grid">
        <Reveal className="landing-audience landing-audience--candidate">
          <div className="landing-audience__heading"><AudioLines size={18} /><span>For candidates</span></div>
          <h3>A calm path through the interview.</h3>
          <ol>
            {candidateJourney.map((item) => <li key={item}><Check size={14} />{item}</li>)}
          </ol>
        </Reveal>
        <Reveal className="landing-audience landing-audience--team" delay={0.05}>
          <div className="landing-audience__heading"><ListChecks size={18} /><span>For hiring teams</span></div>
          <h3>A consistent path to the decision.</h3>
          <ol>
            {teamJourney.map((item) => <li key={item}><Check size={14} />{item}</li>)}
          </ol>
        </Reveal>
      </div>
    </ScrollStage>
  );
}

export function CapabilityIndex() {
  return (
    <ScrollStage id="features" className="landing-story-section landing-capabilities" labelledBy="capabilities-title">
      <Reveal className="landing-section-heading landing-section-heading--split">
        <h2 id="capabilities-title">The interview stack, connected.</h2>
        <p>Setup, session, and review in one workflow.</p>
      </Reveal>
      <div className="landing-capability-index">
        {capabilities.map(({ icon: Icon, title, copy }, index) => (
          <Reveal key={title} className="landing-capability-row" delay={(index % 2) * 0.04}>
            <Icon size={17} aria-hidden="true" />
            <h3>{title}</h3>
            <p>{copy}</p>
            <span>{String(index + 1).padStart(2, '0')}</span>
          </Reveal>
        ))}
      </div>
    </ScrollStage>
  );
}

export function FinalCTA() {
  return (
    <ScrollStage className="landing-final-cta" labelledBy="final-cta-title">
      <Reveal className="landing-final-cta__inner">
        <div className="landing-final-cta__mark"><LandingBrand /></div>
        <h2 id="final-cta-title">Run the next interview with VU.</h2>
        <p>One focused workflow from application to decision.</p>
        <a href="/login">Get started <ArrowRight size={16} /></a>
      </Reveal>
    </ScrollStage>
  );
}

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div><LandingBrand compact /><span>Interview intelligence for focused hiring teams.</span></div>
      <nav aria-label="Footer navigation">
        <a href="#platform">Platform</a>
        <a href="#workflow">Workflow</a>
        <a href="#decisions">Decisions</a>
        <a href="/login">Sign in</a>
      </nav>
      <span>VU</span>
    </footer>
  );
}
