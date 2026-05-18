import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { SectionTitle } from '../../../../components/ui/SectionTitle';
import { ActionCard, InfoCard } from '../../../../components/ui/Cards';
import './MockReplay.css';

export const MockReplay = memo(function MockReplay({ candidate }) {
  const transcript = useMemo(
    () =>
      (candidate.questions || []).flatMap((question, index) => [
        {
          id: `${question.id || index}-ai`,
          speaker: 'AI',
          message: question.question || `Question ${index + 1}`,
          time: 'Question',
        },
        {
          id: `${question.id || index}-candidate`,
          speaker: 'Candidate',
          message: question.answer || 'No answer returned.',
          time: `${question.durationInMinutes || 0} min`,
          score: question.score,
        },
      ]),
    [candidate.questions]
  );

  return (
    <div className="mock-replay">
      <div className="mock-replay__section">
        <div className="mock-replay__player">
          {candidate.performance?.videoUrl ? (
            <video className="mock-replay__video" controls preload="metadata">
              <source src={candidate.performance.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <InfoCard
              title="No replay video"
              description="The backend did not return a candidate performance video URL."
              animated
            />
          )}
        </div>
      </div>

      <div className="mock-replay__section">
        <SectionTitle>Transcript with AI Annotations</SectionTitle>
        <div className="mock-replay__transcript">
          {transcript.length === 0 && (
            <InfoCard
              title="No transcript returned"
              description="Candidate question relations are not included in this backend response."
              animated
            />
          )}
          {transcript.map((entry) => (
            <ActionCard
              key={entry.id}
              className={`mock-replay__entry mock-replay__entry--${entry.speaker.toLowerCase()}`}
              title={entry.speaker}
              subtitle={entry.message}
              caption={entry.time}
              descriptionTitle={entry.score != null ? 'Score' : undefined}
              showDescriptionIcon={entry.score != null}
              descriptionNumber={entry.score}
              animated
            />
          ))}
        </div>
      </div>
    </div>
  );
});

MockReplay.propTypes = {
  candidate: PropTypes.object.isRequired,
};

