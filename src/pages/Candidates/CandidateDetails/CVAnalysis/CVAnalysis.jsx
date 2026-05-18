import { useState, useCallback, memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';
import { SectionTitle } from '../../../../components/ui/SectionTitle';
import { InfoCard } from '../../../../components/ui/Cards';
import './CVAnalysis.css';

function getVerdict(score) {
  if (score >= 80) return { label: 'Strong Match', variant: 'strong' };
  if (score >= 60) return { label: 'Partial Match', variant: 'partial' };
  return { label: 'Weak Match', variant: 'weak' };
}

export const CVAnalysis = memo(function CVAnalysis({ candidate }) {
  const [cvExpanded, setCvExpanded] = useState(false);
  const toggleCv = useCallback(() => setCvExpanded((p) => !p), []);

  const analysis = candidate.analysis || {};
  const fitScore = Number(analysis.score || 0);
  const verdict = getVerdict(fitScore);
  const skills = useMemo(() => candidate.analysis?.skills ?? [], [candidate.analysis?.skills]);

  const strengths = useMemo(
    () =>
      skills.slice(0, 6).map((skill) => ({
        id: skill,
        title: skill,
        description: 'Extracted from backend CV analysis.',
      })),
    [skills]
  );

  return (
    <div className="cv-analysis">
      <div className="cv-analysis__section">
        <div className="cv-analysis__match-card">
          <span className="cv-analysis__match-title">Role Fit Score</span>
          <div className="cv-analysis__match-score-block">
            <span className="cv-analysis__match-number">{fitScore}%</span>
            <span
              className={`cv-analysis__match-verdict cv-analysis__match-verdict--${verdict.variant}`}
            >
              {verdict.label}
            </span>
          </div>
          <div className="cv-analysis__match-bar-track">
            <div className="cv-analysis__match-bar-fill" style={{ width: `${fitScore}%` }} />
          </div>
        </div>
      </div>

      <div className="cv-analysis__section">
        <SectionTitle>Extracted Skills</SectionTitle>
        <div className="cv-analysis__skills">
          {skills.length === 0 && (
            <span className="cv-analysis__skill-tag cv-analysis__skill-tag--missing">
              No skills returned
            </span>
          )}
          {skills.map((skill) => (
            <span key={skill} className="cv-analysis__skill-tag cv-analysis__skill-tag--strong">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="cv-analysis__section">
        <SectionTitle>Summary</SectionTitle>
        <div className="cv-analysis__experience">
          <InfoCard
            title="CV Analysis"
            description={analysis.summary || 'The backend did not return a CV summary.'}
            animated
          />
        </div>
      </div>

      <div className="cv-analysis__section">
        <SectionTitle>Skill Highlights</SectionTitle>
        <div className="cv-analysis__gap-grid">
          <div className="cv-analysis__gap-col">
            <h4 className="cv-analysis__gap-heading cv-analysis__gap-heading--strengths">
              Strengths
            </h4>
            <div className="cv-analysis__gap-list">
              {strengths.length === 0 && (
                <InfoCard
                  title="No strengths returned"
                  description="Backend CV analysis only returns skills, summary, and score."
                  animated
                />
              )}
              {strengths.map((item) => (
                <InfoCard
                  key={item.id}
                  title={item.title}
                  description={item.description}
                  animated
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="cv-analysis__section">
        <button type="button" className="cv-analysis__cv-toggle" onClick={toggleCv}>
          <SectionTitle>CV File</SectionTitle>
          <ChevronDown
            size={20}
            className={['cv-analysis__cv-chevron', cvExpanded && 'cv-analysis__cv-chevron--open']
              .filter(Boolean)
              .join(' ')}
          />
        </button>

        <div
          className={['cv-analysis__cv-content', cvExpanded && 'cv-analysis__cv-content--open']
            .filter(Boolean)
            .join(' ')}
        >
          <div className="cv-analysis__cv-inner">
            {candidate.cvUrl ? (
              <a className="cv-analysis__cv-text" href={candidate.cvUrl} target="_blank" rel="noreferrer">
                {candidate.cvUrl}
              </a>
            ) : (
              <pre className="cv-analysis__cv-text">No CV URL returned.</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

CVAnalysis.propTypes = {
  candidate: PropTypes.object.isRequired,
};
