import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { BarChart, RadarChart } from '../../../../components/ui/Charts';
import { SectionTitle } from '../../../../components/ui/SectionTitle';
import { InfoCard, ActionCard, QuestionCard } from '../../../../components/ui/Cards';
import './FullFeedback.css';

const PERFORMANCE_FIELDS = [
  ['communication', 'Communication'],
  ['problemSolving', 'Problem Solving'],
  ['technical', 'Technical Skills'],
  ['confidence', 'Confidence'],
  ['clarityOfExplanation', 'Clarity'],
  ['structuredThinking', 'Structured Thinking'],
  ['askingClarifications', 'Clarifications'],
];

export const FullFeedback = memo(function FullFeedback({ candidate }) {
  const performanceStats = useMemo(() => {
    const performance = candidate.performance || {};
    return PERFORMANCE_FIELDS.map(([key, label]) => ({
      label,
      value: Number(performance[key] || 0),
    })).filter((item) => item.value > 0);
  }, [candidate.performance]);

  const insights = useMemo(() => {
    const fromQuestions = (candidate.questions || [])
      .filter((question) => question.aiFeedback)
      .slice(0, 3)
      .map((question, index) => ({
        id: question.id || index,
        title: question.question || `Question ${index + 1}`,
        description: question.aiFeedback,
      }));

    if (fromQuestions.length) return fromQuestions;
    if (candidate.analysis?.summary) {
      return [{ id: 'summary', title: 'CV Summary', description: candidate.analysis.summary }];
    }
    return [];
  }, [candidate]);

  const questions = useMemo(
    () =>
      (candidate.questions || []).map((question, index) => ({
        id: question.id || index,
        number: index + 1,
        title: question.question || `Question ${index + 1}`,
        description: question.aiFeedback || '',
        difficulty: 'medium',
        time: `${question.durationInMinutes || 0} min`,
        score: question.score || 0,
        answer: question.answer || '',
      })),
    [candidate.questions]
  );

  return (
    <div className="full-feedback">
      <div className="full-feedback__charts">
        <BarChart
          title="Performance Scores"
          data={performanceStats}
          dataKeys={[{ key: 'value', label: 'Score' }]}
          animated
        />
        <RadarChart title="Score Breakdown" stats={performanceStats} animated />
      </div>

      <div className="full-feedback__section">
        <SectionTitle>AI Insights</SectionTitle>
        <div className="full-feedback__insights">
          <div className="full-feedback__insights-row">
            {insights.length === 0 && (
              <InfoCard
                title="No feedback returned"
                description="The backend did not include candidate question feedback."
                animated
              />
            )}
            {insights.map((insight) => (
              <InfoCard
                key={insight.id}
                title={insight.title}
                description={insight.description}
                animated
              />
            ))}
          </div>
          <ActionCard
            title="Cheating Detection"
            showBadge
            badgeType="cheatingFlag"
            badgeVariant={candidate.antiCheat}
            badgeIcon
            content={
              candidate.performance?.cheat
                ? `Backend result: ${candidate.performance.cheat}`
                : 'No cheat analysis returned.'
            }
            animated
          />
        </div>
      </div>

      <div className="full-feedback__section">
        <SectionTitle>Question-by-Question Review</SectionTitle>
        <div className="full-feedback__questions">
          {questions.length === 0 && (
            <InfoCard
              title="No questions returned"
              description="Candidate detail does not include question relations yet."
              animated
            />
          )}
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              questionNumber={question.number}
              variant="review"
              title={question.title}
              description={question.description}
              difficulty={question.difficulty}
              estimatedTime={question.time}
              score={question.score}
              answer={question.answer}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

FullFeedback.propTypes = {
  candidate: PropTypes.object.isRequired,
};

