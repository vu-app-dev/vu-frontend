import { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { SectionTitle } from '../../../../components/ui/SectionTitle';
import { VideoPlayer } from '../../../../components/ui/VideoPlayer';
import { fetchCandidateVideo } from '../../../../api';
import './MockReplay.css';

export const MockReplay = memo(function MockReplay({ candidate }) {
  const candidateId = candidate?.backendId || candidate?.raw?.id;

  // Result is tagged with the candidate id it belongs to so a stale response
  // from a previously viewed candidate is ignored during render.
  const [result, setResult] = useState(null); // { id, video } | { id, error: true }

  useEffect(() => {
    if (!candidateId) return undefined;

    let cancelled = false;
    fetchCandidateVideo(candidateId)
      .then((video) => {
        if (!cancelled) setResult({ id: candidateId, video });
      })
      .catch(() => {
        if (!cancelled) setResult({ id: candidateId, error: true });
      });

    return () => {
      cancelled = true;
    };
  }, [candidateId]);

  const resolved = result && result.id === candidateId ? result : null;
  const status = !candidateId
    ? 'idle'
    : !resolved
      ? 'loading'
      : resolved.error
        ? 'idle'
        : 'ready';

  return (
    <div className="mock-replay">
      <section className="mock-replay__placeholder">
        <SectionTitle>Replay</SectionTitle>
        {status === 'ready' ? (
          <VideoPlayer hlsSrc={resolved.video.hlsUrl} mp4Src={resolved.video.mp4Url} />
        ) : (
          <div className="mock-replay__empty">
            {status === 'loading' ? (
              <>
                <span>Loading</span>
                <h3>Preparing interview replay</h3>
                <p>Generating an optimized stream for this session.</p>
              </>
            ) : (
              <>
                <span>Coming soon</span>
                <h3>Interview replay will appear here</h3>
                <p>
                  When replay recording is connected, this tab will show the session video,
                  transcript, and timeline markers for review.
                </p>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
});

MockReplay.propTypes = {
  candidate: PropTypes.object,
};
