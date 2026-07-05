let screenShareStream = null;

export function setScreenShareStream(stream) {
  screenShareStream = stream;
}

export function getScreenShareStream() {
  return screenShareStream;
}

export function clearScreenShareStream() {
  screenShareStream?.getTracks().forEach((track) => track.stop());
  screenShareStream = null;
}
