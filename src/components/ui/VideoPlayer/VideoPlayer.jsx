import { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './VideoPlayer.css';

// Streams an HLS manifest when possible and falls back to a plain MP4 source.
// - Safari (and iOS) play HLS natively, so we assign hlsSrc directly.
// - Other browsers load hls.js on demand (dynamic import keeps it out of the
//   main bundle and avoids downloading it where it is not needed).
// - If neither HLS path is available, the native <video> uses mp4Src.
export const VideoPlayer = memo(function VideoPlayer({
  hlsSrc,
  mp4Src,
  poster,
  className,
}) {
  const videoRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    setError(false);
    let hls = null;
    let cancelled = false;

    const canPlayNativeHls =
      video.canPlayType('application/vnd.apple.mpegurl') !== '';

    if (hlsSrc && canPlayNativeHls) {
      video.src = hlsSrc;
      return undefined;
    }

    if (hlsSrc) {
      import('hls.js')
        .then(({ default: Hls }) => {
          if (cancelled) return;
          if (Hls.isSupported()) {
            hls = new Hls({ enableWorker: true });
            hls.loadSource(hlsSrc);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (_event, data) => {
              // Fall back to the MP4 source on a fatal HLS error.
              if (data?.fatal) {
                hls?.destroy();
                hls = null;
                if (mp4Src) {
                  video.src = mp4Src;
                } else {
                  setError(true);
                }
              }
            });
          } else if (mp4Src) {
            video.src = mp4Src;
          } else {
            setError(true);
          }
        })
        .catch(() => {
          if (cancelled) return;
          if (mp4Src) {
            video.src = mp4Src;
          } else {
            setError(true);
          }
        });
      return () => {
        cancelled = true;
        if (hls) hls.destroy();
      };
    }

    if (mp4Src) {
      video.src = mp4Src;
      return undefined;
    }

    setError(true);
    return undefined;
  }, [hlsSrc, mp4Src]);

  if (error) {
    return (
      <div className={['video-player video-player--error', className].filter(Boolean).join(' ')}>
        <p>This recording could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className={['video-player', className].filter(Boolean).join(' ')}>
      <video
        ref={videoRef}
        className="video-player__el"
        controls
        playsInline
        preload="metadata"
        poster={poster || undefined}
        onError={() => setError(true)}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
});

VideoPlayer.propTypes = {
  hlsSrc: PropTypes.string,
  mp4Src: PropTypes.string,
  poster: PropTypes.string,
  className: PropTypes.string,
};
