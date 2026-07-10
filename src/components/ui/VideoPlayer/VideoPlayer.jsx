import { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './VideoPlayer.css';

// Streams an HLS manifest when possible and falls back to a plain MP4 source.
// - Safari (and iOS) play HLS natively.
// - Other browsers load hls.js on demand (dynamic import keeps it out of the
//   main bundle and avoids downloading it where it is not needed).
// - Any HLS failure (e.g. Cloudinary still generating a rendition) switches the
//   player to MODE_MP4, which renders a FRESH <video> element (via React key).
//   Remounting is deliberate: it discards the torn-down MSE element so a stale
//   media error from hls.js teardown can never trip the MP4 error handler.
const MODE_HLS = 'hls';
const MODE_MP4 = 'mp4';
const MODE_FAILED = 'failed';

function initialMode(hlsSrc, mp4Src) {
  if (hlsSrc) return MODE_HLS;
  if (mp4Src) return MODE_MP4;
  return MODE_FAILED;
}

function VideoPlayerInner({ hlsSrc, mp4Src, poster, className }) {
  const videoRef = useRef(null);
  const [mode, setMode] = useState(() => initialMode(hlsSrc, mp4Src));

  useEffect(() => {
    if (mode !== MODE_HLS) return undefined;
    const video = videoRef.current;
    if (!video) return undefined;

    let hls = null;
    let cancelled = false;
    const fallback = () => {
      if (!cancelled) setMode(mp4Src ? MODE_MP4 : MODE_FAILED);
    };

    // Safari / iOS: native HLS, falling back to MP4 on error.
    if (video.canPlayType('application/vnd.apple.mpegurl') !== '') {
      video.src = hlsSrc;
      video.addEventListener('error', fallback, { once: true });
      return () => {
        cancelled = true;
        video.removeEventListener('error', fallback);
      };
    }

    // Other browsers: hls.js via MSE.
    import('hls.js')
      .then(({ default: Hls }) => {
        if (cancelled) return;
        if (!Hls.isSupported()) {
          fallback();
          return;
        }
        hls = new Hls({ enableWorker: true });
        hls.loadSource(hlsSrc);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data?.fatal) fallback();
        });
      })
      .catch(fallback);

    return () => {
      cancelled = true;
      if (hls) hls.destroy();
    };
  }, [mode, hlsSrc, mp4Src]);

  if (mode === MODE_FAILED) {
    return (
      <div className={['video-player', className].filter(Boolean).join(' ')}>
        <div className="video-player__error video-player__error--block">
          <p>This recording could not be loaded.</p>
        </div>
      </div>
    );
  }

  // Fresh <video> per mode (key) so the MP4 element never inherits HLS state.
  return (
    <div className={['video-player', className].filter(Boolean).join(' ')}>
      <video
        key={mode}
        ref={videoRef}
        className="video-player__el"
        controls
        playsInline
        preload="metadata"
        poster={poster || undefined}
        src={mode === MODE_MP4 ? mp4Src : undefined}
        onError={mode === MODE_MP4 ? () => setMode(MODE_FAILED) : undefined}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

VideoPlayerInner.propTypes = {
  hlsSrc: PropTypes.string,
  mp4Src: PropTypes.string,
  poster: PropTypes.string,
  className: PropTypes.string,
};

// Remount (and reset mode) whenever the sources change, so switching between
// candidates always starts a clean HLS attempt.
export const VideoPlayer = memo(function VideoPlayer(props) {
  return <VideoPlayerInner key={`${props.hlsSrc || ''}|${props.mp4Src || ''}`} {...props} />;
});

VideoPlayer.propTypes = {
  hlsSrc: PropTypes.string,
  mp4Src: PropTypes.string,
  poster: PropTypes.string,
  className: PropTypes.string,
};
