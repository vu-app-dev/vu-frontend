import { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './VideoPlayer.css';

// Streams an HLS manifest when possible and falls back to a plain MP4 source.
// - Safari (and iOS) play HLS natively, so we assign hlsSrc directly.
// - Other browsers load hls.js on demand (dynamic import keeps it out of the
//   main bundle and avoids downloading it where it is not needed).
// - Any HLS failure (e.g. Cloudinary still generating a rendition) drops down
//   to the MP4 source. The <video> stays mounted the whole time so a transient
//   media error never tears the player down mid-fallback.
export const VideoPlayer = memo(function VideoPlayer({
  hlsSrc,
  mp4Src,
  poster,
  className,
}) {
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    setFailed(false);
    let hls = null;
    let cancelled = false;

    // Last-resort source. If the MP4 itself errors, surface the failure.
    const playMp4 = () => {
      if (cancelled) return;
      if (!mp4Src) {
        setFailed(true);
        return;
      }
      video.src = mp4Src;
      video.load();
      video.addEventListener(
        'error',
        () => {
          if (!cancelled) setFailed(true);
        },
        { once: true },
      );
    };

    const canPlayNativeHls =
      video.canPlayType('application/vnd.apple.mpegurl') !== '';

    // Safari / iOS: native HLS, with a one-shot fallback to MP4 on failure.
    if (hlsSrc && canPlayNativeHls) {
      video.src = hlsSrc;
      video.addEventListener('error', playMp4, { once: true });
      return () => {
        cancelled = true;
        video.removeEventListener('error', playMp4);
      };
    }

    // Other browsers: hls.js via MSE, falling back to MP4 on a fatal error.
    if (hlsSrc) {
      import('hls.js')
        .then(({ default: Hls }) => {
          if (cancelled) return;
          if (!Hls.isSupported()) {
            playMp4();
            return;
          }
          hls = new Hls({ enableWorker: true });
          hls.loadSource(hlsSrc);
          hls.attachMedia(video);
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (!data?.fatal) return;
            hls?.destroy();
            hls = null;
            playMp4();
          });
        })
        .catch(playMp4);

      return () => {
        cancelled = true;
        if (hls) hls.destroy();
      };
    }

    // No HLS source at all — play the MP4 directly.
    playMp4();
    return () => {
      cancelled = true;
    };
  }, [hlsSrc, mp4Src]);

  return (
    <div className={['video-player', className].filter(Boolean).join(' ')}>
      <video
        ref={videoRef}
        className="video-player__el"
        controls
        playsInline
        preload="metadata"
        poster={poster || undefined}
      >
        Your browser does not support the video tag.
      </video>
      {failed && (
        <div className="video-player__error">
          <p>This recording could not be loaded.</p>
        </div>
      )}
    </div>
  );
});

VideoPlayer.propTypes = {
  hlsSrc: PropTypes.string,
  mp4Src: PropTypes.string,
  poster: PropTypes.string,
  className: PropTypes.string,
};
