import { memo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { MockIntro } from './MockIntro';
import { MockInterview } from './MockInterview';
import { startMock, completeMock } from '../../../api';

/* ── Phases: intro → interview → done ── */

export const MockSession = memo(function MockSession({ mockId, onComplete }) {
  const [phase, setPhase] = useState('intro'); // 'intro' | 'interview'

  const handleStart = useCallback(() => {
    startMock(mockId);
    setPhase('interview');
  }, [mockId]);

  const handleFinish = useCallback(() => {
    const updatedMocks = completeMock(mockId);
    onComplete(updatedMocks);
  }, [mockId, onComplete]);

  if (phase === 'intro') {
    return <MockIntro mockId={mockId} onStart={handleStart} />;
  }

  return <MockInterview mockId={mockId} onComplete={handleFinish} />;
});

MockSession.propTypes = {
  mockId: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
