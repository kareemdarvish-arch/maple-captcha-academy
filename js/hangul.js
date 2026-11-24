/**
 * Hangul (Korean Alphabet) Engine & 2-Set (두벌식) Automaton
 * Provides Unicode decomposition, composition, QWERTY keystroke mapping,
 * and syllable generators for MapleStory Lie Detector captchas.
 */

const Hangul = (() => {
  // 19 Initial Consonants (초성)
  const CHOSEONG = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
    'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
  ];

  // 21 Medial Vowels (중성)
  const JUNGSEONG = [
    'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
    'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
  ];

  // 28 Final Consonants / Batchim (종성, index 0 is empty)
  const JONGSEONG = [
    '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ',
    'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ',
    'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
  ];

  // QWERTY to Hangul Jamo (2-Set / 두벌식)
  const KEY_TO_JAMO = {
    'q': 'ㅂ', 'w': 'ㅈ', 'e': 'ㄷ', 'r': 'ㄱ', 't': 'ㅅ',
    'y': 'ㅛ', 'u': 'ㅕ', 'i': 'ㅑ', 'o': 'ㅐ', 'p': 'ㅔ',
    'a': 'ㅁ', 's': 'ㄴ', 'd': 'ㅇ', 'f': 'ㄹ', 'g': 'ㅎ',
    'h': 'ㅗ', 'j': 'ㅓ', 'k': 'ㅏ', 'l': 'ㅣ',
    'z': 'ㅋ', 'x': 'ㅌ', 'c': 'ㅊ', 'v': 'ㅍ', 'b': 'ㅠ', 'n': 'ㅜ', 'm': 'ㅡ',
    // Shifted keys
    'Q': 'ㅃ', 'W': 'ㅉ', 'E': 'ㄸ', 'R': 'ㄲ', 'T': 'ㅆ',
    'O': 'ㅒ', 'P': 'ㅖ'
  };

  // Reverse mapping: Jamo to QWERTY key
  const JAMO_TO_KEY = {};
  for (const [key, jamo] of Object.entries(KEY_TO_JAMO)) {
    JAMO_TO_KEY[jamo] = key;
  }

  // Compound Vowel decompositions
  const COMPOUND_VOWELS = {
    'ㅘ': ['ㅗ', 'ㅏ'],
    'ㅙ': ['ㅗ', 'ㅐ'],
    'ㅚ': ['ㅗ', 'ㅣ'],
    'ㅝ': ['ㅜ', 'ㅓ'],
    'ㅞ': ['ㅜ', 'ㅔ'],
    'ㅟ': ['ㅜ', 'ㅣ'],
    'ㅢ': ['ㅡ', 'ㅣ']
  };

  // Reverse compound vowel composition
  const VOWEL_COMBINE = {
    'ㅗㅏ': 'ㅘ',
    'ㅗㅐ': 'ㅙ',
    'ㅗㅣ': 'ㅚ',
    'ㅜㅓ': 'ㅝ',
    'ㅜㅔ': 'ㅞ',
    'ㅜㅣ': 'ㅟ',
    'ㅡㅣ': 'ㅢ'
  };

  // Compound Batchim decompositions
  const COMPOUND_BATCHIM = {
    'ㄳ': ['ㄱ', 'ㅅ'],
    'ㄵ': ['ㄴ', 'ㅈ'],
    'ㄶ': ['ㄴ', 'ㅎ'],
    'ㄺ': ['ㄹ', 'ㄱ'],
    'ㄻ': ['ㄹ', 'ㅁ'],
    'ㄼ': ['ㄹ', 'ㅂ'],
    'ㄽ': ['ㄹ', 'ㅅ'],
    'ㄾ': ['ㄹ', 'ㅌ'],
    'ㄿ': ['ㄹ', 'ㅍ'],
    'ㅀ': ['ㄹ', 'ㅎ'],
    'ㅄ': ['ㅂ', 'ㅅ']
  };

  // Reverse compound batchim composition
  const BATCHIM_COMBINE = {
    'ㄱㅅ': 'ㄳ',
    'ㄴㅈ': 'ㄵ',
    'ㄴㅎ': 'ㄶ',
    'ㄹㄱ': 'ㄺ',
    'ㄹㅁ': 'ㄻ',
    'ㄹㅂ': 'ㄼ',
    'ㄹㅅ': 'ㄽ',
    'ㄹㅌ': 'ㄾ',
    'ㄹㅍ': 'ㄿ',
    'ㄹㅎ': 'ㅀ',
    'ㅂㅅ': 'ㅄ'
  };

  // Romanization & pronunciation guides for learners
  const JAMO_INFO = {
    'ㄱ': { name: 'Giyeok (기역)', sound: 'g / k', key: 'r', hand: 'left', type: 'consonant' },
    'ㄲ': { name: 'Ssang-giyeok (쌍기역)', sound: 'kk (tense k)', key: 'R (Shift+r)', hand: 'left', type: 'consonant' },
    'ㄴ': { name: 'Nieun (니은)', sound: 'n', key: 's', hand: 'left', type: 'consonant' },
    'ㄷ': { name: 'Digeut (디귿)', sound: 'd / t', key: 'e', hand: 'left', type: 'consonant' },
    'ㄸ': { name: 'Ssang-digeut (쌍디귿)', sound: 'tt (tense t)', key: 'E (Shift+e)', hand: 'left', type: 'consonant' },
    'ㄹ': { name: 'Rieul (리을)', sound: 'r / l', key: 'f', hand: 'left', type: 'consonant' },
    'ㅁ': { name: 'Mieum (미음)', sound: 'm', key: 'a', hand: 'left', type: 'consonant' },
    'ㅂ': { name: 'Bieup (비읍)', sound: 'b / p', key: 'q', hand: 'left', type: 'consonant' },
    'ㅃ': { name: 'Ssang-bieup (쌍비읍)', sound: 'pp (tense p)', key: 'Q (Shift+q)', hand: 'left', type: 'consonant' },
    'ㅅ': { name: 'Siot (시옷)', sound: 's', key: 't', hand: 'left', type: 'consonant' },
    'ㅆ': { name: 'Ssang-siot (쌍시옷)', sound: 'ss (tense s)', key: 'T (Shift+t)', hand: 'left', type: 'consonant' },
    'ㅇ': { name: 'Ieung (이응)', sound: 'silent (initial) / ng (batchim)', key: 'd', hand: 'left', type: 'consonant' },
    'ㅈ': { name: 'Jieut (지읒)', sound: 'j / ch', key: 'w', hand: 'left', type: 'consonant' },
    'ㅉ': { name: 'Ssang-jieut (쌍지읒)', sound: 'jj (tense j)', key: 'W (Shift+w)', hand: 'left', type: 'consonant' },
    'ㅊ': { name: 'Chieut (치읓)', sound: 'ch', key: 'c', hand: 'left', type: 'consonant' },
    'ㅋ': { name: 'Kieuk (키읔)', sound: 'k (aspirated)', key: 'z', hand: 'left', type: 'consonant' },
    'ㅌ': { name: 'Tieut (티읕)', sound: 't (aspirated)', key: 'x', hand: 'left', type: 'consonant' },
    'ㅍ': { name: 'Pieup (피읖)', sound: 'p (aspirated)', key: 'v', hand: 'left', type: 'consonant' },
    'ㅎ': { name: 'Hieut (히읗)', sound: 'h', key: 'g', hand: 'left', type: 'consonant' },

    'ㅏ': { name: 'A (아)', sound: 'ah', key: 'k', hand: 'right', type: 'vowel' },
    'ㅐ': { name: 'Ae (애)', sound: 'ae (cat)', key: 'o', hand: 'right', type: 'vowel' },
    'ㅑ': { name: 'Ya (야)', sound: 'yah', key: 'i', hand: 'right', type: 'vowel' },
    'ㅒ': { name: 'Yae (얘)', sound: 'yae', key: 'O (Shift+o)', hand: 'right', type: 'vowel' },
    'ㅓ': { name: 'Eo (어)', sound: 'uh / eo (cup)', key: 'j', hand: 'right', type: 'vowel' },
    'ㅔ': { name: 'E (에)', sound: 'eh (bed)', key: 'p', hand: 'right', type: 'vowel' },
    'ㅕ': { name: 'Yeo (여)', sound: 'yuh (young)', key: 'u', hand: 'right', type: 'vowel' },
    'ㅖ': { name: 'Ye (예)', sound: 'yeh (yes)', key: 'P (Shift+p)', hand: 'right', type: 'vowel' },
    'ㅗ': { name: 'O (오)', sound: 'oh (go)', key: 'h', hand: 'right', type: 'vowel' },
    'ㅘ': { name: 'Wa (와)', sound: 'wah (ㅗ + ㅏ)', key: 'h + k', hand: 'right', type: 'compound_vowel' },
    'ㅙ': { name: 'Wae (왜)', sound: 'wae (ㅗ + ㅐ)', key: 'h + o', hand: 'right', type: 'compound_vowel' },
    'ㅚ': { name: 'Oe (외)', sound: 'weh (ㅗ + ㅣ)', key: 'h + l', hand: 'right', type: 'compound_vowel' },
    'ㅛ': { name: 'Yo (요)', sound: 'yoh', key: 'y', hand: 'right', type: 'vowel' },
    'ㅜ': { name: 'U (우)', sound: 'oo (moon)', key: 'n', hand: 'right', type: 'vowel' },
    'ㅝ': { name: 'Wo (워)', sound: 'wuh (ㅜ + ㅓ)', key: 'n + j', hand: 'right', type: 'compound_vowel' },
    'ㅞ': { name: 'We (웨)', sound: 'weh (ㅜ + ㅔ)', key: 'n + p', hand: 'right', type: 'compound_vowel' },
    'ㅟ': { name: 'Wi (위)', sound: 'wee (ㅜ + ㅣ)', key: 'n + l', hand: 'right', type: 'compound_vowel' },
    'ㅠ': { name: 'Yu (유)', sound: 'yoo (you)', key: 'b', hand: 'right', type: 'vowel' },
    'ㅡ': { name: 'Eu (으)', sound: 'eu (brook)', key: 'm', hand: 'right', type: 'vowel' },
    'ㅢ': { name: 'Ui (의)', sound: 'ui (ㅡ + ㅣ)', key: 'm + l', hand: 'right', type: 'compound_vowel' },
    'ㅣ': { name: 'I (이)', sound: 'ee (meet)', key: 'l', hand: 'right', type: 'vowel' }
  };

  /**
   * Checks if character is a valid Hangul syllable (가 ~ 힣)
   */
  function isSyllable(char) {
    if (!char || char.length === 0) return false;
    const code = char.charCodeAt(0);
    return code >= 0xAC00 && code <= 0xD7A3;
  }

  /**
   * Checks if character is a Hangul Jamo (ㄱ ~ ㅣ)
   */
  function isJamo(char) {
    if (!char) return false;
    return !!JAMO_INFO[char] || CHOSEONG.includes(char) || JUNGSEONG.includes(char) || JONGSEONG.includes(char);
  }

  /**
   * Deconstruct a Hangul syllable into its components
   */
  function decompose(char) {
    if (!char) return null;

    if (!isSyllable(char)) {
      // Standalone Jamo or other character
      if (JAMO_INFO[char]) {
        return {
          char,
          isSyllable: false,
          initial: char,
          medial: '',
          final: '',
          keystrokes: JAMO_TO_KEY[char] ? [JAMO_TO_KEY[char]] : (COMPOUND_VOWELS[char] || [char]),
          keysDisplay: JAMO_INFO[char].key,
          romanization: JAMO_INFO[char].sound,
          name: JAMO_INFO[char].name
        };
      }
      return { char, isSyllable: false, initial: char, medial: '', final: '', keystrokes: [char], keysDisplay: char };
    }

    const code = char.charCodeAt(0) - 0xAC00;
    const finalIdx = code % 28;
    const medialIdx = Math.floor(code / 28) % 21;
    const initialIdx = Math.floor(Math.floor(code / 28) / 21);

    const initial = CHOSEONG[initialIdx];
    const medial = JUNGSEONG[medialIdx];
    const final = JONGSEONG[finalIdx];

    // Compute keystrokes
    const keystrokes = [];

    // Initial keystroke
    keystrokes.push(JAMO_TO_KEY[initial]);

    // Medial keystroke(s)
    if (COMPOUND_VOWELS[medial]) {
      for (const sub of COMPOUND_VOWELS[medial]) {
        keystrokes.push(JAMO_TO_KEY[sub]);
      }
    } else {
      keystrokes.push(JAMO_TO_KEY[medial]);
    }

    // Final keystroke(s) if present
    if (final) {
      if (COMPOUND_BATCHIM[final]) {
        for (const sub of COMPOUND_BATCHIM[final]) {
          keystrokes.push(JAMO_TO_KEY[sub]);
        }
      } else {
        keystrokes.push(JAMO_TO_KEY[final]);
      }
    }

    // Friendly display of keys (e.g. "w + j + f + q")
    const keysDisplay = keystrokes.map(k => {
      if (k === k.toUpperCase() && k !== k.toLowerCase()) {
        return `Shift+${k.toLowerCase()}`;
      }
      return k;
    }).join(' + ');

    return {
      char,
      isSyllable: true,
      initial,
      medial,
      final,
      initialIdx,
      medialIdx,
      finalIdx,
      keystrokes,
      keysDisplay,
      breakdownParts: [
        { label: 'Initial (초성)', jamo: initial, key: JAMO_TO_KEY[initial], sound: JAMO_INFO[initial]?.sound || '' },
        { label: 'Vowel (중성)', jamo: medial, key: COMPOUND_VOWELS[medial] ? COMPOUND_VOWELS[medial].map(j => JAMO_TO_KEY[j]).join('+') : JAMO_TO_KEY[medial], sound: JAMO_INFO[medial]?.sound || '' },
        final ? { label: 'Final (종성/받침)', jamo: final, key: COMPOUND_BATCHIM[final] ? COMPOUND_BATCHIM[final].map(j => JAMO_TO_KEY[j]).join('+') : JAMO_TO_KEY[final], sound: JAMO_INFO[final]?.sound || '' } : null
      ].filter(Boolean)
    };
  }

  /**
   * Compose a syllable from indices or characters
   */
  function compose(initial, medial, final = '') {
    let iIdx = typeof initial === 'number' ? initial : CHOSEONG.indexOf(initial);
    let mIdx = typeof medial === 'number' ? medial : JUNGSEONG.indexOf(medial);
    let fIdx = typeof final === 'number' ? final : (final ? JONGSEONG.indexOf(final) : 0);

    if (iIdx === -1 || mIdx === -1) return '';
    if (fIdx === -1) fIdx = 0;

    const code = 0xAC00 + (iIdx * 21 + mIdx) * 28 + fIdx;
    return String.fromCharCode(code);
  }

  /**
   * Full Hangul Dubeolsik (2-Set) Input Automaton
   * Converts keystrokes (e.g. 'r', 'k', 's') into Hangul syllables ('간')
   * with accurate batchim splitting and backspace recovery.
   */
  class HangulAutomaton {
    constructor() {
      this.reset();
    }

    reset() {
      this.text = '';        // Committed full text
      this.initial = '';     // Current syllable initial
      this.medial = '';      // Current syllable medial
      this.final = '';       // Current syllable final
      this.finalSub1 = '';   // For compound batchim (e.g. 'ㄹ' in 'ㄺ')
      this.finalSub2 = '';   // For compound batchim (e.g. 'ㄱ' in 'ㄺ')
      this.keystrokes = [];  // Raw keystrokes for undo/backspace
    }

    /**
     * Get the full text including the currently forming character
     */
    getValue() {
      let current = '';
      if (this.initial) {
        if (this.medial) {
          const finalChar = this.finalSub2 ? (BATCHIM_COMBINE[this.finalSub1 + this.finalSub2] || this.finalSub2) : this.finalSub1;
          current = compose(this.initial, this.medial, finalChar);
        } else {
          current = this.initial;
        }
      } else if (this.medial) {
        current = this.medial;
      }
      return this.text + current;
    }

    /**
     * Get active composing character breakdown
     */
    getComposing() {
      let current = '';
      if (this.initial) {
        if (this.medial) {
          const finalChar = this.finalSub2 ? (BATCHIM_COMBINE[this.finalSub1 + this.finalSub2] || this.finalSub2) : this.finalSub1;
          current = compose(this.initial, this.medial, finalChar);
        } else {
          current = this.initial;
        }
      } else if (this.medial) {
        current = this.medial;
      }
      return current;
    }

    /**
     * Commit currently composing character to text
     */
    commit() {
      const current = this.getComposing();
      if (current) {
        this.text += current;
      }
      this.initial = '';
      this.medial = '';
      this.final = '';
      this.finalSub1 = '';
      this.finalSub2 = '';
    }

    /**
     * Process an input keystroke (Latin char 'q'..'m', or direct Jamo 'ㅂ'..'ㅣ')
     */
    input(char) {
      if (!char) return this.getValue();

      // Check if it's a QWERTY key that maps to Jamo
      let jamo = KEY_TO_JAMO[char] || char;

      // Handle space
      if (char === ' ') {
        this.commit();
        this.text += ' ';
        this.keystrokes.push(' ');
        return this.getValue();
      }

      // If not a Korean Jamo, commit and append as-is
      if (!isJamo(jamo)) {
        this.commit();
        this.text += char;
        this.keystrokes.push(char);
        return this.getValue();
      }

      const isCons = CHOSEONG.includes(jamo) || Object.values(COMPOUND_BATCHIM).flat().includes(jamo);
      const isVow = JUNGSEONG.includes(jamo) || Object.values(COMPOUND_VOWELS).flat().includes(jamo);

      this.keystrokes.push(char);

      if (isCons) {
        this._handleConsonant(jamo);
      } else if (isVow) {
        this._handleVowel(jamo);
      }

      return this.getValue();
    }

    _handleConsonant(cons) {
      // 1. If no initial yet, start new syllable
      if (!this.initial) {
        this.initial = cons;
        return;
      }

      // 2. If initial exists but no vowel yet
      if (!this.medial) {
        // Can't have two consonants before a vowel, commit current and start new
        this.commit();
        this.initial = cons;
        return;
      }

      // 3. Initial + Medial exist, no final yet
      if (!this.finalSub1) {
        // Can this consonant be a batchim?
        if (JONGSEONG.includes(cons)) {
          this.finalSub1 = cons;
        } else {
          // Cannot be batchim (e.g. ㄸ, ㅃ, ㅉ), commit and start new
          this.commit();
          this.initial = cons;
        }
        return;
      }

      // 4. Initial + Medial + FinalSub1 exist, try compound batchim
      if (!this.finalSub2) {
        const candidate = this.finalSub1 + cons;
        if (BATCHIM_COMBINE[candidate]) {
          this.finalSub2 = cons;
          return;
        }
      }

      // 5. Syllable already has full final, commit and start new
      this.commit();
      this.initial = cons;
    }

    _handleVowel(vow) {
      // 1. If no initial
      if (!this.initial) {
        // Try compound vowel if previous vowel exists
        if (this.medial) {
          const candidate = this.medial + vow;
          if (VOWEL_COMBINE[candidate]) {
            this.medial = VOWEL_COMBINE[candidate];
            return;
          }
          this.commit();
        }
        this.medial = vow;
        return;
      }

      // 2. Initial exists, no medial yet
      if (!this.medial) {
        this.medial = vow;
        return;
      }

      // 3. Initial + Medial exist, no final yet -> try compound vowel
      if (!this.finalSub1) {
        const candidate = this.medial + vow;
        if (VOWEL_COMBINE[candidate]) {
          this.medial = VOWEL_COMBINE[candidate];
          return;
        }
        // Cannot combine, commit and start new standalone vowel
        this.commit();
        this.medial = vow;
        return;
      }

      // 4. Syllable has batchim, and a NEW vowel comes!
      // In Korean typing: the batchim moves to become the initial of the next syllable!
      if (this.finalSub2) {
        // Compound batchim: finalSub2 moves to next syllable!
        // e.g. 닭 + ㅏ -> 달 + 가
        const nextInitial = this.finalSub2;
        this.finalSub2 = '';
        this.commit(); // commits syllable with finalSub1
        this.initial = nextInitial;
        this.medial = vow;
      } else {
        // Single batchim: finalSub1 moves to next syllable!
        // e.g. 간 + ㅏ -> 가 + 나
        const nextInitial = this.finalSub1;
        this.finalSub1 = '';
        this.commit(); // commits syllable without batchim
        this.initial = nextInitial;
        this.medial = vow;
      }
    }

    /**
     * Backspace: undo the last keystroke action
     */
    backspace() {
      if (this.keystrokes.length === 0) {
        if (this.text.length > 0) {
          this.text = this.text.slice(0, -1);
        }
        return this.getValue();
      }

      this.keystrokes.pop();

      // Replay all keystrokes from scratch to maintain perfect state
      const savedKeys = [...this.keystrokes];
      this.reset();
      for (const k of savedKeys) {
        this.input(k);
      }

      return this.getValue();
    }

    /**
     * Directly set external text (e.g. from Korean IME or paste)
     */
    setText(str) {
      this.reset();
      this.text = str || '';
    }
  }

  // --- Curated Syllable Banks for Trainer ---

  // Authentic Lie Detector captchas directly matching real KMS in-game screenshots and lie detector logs
  const AUTHENTIC_SAMPLES = [
    // Real Lie Detector Captchas from User Screenshots
    '토아절크종지',
    '비소수데리회',
    '빛없어지금',
    '인귀왕이동듬',
    '서소샤뱌뵤뷰',
    '엊얹얽옭옰옪',
    '밭솥닻돝둩듵',
    '머저루류섶깉',
    '퉤뱝궝쑈늣랸',
    '곬잗뵤뙈뮨갹',
    '늣볏땁멥믕섶',
    '첫크종시비료',
    '탈털톨툴틀틸',
    '갓갗갇갈감갑',
    '뚬뿜뜸뜜뜀띰',
    '빛어둡고짙어',
    '잠시멈춰서봐',
    '화살표방향따',
    '거짓말탐지기',
    '눈크게뜨고봐',
    '빛없는지금시',
    '낟낱낫낮낯낱',
    '뱝뱁뱡뱍뱐뱔',
    '뜀뜜뜝뜞뜟뜠',
    '괾굄굈굔굠굡',
    '잰잩잪잫쟎쟐',
    '뷤뷥뷦뷧뷩뷪',
    '휨휩휭휜휟휡',
    '꿱꿲꿳꿴꿵꿶',
    '쒜쒝쒞쒟쒠쒡',

    // Monsters & Bosses
    '주황버섯포자',
    '슬라임의방울',
    '리본돼지고기',
    '초록버섯갓잎',
    '옥토퍼스다리',
    '버블링의방울',
    '스톤골렘조각',
    '다크페페부리',
    '예티의털가죽',
    '파풀라투스시',
    '카웅의부품칩',
    '블러디퀸거울',
    '피에르모자색',
    '반반의회중시',
    '벨룸의꼬리뼈',
    '매그너스검기',
    '힐라의영혼석',
    '스우의코어조',
    '데미안의검기',
    '루시드의악몽',
    '윌의거미다리',
    '더스크의눈동',
    '듄켈의지휘관',
    '진힐라의영혼',
    '검은마법사의',
    '세렌의태양검',
    '칼로스의의지',
    '카링의사흉수',

    // Classes & Skill Archetypes
    '히어로의검술',
    '팔라딘의망치',
    '다크나이트창',
    '아크메이지불',
    '비숍의홀리심',
    '보우마스터활',
    '신궁의스나이',
    '섀도어의단검',
    '나이트로드표',
    '바이퍼의너클',
    '캡틴의총기술',
    '캐논슈터대포',
    '소울마스터빛',
    '플레임위자드',
    '윈드브레이커',
    '나이트워커암',
    '스트라이커뇌',
    '미하일의방패',
    '아란의폴암격',
    '에반의드래곤',
    '메르세데스궁',
    '팬텀의카드술',
    '은월의정령강',
    '루미너스빛어',
    '데몬슬레이어',
    '데몬어벤져피',
    '배틀메이지마',
    '와일드발칸사',
    '메카닉로봇탑',
    '제논의에너지',
    '블래스터건틀',
    '카이저변신술',
    '엔젤릭버스터',
    '카데나의체인',
    '카인의어둠활',
    '아델의에테르',
    '일리움의크리',
    '아크의스펙터',
    '라라의토지령',
    '호영의부적술',
    '제로의시간술',
    '키네시스염력',

    // Game Items & Lie Detector Trap Combos
    '파워엘릭서병',
    '순간이동의돌',
    '주문의흔적북',
    '스타포스강화',
    '황금망치제련',
    '이노센트주문',
    '에디셔널잠재',
    '환생의불꽃빛',
    '수상한큐브돌',
    '명장의큐브빛',
    '레드큐브조각',
    '블랙큐브빛깔',
    '빛바랜엠블렘',
    '도미네이터펜',
    '카오스자쿰투',
    '앱솔랩스장비',
    '아케인셰이드',
    '에테르넬방어',
    '제네시스무기'
  ];

  // Tricky Lookalike pairs/trios that trick players under heavy noise
  const LOOKALIKE_GROUPS = [
    { label: 'ㅓ vs ㅏ (Horizontal Spur Direction)', chars: ['어', '아', '거', '가', '너', '나', '더', '다', '러', '라', '머', '마', '버', '바', '서', '사', '저', '자'] },
    { label: 'ㅗ vs ㅜ (Vertical Spur Up vs Down)', chars: ['오', '우', '고', '구', '노', '누', '도', '두', '로', '루', '모', '무', '보', '부', '소', '수', '조', '주'] },
    { label: 'ㅐ vs ㅔ (Ae vs E Spur Position)', chars: ['애', '에', '개', '게', '대', '데', '래', '레', '매', '메', '배', '베', '새', '세', '재', '제', '태', '테'] },
    { label: 'ㅈ vs ㅊ (Top Hat/Dot Difference)', chars: ['자', '차', '조', '초', '주', '추', '지', '치', '저', '처', '장', '창', '정', '청', '진', '친'] },
    { label: 'ㅁ vs ㅂ (Open Horns at Top)', chars: ['마', '바', '모', '보', '무', '부', '미', '비', '문', '분', '말', '발', '망', '방', '물', '불'] },
    { label: 'ㄷ vs ㅌ vs ㄹ (Bar Counts & Curves)', chars: ['다', '타', '라', '도', '토', '로', '두', '투', '루', '디', '티', '리', '달', '탈', '랄'] },
    { label: 'ㅇ vs ㅎ (Hat on Top of Circle)', chars: ['아', '하', '오', '호', '우', '후', '이', '히', '안', '한', '앙', '항', '일', '힐'] }
  ];

  // Syllables with complex / difficult double batchim (겹받침)
  const DIFFICULT_BATCHIM_SYLLABLES = [
    '닭', '흙', '밝', '맑', '긁', '붉',
    '삶', '젊', '굶', '옮', '닮', '덞',
    '넓', '밟', '얇', '떫', '짧',
    '핥', '훑', '읊', '잃', '싫', '꿇',
    '앉', '얹', '끊', '꾾', '값', '없',
    '몫', '넋', '삯', '낚', '꺾', '깎'
  ];

  // Syllables with complex compound vowels (이중모음)
  const COMPLEX_VOWEL_SYLLABLES = [
    '와', '왜', '외', '워', '웨', '위', '의',
    '과', '괘', '괴', '궈', '궤', '귀', '끠',
    '놔', '놰', '뇌', '눠', '눼', '뉘', '늬',
    '좌', '쾌', '최', '줘', '췌', '쥐', '희',
    '화', '황', '획', '환', '횃', '활', '훨'
  ];

  // High-frequency balanced Korean syllables
  const BALANCED_SYLLABLES = [
    '가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하',
    '거', '너', '더', '러', '머', '버', '서', '어', '저', '처', '커', '터', '퍼', '허',
    '고', '노', '도', '로', '모', '보', '소', '오', '조', '초', '코', '토', '포', '호',
    '구', '누', '두', '루', '무', '부', '수', '우', '주', '추', '쿠', '투', '푸', '후',
    '그', '느', '드', '르', '므', '브', '스', '으', '즈', '츠', '크', '트', '프', '흐',
    '기', '니', '디', '리', '미', '비', '시', '이', '지', '치', '키', '티', '피', '히',
    '개', '내', '대', '래', '매', '배', '새', '애', '재', '채', '캐', '태', '패', '해',
    '게', '네', '데', '레', '메', '베', '세', '에', '제', '체', '케', '테', '페', '헤',
    '강', '낭', '당', '랑', '망', '방', '상', '앙', '장', '창', '캉', '탕', '팡', '항',
    '건', '넌', '던', '런', '먼', '번', '선', '언', '전', '천', '컨', '턴', '펀', '헌',
    '골', '놀', '돌', '롤', '몰', '볼', '솔', '올', '졸', '촐', '콜', '톨', '폴', '홀',
    '국', '눅', '둑', '룩', '묵', '북', '숙', '욱', '죽', '축', '쿡', '툭', '푹', '훅',
    '금', '늠', '듬', '름', '믐', '븜', '슴', '음', '즘', '츰', '큼', '틈', '픔', '흠',
    '길', '닐', '딜', '릴', '밀', '빌', '실', '일', '질', '칠', '킬', '틸', '필', '힐',
    '꽃', '꿈', '끝', '별', '달', '해', '빛', '봄', '눈', '밤', '숲', '산', '물', '불'
  ];

  /**
   * Syllable generator with various difficulty presets
   */
  function generateCaptchaText(options = {}) {
    const {
      length = 6,
      category = 'balanced', // 'balanced', 'authentic', 'difficult_batchim', 'complex_vowels', 'lookalikes', 'all_hangul'
      includeJamo = true     // Occasionally include single jamo like 'ㅋ' as seen in MapleStory
    } = options;

    const chars = [];

    // For authentic and balanced modes, 65% of the time use real in-game KMS captchas from screenshots
    if ((category === 'authentic' || category === 'balanced') && Math.random() < 0.65) {
      const sample = AUTHENTIC_SAMPLES[Math.floor(Math.random() * AUTHENTIC_SAMPLES.length)];
      if (sample && sample.length === length) return sample;
    }

    // High-difficulty curated pools
    let pool = [...DIFFICULT_BATCHIM_SYLLABLES, ...COMPLEX_VOWEL_SYLLABLES, '빛', '없', '어', '살', '낄', '자', '버', '소', '수', '데', '리', '회', '도', '아', '첫', '크', '종', '시', '일', '귀', '와', '이', '동', '듬'];
    if (category === 'difficult_batchim') pool = DIFFICULT_BATCHIM_SYLLABLES;
    else if (category === 'complex_vowels') pool = COMPLEX_VOWEL_SYLLABLES;
    else if (category === 'adaptive') {
      const weak = (typeof SmartTeacher !== 'undefined') ? SmartTeacher.getWeakestLetters(10) : [];
      pool = weak.length >= 3 ? weak : LOOKALIKE_GROUPS[0].chars;
    } else if (category === 'lookalikes') {
      const group = LOOKALIKE_GROUPS[Math.floor(Math.random() * LOOKALIKE_GROUPS.length)];
      pool = group.chars;
    }

    for (let i = 0; i < length; i++) {
      // 10% chance to insert a standalone Jamo if enabled (matching game screenshot image 1 with 'ㅋ')
      if (includeJamo && Math.random() < 0.08) {
        const jamoSample = ['ㅋ', 'ㅎ', 'ㅅ', 'ㅇ', 'ㅁ', 'ㅂ', 'ㄷ', 'ㄹ', 'ㅠ', 'ㅗ'];
        chars.push(jamoSample[Math.floor(Math.random() * jamoSample.length)]);
        continue;
      }

      if (category === 'all_hangul') {
        // Uniform random from all 11,172 syllables
        const code = 0xAC00 + Math.floor(Math.random() * 11172);
        chars.push(String.fromCharCode(code));
      } else {
        chars.push(pool[Math.floor(Math.random() * pool.length)]);
      }
    }

    return chars.join('');
  }

  return {
    CHOSEONG,
    JUNGSEONG,
    JONGSEONG,
    KEY_TO_JAMO,
    JAMO_TO_KEY,
    COMPOUND_VOWELS,
    COMPOUND_BATCHIM,
    JAMO_INFO,
    LOOKALIKE_GROUPS,
    AUTHENTIC_SAMPLES,
    DIFFICULT_BATCHIM_SYLLABLES,
    COMPLEX_VOWEL_SYLLABLES,
    BALANCED_SYLLABLES,
    isSyllable,
    isJamo,
    decompose,
    compose,
    generateCaptchaText,
    HangulAutomaton
  };
})();

// Export for node or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Hangul;
}
