/**
 * Enhanced Web Audio Retro Sound Synthesizer
 * Produces authentic 8-bit / 16-bit arcade audio, consonant vs vowel keypress tones,
 * coin collect sounds, countdown alarms, and victory fanfares.
 */

const SoundFX = (() => {
  let audioCtx = null;
  let isMuted = false;
  let volume = 0.8;

  function getContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function setMuted(muted) {
    isMuted = !!muted;
    localStorage.setItem('maple_captcha_muted', isMuted ? 'true' : 'false');
  }

  function getMuted() {
    if (localStorage.getItem('maple_captcha_muted') === 'true') {
      isMuted = true;
    }
    return isMuted;
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
  }

  // Key click with differentiated tones for consonants vs vowels
  function playKeyClick(type = 'default') {
    if (isMuted) return;
    const ctx = getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      let startFreq = 340;
      let endFreq = 160;

      if (type === 'vowel') {
        startFreq = 520;
        endFreq = 280;
        osc.type = 'sine';
      } else if (type === 'consonant') {
        startFreq = 360;
        endFreq = 140;
        osc.type = 'triangle';
      } else {
        osc.type = 'triangle';
      }

      osc.frequency.setValueAtTime(startFreq + (Math.random() - 0.5) * 30, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.09 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {}
  }

  // Coin / Gem collect sound when player matches a character
  function playMatchSyllable() {
    if (isMuted) return;
    const ctx = getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.06); // E6

      gain.gain.setValueAtTime(0.08 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {}
  }

  // Correct answer chime (MapleStory level-up / quest complete chord)
  function playCorrect() {
    if (isMuted) return;
    const ctx = getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.12 * volume, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.28);
      });
    } catch (e) {}
  }

  // Error buzz (Lie detector warning buzz)
  function playError() {
    if (isMuted) return;
    const ctx = getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.setValueAtTime(110, now + 0.1);

      gain.gain.setValueAtTime(0.14 * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  // Urgent in-game countdown tick
  function playTick() {
    if (isMuted) return;
    const ctx = getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now);

      gain.gain.setValueAtTime(0.06 * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch (e) {}
  }

  // Victory fanfare on milestone streaks
  function playFanfare() {
    if (isMuted) return;
    const ctx = getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const melody = [
        { f: 523.25, d: 0.12 }, // C5
        { f: 659.25, d: 0.12 }, // E5
        { f: 783.99, d: 0.12 }, // G5
        { f: 1046.50, d: 0.35 } // C6
      ];

      let t = now;
      melody.forEach(item => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, t);

        gain.gain.setValueAtTime(0.16 * volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + item.d + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + item.d + 0.12);

        t += item.d;
      });
    } catch (e) {}
  }

  return {
    playKeyClick,
    playMatchSyllable,
    playCorrect,
    playError,
    playTick,
    playFanfare,
    setMuted,
    getMuted,
    setVolume
  };
})();
