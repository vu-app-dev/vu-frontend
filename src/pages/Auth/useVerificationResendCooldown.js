import { useCallback, useEffect, useState } from 'react';

const VERIFY_RESEND_SECONDS = 60;

export function useVerificationResendCooldown() {
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;

    const timer = window.setTimeout(() => {
      setResendSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  const startResendCooldown = useCallback(() => {
    setResendSeconds(VERIFY_RESEND_SECONDS);
  }, []);

  const resetResendCooldown = useCallback(() => {
    setResendSeconds(0);
  }, []);

  return {
    resendSeconds,
    canResendCode: resendSeconds <= 0,
    startResendCooldown,
    resetResendCooldown,
  };
}
