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

  // Light, cheerful authentic Egyptian music riff & Darbuka percussion for Egyptian Coach banter
  function playEgyptianCoachTune() {
    if (isMuted) return;
    const ctx = getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime + 0.04;

      // 1. Egyptian Darbuka Percussion Layer ("Dum - Tak - Tak - Dum - Tak")
      const beats = [
        { type: 'dum', t: 0.00 },
        { type: 'tak', t: 0.22 },
        { type: 'tak', t: 0.38 },
        { type: 'dum', t: 0.60 },
        { type: 'tak', t: 0.82 },
        { type: 'dum', t: 1.05 },
        { type: 'tak', t: 1.25 }
      ];

      beats.forEach(b => {
        const bt = now + b.t;
        if (b.type === 'dum') {
          // Low resonant Darbuka "DUM"
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(145, bt);
          osc.frequency.exponentialRampToValueAtTime(42, bt + 0.14);

          gain.gain.setValueAtTime(0.24 * volume, bt);
          gain.gain.exponentialRampToValueAtTime(0.001, bt + 0.16);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(bt);
          osc.stop(bt + 0.16);
        } else {
          // Crisp high-rim "TAK"
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(920, bt);
          osc.frequency.exponentialRampToValueAtTime(320, bt + 0.045);

          gain.gain.setValueAtTime(0.13 * volume, bt);
          gain.gain.exponentialRampToValueAtTime(0.001, bt + 0.05);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(bt);
          osc.stop(bt + 0.05);
        }
      });

      // 2. Authentic Oriental / Egyptian Maqam Hijaz Melody
      // Notes: D5 (587Hz), Eb5 (622Hz), F#5 (740Hz), G5 (784Hz), A5 (880Hz)
      const notes = [
        { f: 587.33, t: 0.02, d: 0.12 }, // D5
        { f: 622.25, t: 0.16, d: 0.10 }, // Eb5
        { f: 739.99, t: 0.28, d: 0.18 }, // F#5 (Iconic Hijaz interval)
        { f: 783.99, t: 0.48, d: 0.11 }, // G5
        { f: 880.00, t: 0.61, d: 0.20, slideTo: 783.99 }, // A5 -> G5 slide
        { f: 739.99, t: 0.83, d: 0.14 }, // F#5
        { f: 622.25, t: 0.99, d: 0.12 }, // Eb5
        { f: 587.33, t: 1.13, d: 0.42, vibrato: true }  // D5 with warm oriental trill
      ];

      notes.forEach(n => {
        const nt = now + n.t;

        // Dual oscillator for authentic accordion / mizmar / oud warmth
        const oscTri = ctx.createOscillator();
        const oscSaw = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1750, nt);
        filter.Q.setValueAtTime(3.0, nt);

        oscTri.type = 'triangle';
        oscSaw.type = 'sawtooth';

        oscTri.frequency.setValueAtTime(n.f, nt);
        oscSaw.frequency.setValueAtTime(n.f * 1.002, nt); // subtle chorus detune

        if (n.slideTo) {
          oscTri.frequency.exponentialRampToValueAtTime(n.slideTo, nt + n.d);
          oscSaw.frequency.exponentialRampToValueAtTime(n.slideTo * 1.002, nt + n.d);
        }

        if (n.vibrato) {
          // Oriental vibrato on final resting note
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(5.8, nt); // 5.8 Hz oriental trill
          lfoGain.gain.setValueAtTime(12, nt);   // pitch mod depth
          lfo.connect(oscTri.frequency);
          lfo.connect(oscSaw.frequency);
          lfo.start(nt + 0.08);
          lfo.stop(nt + n.d + 0.1);
        }

        gain.gain.setValueAtTime(0.001, nt);
        gain.gain.linearRampToValueAtTime(0.18 * volume, nt + 0.02);
        gain.gain.setValueAtTime(0.16 * volume, nt + n.d - 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, nt + n.d + 0.08);

        oscTri.connect(filter);
        oscSaw.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        oscTri.start(nt);
        oscSaw.start(nt);
        oscTri.stop(nt + n.d + 0.08);
        oscSaw.stop(nt + n.d + 0.08);
      });
    } catch (e) {}
  }

  // Comical, light Egyptian warning sting for mistake / wrong answer banter
  function playEgyptianCoachErrorTune() {
    if (isMuted) return;
    const ctx = getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime + 0.03;

      // 1. Darbuka "Tak" rim click followed by deep low "Dum"
      const oscTak = ctx.createOscillator();
      const gainTak = ctx.createGain();
      oscTak.type = 'triangle';
      oscTak.frequency.setValueAtTime(880, now);
      oscTak.frequency.exponentialRampToValueAtTime(260, now + 0.04);
      gainTak.gain.setValueAtTime(0.14 * volume, now);
      gainTak.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      oscTak.connect(gainTak);
      gainTak.connect(ctx.destination);
      oscTak.start(now);
      oscTak.stop(now + 0.05);

      const oscDum = ctx.createOscillator();
      const gainDum = ctx.createGain();
      oscDum.type = 'sine';
      oscDum.frequency.setValueAtTime(130, now + 0.18);
      oscDum.frequency.exponentialRampToValueAtTime(38, now + 0.35);
      gainDum.gain.setValueAtTime(0.25 * volume, now + 0.18);
      gainDum.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      oscDum.connect(gainDum);
      gainDum.connect(ctx.destination);
      oscDum.start(now + 0.18);
      oscDum.stop(now + 0.38);

      // 2. Comical descending oriental slide (F#5 -> F5 -> Eb5 -> D4)
      const errNotes = [
        { f: 739.99, t: 0.04, d: 0.12 }, // F#5
        { f: 698.46, t: 0.16, d: 0.12 }, // F5
        { f: 622.25, t: 0.28, d: 0.14 }, // Eb5
        { f: 440.00, t: 0.44, d: 0.40, slideTo: 293.66 } // A4 sliding down to D4
      ];

      errNotes.forEach(n => {
        const nt = now + n.t;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, nt);
        filter.Q.setValueAtTime(2.5, nt);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(n.f, nt);

        if (n.slideTo) {
          osc.frequency.exponentialRampToValueAtTime(n.slideTo, nt + n.d);
        }

        gain.gain.setValueAtTime(0.001, nt);
        gain.gain.linearRampToValueAtTime(0.15 * volume, nt + 0.02);
        gain.gain.setValueAtTime(0.13 * volume, nt + n.d - 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, nt + n.d + 0.06);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(nt);
        osc.stop(nt + n.d + 0.06);
      });
    } catch (e) {}
  }

  // Unlock AudioContext on first user interaction
  if (typeof document !== 'undefined') {
    ['click', 'keydown', 'touchstart'].forEach(evt => {
      document.addEventListener(evt, () => {
        getContext();
      }, { once: true, passive: true });
    });
  }

  return {
    playKeyClick,
    playMatchSyllable,
    playCorrect,
    playError,
    playTick,
    playFanfare,
    playEgyptianCoachTune,
    playEgyptianCoachErrorTune,
    getContext,
    setMuted,
    getMuted,
    setVolume
  };
})();
