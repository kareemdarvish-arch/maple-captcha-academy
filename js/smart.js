/**
 * Smart AI-Style Diagnostics, Korean Speech Synthesis & Adaptive Weak-Spot Tracker
 */

const SmartTeacher = (() => {
  // Speech Synthesis for Korean
  function speakHangul(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop prior speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.85; // Slightly slower for clear learning

    // Pick a Korean voice if available
    const voices = window.speechSynthesis.getVoices();
    const koVoice = voices.find(v => v.lang.startsWith('ko'));
    if (koVoice) utterance.voice = koVoice;

    window.speechSynthesis.speak(utterance);
  }

  // Weak Spot Tracker
  function loadWeakSpots() {
    try {
      const data = localStorage.getItem('maple_captcha_weakspots');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function saveWeakSpots(spots) {
    localStorage.setItem('maple_captcha_weakspots', JSON.stringify(spots));
  }

  function recordMistake(expectedChar, typedChar) {
    if (!expectedChar) return;
    const spots = loadWeakSpots();
    spots[expectedChar] = (spots[expectedChar] || 0) + 1;
    saveWeakSpots(spots);
  }

  function getWeakestLetters(limit = 6) {
    const spots = loadWeakSpots();
    const sorted = Object.entries(spots).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, limit).map(entry => entry[0]);
  }

  /**
   * Deep diagnostic analysis of why player made a mistake
   */
  function diagnoseMistake(typed, target) {
    if (!typed || !target) return '';

    // Compare characters
    for (let i = 0; i < Math.max(typed.length, target.length); i++) {
      const t = typed[i] || '';
      const exp = target[i] || '';

      if (t !== exp) {
        // Record mistake for adaptive practice
        recordMistake(exp, t);

        const expDec = Hangul.decompose(exp);
        const tDec = Hangul.decompose(t);

        if (!expDec || !tDec) continue;

        // 1. Check vowel confusion
        if (expDec.medial !== tDec.medial) {
          if ((expDec.medial === 'ㅓ' && tDec.medial === 'ㅏ') || (expDec.medial === 'ㅏ' && tDec.medial === 'ㅓ')) {
            return I18n.t('diagLookalikeVowel');
          }
          if ((expDec.medial === 'ㅗ' && tDec.medial === 'ㅜ') || (expDec.medial === 'ㅜ' && tDec.medial === 'ㅗ')) {
            return I18n.t('diagLookalikeO');
          }
        }

        // 2. Check initial consonant confusion
        if (expDec.initial !== tDec.initial) {
          if ((expDec.initial === 'ㅈ' && tDec.initial === 'ㅊ') || (expDec.initial === 'ㅊ' && tDec.initial === 'ㅈ')) {
            return I18n.t('diagLookalikeJ');
          }
          if ((expDec.initial === 'ㅁ' && tDec.initial === 'ㅂ') || (expDec.initial === 'ㅂ' && tDec.initial === 'ㅁ')) {
            return I18n.t('diagLookalikeB');
          }
          if (['ㄷ', 'ㅌ', 'ㄹ'].includes(expDec.initial) && ['ㄷ', 'ㅌ', 'ㄹ'].includes(tDec.initial)) {
            return I18n.t('diagLookalikeD');
          }
        }

        // 3. Check batchim confusion or omission
        if (expDec.final && !tDec.final) {
          return I18n.t('diagMissingBatchim');
        }
      }
    }

    return '';
  }

  return {
    speakHangul,
    recordMistake,
    getWeakestLetters,
    diagnoseMistake
  };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartTeacher;
}
