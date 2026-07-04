import { memo } from 'react';
import PropTypes from 'prop-types';
import { SectionTitle } from '../../../../components/ui/SectionTitle';
import './MockReplay.css';

export const MockReplay = memo(function MockReplay() {
  return (
    <div className="mock-replay">
      <section className="mock-replay__placeholder">
        <SectionTitle>Replay</SectionTitle>
        <div className="mock-replay__empty">
          <span>Coming soon</span>
          <h3>Interview replay will appear here</h3>
          <p>
            When replay recording is connected, this tab will show the session video, transcript,
            and timeline markers for review.
          </p>
        </div>
      </section>
    </div>
  );
});

MockReplay.propTypes = {
  candidate: PropTypes.object,
};
