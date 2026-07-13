export function supportsInterviewEnvironment() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return true;

  const mediaDevices = navigator.mediaDevices;
  return Boolean(
    window.isSecureContext &&
      mediaDevices &&
      typeof mediaDevices.getUserMedia === 'function' &&
      typeof mediaDevices.getDisplayMedia === 'function'
  );
}
