let _ttsQueue = [];
let _ttsBusy = false;
let _ttsAudioEl = null;
let _onSpeakingChange = null;

function _getAudioEl() {
  if (!_ttsAudioEl) {
    _ttsAudioEl = document.getElementById('tts-audio');
    if (!_ttsAudioEl) {
      _ttsAudioEl = document.createElement('audio');
      _ttsAudioEl.id = 'tts-audio';
      _ttsAudioEl.style.display = 'none';
      document.body.appendChild(_ttsAudioEl);
    }
  }
  return _ttsAudioEl;
}

export function onSpeakingChange(cb) {
  _onSpeakingChange = cb;
}

export function unlockAudio() {
  const el = _getAudioEl();
  el.play()
    .then(() => {
      el.pause();
      el.currentTime = 0;
    })
    .catch(() => {});
  if (window.speechSynthesis) {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    window.speechSynthesis.speak(u);
  }
}

export function stopTTS() {
  _ttsQueue = [];
  _ttsBusy = false;
  const el = _getAudioEl();
  el.onended = null;
  el.onerror = null;
  el.pause();
  el.src = '';
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  _onSpeakingChange?.(false);
}

export function speak(text, audioBase64, onPlay) {
  if (!text) return;
  _ttsQueue.push({ text, audioBase64, onPlay });
  if (!_ttsBusy) _playNextTTS();
}

function _playNextTTS() {
  if (_ttsQueue.length === 0) {
    _ttsBusy = false;
    _onSpeakingChange?.(false);
    return;
  }
  _ttsBusy = true;
  _onSpeakingChange?.(true);
  const { text, audioBase64, onPlay } = _ttsQueue.shift();
  onPlay?.(text);

  if (audioBase64) {
    const el = _getAudioEl();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      _playNextTTS();
    };
    el.onended = finish;
    el.onerror = () => {
      if (done) return;
      done = true;
      _speakBrowser(text);
    };
    el.src = `data:audio/mp3;base64,${audioBase64}`;
    el.play()
      .then(() => {})
      .catch(() => {
        if (done) return;
        done = true;
        el.onended = null;
        el.onerror = null;
        _speakBrowser(text);
      });
  } else {
    _speakBrowser(text);
  }
}

function _pickBrowserVoice() {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  const preferred = ['Aria', 'Microsoft Aria', 'Microsoft Aria Online (Natural) - English (United States)'];
  for (const name of preferred) {
    const match = voices.find((v) => v.name === name);
    if (match) return match;
  }
  const enUsFemale = voices.find((v) => v.lang === 'en-US' && /aria|female|zira|jenny/i.test(v.name));
  if (enUsFemale) return enUsFemale;
  return voices.find((v) => v.lang === 'en-US') || null;
}

function _speakBrowser(text) {
  if (!window.speechSynthesis) {
    _playNextTTS();
    return;
  }
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.0;
  u.lang = 'en-US';
  const voice = _pickBrowserVoice();
  if (voice) u.voice = voice;
  let done = false;
  u.onend = () => {
    if (done) return;
    done = true;
    _playNextTTS();
  };
  u.onerror = () => {
    if (done) return;
    done = true;
    _playNextTTS();
  };
  window.speechSynthesis.speak(u);
}
