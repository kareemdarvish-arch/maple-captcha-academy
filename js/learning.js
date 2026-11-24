/**
 * Hangul Learning Academy & Syllable Deconstructor
 * Provides comprehensive reference for every Hangul consonant, vowel,
 * compound vowel, and batchim, plus interactive lookalike guides and drills.
 */

class HangulAcademy {
  constructor(options = {}) {
    this.options = Object.assign({
      onHighlightKey: null,
      onPlaySound: null
    }, options);

    this.activeFilter = 'all';
    this.drillScore = 0;
    this.drillStreak = 0;
    this.currentDrillTarget = null;

    window.addEventListener('languageChanged', () => {
      this.renderLookalikes('lookalikes-container');
    });
  }

  renderJamoGrid(containerId, filter = 'all') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const list = this.getFilteredJamoList(filter);
    const grid = document.createElement('div');
    grid.className = 'jamo-card-grid';

    list.forEach(item => {
      const card = document.createElement('div');
      card.className = `jamo-card jamo-${item.type} hand-${item.hand || 'left'}`;

      card.innerHTML = `
        <div class="card-jamo-top">
          <span class="card-jamo-char">${item.char}</span>
          <button type="button" class="btn-card-sound" data-char="${item.char}" title="Listen">🔊</button>
        </div>
        <div class="card-jamo-info">
          <div class="card-jamo-name">${item.name || item.char}</div>
          <div class="card-jamo-sound">${item.sound || ''}</div>
          <div class="card-jamo-key"><kbd>${item.key || ''}</kbd> <span class="hand-tag">${item.hand === 'left' ? 'Left' : 'Right'}</span></div>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-card-sound')) return;
        if (this.options.onHighlightKey && item.key) {
          const mainKey = item.key.split(' ')[0].replace('Shift+', '');
          this.options.onHighlightKey(mainKey);
        }
        if (this.options.onPlaySound) {
          this.options.onPlaySound('click');
        }
        this.inspectCharacter(item.char);
      });

      const soundBtn = card.querySelector('.btn-card-sound');
      if (soundBtn) {
        soundBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (typeof SmartTeacher !== 'undefined') {
            SmartTeacher.speakHangul(item.char);
          }
        });
      }

      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  getFilteredJamoList(filter) {
    const all = [];

    Hangul.CHOSEONG.forEach(c => {
      all.push({
        char: c,
        type: 'consonant',
        ...(Hangul.JAMO_INFO[c] || {})
      });
    });

    Hangul.JUNGSEONG.forEach(v => {
      const isCompound = !!Hangul.COMPOUND_VOWELS[v];
      all.push({
        char: v,
        type: isCompound ? 'compound_vowel' : 'vowel',
        ...(Hangul.JAMO_INFO[v] || {})
      });
    });

    Object.entries(Hangul.COMPOUND_BATCHIM).forEach(([batchim, parts]) => {
      all.push({
        char: batchim,
        type: 'batchim',
        name: `Double Batchim (${parts.join('+')})`,
        sound: `final ${parts.join('+')}`,
        key: parts.map(p => Hangul.JAMO_TO_KEY[p]).join(' + '),
        hand: 'left'
      });
    });

    if (filter === 'consonant') return all.filter(x => x.type === 'consonant');
    if (filter === 'vowel') return all.filter(x => x.type === 'vowel');
    if (filter === 'compound_vowel') return all.filter(x => x.type === 'compound_vowel');
    if (filter === 'batchim') return all.filter(x => x.type === 'batchim');

    return all;
  }

  inspectCharacter(char, targetElementId = 'deconstructor-output') {
    const outputEl = document.getElementById(targetElementId);
    if (!outputEl) return;

    const data = Hangul.decompose(char);
    if (!data) {
      outputEl.innerHTML = `<div class="empty-hint">Enter or click a Korean character above to inspect its keystroke breakdown.</div>`;
      return;
    }

    if (!data.isSyllable) {
      outputEl.innerHTML = `
        <div class="deconstruct-box standalone">
          <div class="deconstruct-hero-col">
            <div class="deconstruct-hero">${data.char}</div>
            <button type="button" class="btn btn-sm btn-secondary btn-speak-main" data-char="${data.char}">🔊 ${typeof I18n !== 'undefined' ? I18n.t('btnPronounce') : 'Listen'}</button>
          </div>
          <div class="deconstruct-details">
            <div class="deconstruct-title">${data.name || 'Single Jamo'}</div>
            <div class="deconstruct-sound">Sound: <strong>${data.romanization || ''}</strong></div>
            <div class="deconstruct-keystroke">Type on English keyboard: <kbd class="big-kbd">${data.keysDisplay}</kbd></div>
          </div>
        </div>
      `;
      const btn = outputEl.querySelector('.btn-speak-main');
      if (btn) btn.addEventListener('click', () => SmartTeacher.speakHangul(data.char));
      return;
    }

    outputEl.innerHTML = `
      <div class="deconstruct-box syllable">
        <div class="deconstruct-hero-col">
          <div class="deconstruct-hero">${data.char}</div>
          <button type="button" class="btn btn-sm btn-secondary btn-speak-main" data-char="${data.char}">🔊 ${typeof I18n !== 'undefined' ? I18n.t('btnPronounce') : 'Listen'}</button>
          <div class="deconstruct-keys-all">
            <span class="keys-label">Type in order:</span>
            <div class="keys-sequence">${data.keystrokes.map(k => `<kbd>${k}</kbd>`).join(' → ')}</div>
          </div>
        </div>
        <div class="deconstruct-anatomy">
          <div class="anatomy-block initial">
            <div class="block-tag">1. Initial (초성)</div>
            <div class="block-char">${data.initial}</div>
            <div class="block-key"><kbd>${Hangul.JAMO_TO_KEY[data.initial] || ''}</kbd></div>
            <div class="block-desc">${Hangul.JAMO_INFO[data.initial]?.sound || ''}</div>
          </div>
          <div class="anatomy-block medial">
            <div class="block-tag">2. Vowel (중성)</div>
            <div class="block-char">${data.medial}</div>
            <div class="block-key"><kbd>${Hangul.COMPOUND_VOWELS[data.medial] ? Hangul.COMPOUND_VOWELS[data.medial].map(j => Hangul.JAMO_TO_KEY[j]).join('+') : Hangul.JAMO_TO_KEY[data.medial]}</kbd></div>
            <div class="block-desc">${Hangul.JAMO_INFO[data.medial]?.sound || ''}</div>
          </div>
          ${data.final ? `
            <div class="anatomy-block final">
              <div class="block-tag">3. Batchim (종성)</div>
              <div class="block-char">${data.final}</div>
              <div class="block-key"><kbd>${Hangul.COMPOUND_BATCHIM[data.final] ? Hangul.COMPOUND_BATCHIM[data.final].map(j => Hangul.JAMO_TO_KEY[j]).join('+') : Hangul.JAMO_TO_KEY[data.final]}</kbd></div>
              <div class="block-desc">${Hangul.JAMO_INFO[data.final]?.sound || 'final'}</div>
            </div>
          ` : `
            <div class="anatomy-block no-final">
              <div class="block-tag">3. Batchim (종성)</div>
              <div class="block-char">-</div>
              <div class="block-desc">None (Open syllable)</div>
            </div>
          `}
        </div>
      </div>
    `;

    const btn = outputEl.querySelector('.btn-speak-main');
    if (btn) btn.addEventListener('click', () => SmartTeacher.speakHangul(data.char));
  }

  renderLookalikes(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const isAr = (typeof I18n !== 'undefined' && I18n.getLang() === 'ar');

    const lookalikeData = [
      {
        pair: 'ㅓ vs ㅏ',
        secret: isAr ? 'اتجاه النتوء: للداخل vs للخارج' : 'Inward vs Outward notch direction',
        desc: isAr ? 'حرف ㅓ (مفتاح j) نتوءه يتجه لليسار/الداخل. حرف ㅏ (مفتاح k) نتوءه يتجه لليمين/الخارج.' : 'ㅓ (eo, key: j) points LEFT toward center. ㅏ (a, key: k) points RIGHT outward.',
        samples: ['어 / 아', '거 / 가', '더 / 다', '서 / 사'],
        keys: 'j vs k'
      },
      {
        pair: 'ㅗ vs ㅜ',
        secret: isAr ? 'الساق: للأعلى vs للأسفل' : 'Upward vs Downward vertical stem',
        desc: isAr ? 'حرف ㅗ (مفتاح h) ساقه تقف للأعلى فوق الخط الأفقي. حرف ㅜ (مفتاح n) ساقه تتدلى للأسفل تحت الخط.' : 'ㅗ (o, key: h) stem sticks UP above the horizontal bar. ㅜ (u, key: n) hangs DOWN below.',
        samples: ['오 / 우', '고 / 구', '도 / 두', '소 / 수'],
        keys: 'h vs n'
      },
      {
        pair: 'ㅐ vs ㅔ',
        secret: isAr ? 'موضع الوصلة: خارج vs داخل' : 'Notch connects inside vs outside',
        desc: isAr ? 'حرف ㅐ (مفتاح o) وصلته تتصل بين العمودين. حرف ㅔ (مفتاح p) وصلته تتصل بالعمود الأيسر.' : 'ㅐ (ae, key: o) middle spur attaches between the two bars. ㅔ (e, key: p) middle spur attaches to the left bar.',
        samples: ['애 / 에', '개 / 게', '대 / 데', '배 / 베'],
        keys: 'o vs p'
      },
      {
        pair: 'ㅈ vs ㅊ',
        secret: isAr ? 'نقطة أو قبعة إضافية تعلو ㅊ' : 'Top dot / hat on ㅊ',
        desc: isAr ? 'حرف ㅈ (مفتاح w) رأسه خط مسطح. حرف ㅊ (مفتاح c) تعلوه شرطة أو قبعة صغيرة في المنتصف.' : 'ㅈ (j, key: w) has a flat top line. ㅊ (ch, key: c) has a small extra horizontal stroke/dot on top.',
        samples: ['자 / 차', '조 / 초', '주 / 추', '지 / 치'],
        keys: 'w vs c'
      },
      {
        pair: 'ㅁ vs ㅂ',
        secret: isAr ? 'قرنان مفتوحان في ㅂ vs مربع مغلق' : 'Open horns above ㅂ vs closed box',
        desc: isAr ? 'حرف ㅁ (مفتاح a) مربع مغلق بالكامل. حرف ㅂ (مفتاح q) له قرنان بارزان للأعلى.' : 'ㅁ (m, key: a) is a closed 4-corner box. ㅂ (b, key: q) has two upright horns poking above the box.',
        samples: ['마 / 바', '모 / 보', '무 / 부', '미 / 비'],
        keys: 'a vs q'
      },
      {
        pair: 'ㄷ vs ㅌ vs ㄹ',
        secret: isAr ? 'عدد الخطوط الأفقية وشكل الحلزون' : 'Bar count & S-curve',
        desc: isAr ? 'حرف ㄷ (مفتاح e) خطان أفقيان. حرف ㅌ (مفتاح x) 3 خطوط أفقية. حرف ㄹ (مفتاح f) حلزوني يشبه S.' : 'ㄷ (d, key: e) has 2 bars. ㅌ (t, key: x) has 3 bars. ㄹ (r, key: f) weaves like an S-spiral.',
        samples: ['다 / 타 / 라', '도 / 토 / 로', '두 / 투 / 루'],
        keys: 'e vs x vs f'
      },
      {
        pair: 'ㅇ vs ㅎ',
        secret: isAr ? 'دائرة بسيطة vs دائرة تعلوها قبعة' : 'Hat on top of circle',
        desc: isAr ? 'حرف ㅇ (مفتاح d) دائرة فارغة. حرف ㅎ (مفتاح g) دائرة تعلوها شرطتان أفقية وعمودية كالقبعة.' : 'ㅇ (ng/silent, key: d) is a bare circle. ㅎ (h, key: g) has a hat over the circle.',
        samples: ['아 / 하', '오 / 호', '우 / 후', '안 / 한'],
        keys: 'd vs g'
      }
    ];

    const wrapper = document.createElement('div');
    wrapper.className = 'lookalikes-table';

    lookalikeData.forEach(item => {
      const row = document.createElement('div');
      row.className = 'lookalike-card';

      row.innerHTML = `
        <div class="lookalike-header">
          <span class="lookalike-pair">${item.pair}</span>
          <span class="lookalike-secret"><span class="badge-tag">${typeof I18n !== 'undefined' ? I18n.t('keyClue') : 'Key Clue'}</span> ${item.secret}</span>
        </div>
        <p class="lookalike-desc">${item.desc}</p>
        <div class="lookalike-footer">
          <div class="lookalike-samples">
            <strong>${typeof I18n !== 'undefined' ? I18n.t('mapleSamples') : 'Maple Samples:'}</strong> ${item.samples.map(s => `<span class="sample-pill">${s}</span>`).join(' ')}
          </div>
          <div class="lookalike-keys">${typeof I18n !== 'undefined' ? I18n.t('keysNeeded') : 'Keys:'} <kbd>${item.keys}</kbd></div>
        </div>
      `;

      wrapper.appendChild(row);
    });

    container.appendChild(wrapper);
  }

  startDrill(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    this.drillScore = 0;
    this.drillStreak = 0;
    this.nextDrillQuestion(container);
  }

  nextDrillQuestion(container) {
    const pool = Hangul.CHOSEONG.concat(['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ', 'ㅐ', 'ㅔ']);
    const target = pool[Math.floor(Math.random() * pool.length)];
    this.currentDrillTarget = target;
    const info = Hangul.JAMO_INFO[target] || {};

    const promptText = typeof I18n !== 'undefined' ? I18n.t('drillPrompt') : 'Identify this letter & press its QWERTY key:';
    const skipText = typeof I18n !== 'undefined' ? I18n.t('drillSkip') : 'Skip';

    container.innerHTML = `
      <div class="drill-card">
        <div class="drill-stats-bar">
          <span>Streak: <strong id="drill-streak">${this.drillStreak}</strong></span>
          <span>Score: <strong id="drill-score">${this.drillScore}</strong></span>
        </div>
        <div class="drill-question-box">
          <div class="drill-prompt">${promptText}</div>
          <div class="drill-letter-canvas-wrapper">
            <canvas id="drill-canvas" width="120" height="120"></canvas>
          </div>
          <div class="drill-hint-text">Letter: ${info.name || ''} (${info.sound || ''})</div>
        </div>
        <div class="drill-input-row">
          <input type="text" id="drill-input" class="drill-input" maxlength="1" placeholder="..." autofocus autocomplete="off" />
          <button id="drill-skip-btn" class="btn btn-secondary">${skipText}</button>
        </div>
        <div id="drill-feedback" class="drill-feedback"></div>
      </div>
    `;

    this.renderDrillCanvas('drill-canvas', target);

    const input = document.getElementById('drill-input');
    const feedback = document.getElementById('drill-feedback');
    const skipBtn = document.getElementById('drill-skip-btn');

    input.focus();

    input.addEventListener('input', () => {
      const typed = input.value.trim();
      if (!typed) return;

      const expectedKey = info.key ? info.key.split(' ')[0].toLowerCase() : '';
      const isCorrect = typed.toLowerCase() === expectedKey || typed === target;

      if (isCorrect) {
        this.drillScore += 10;
        this.drillStreak += 1;
        feedback.innerHTML = `<span class="text-success">✓ Correct! Key is <strong>${expectedKey.toUpperCase()}</strong></span>`;
        if (this.options.onPlaySound) this.options.onPlaySound('correct');
        setTimeout(() => this.nextDrillQuestion(container), 400);
      } else {
        this.drillStreak = 0;
        feedback.innerHTML = `<span class="text-error">✗ Incorrect. Key is <strong>${expectedKey.toUpperCase()}</strong></span>`;
        if (this.options.onPlaySound) this.options.onPlaySound('error');
        input.value = '';
      }
    });

    skipBtn.addEventListener('click', () => {
      this.nextDrillQuestion(container);
    });
  }

  renderDrillCanvas(canvasId, char) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#cfd0e4';
    ctx.fillRect(0, 0, 120, 120);

    ctx.font = 'bold 64px Galmuri11, NeoDunggeunmo, Malgun Gothic, Dotum, sans-serif';
    ctx.fillStyle = '#2645be';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, 60, 60);

    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = Math.random() < 0.5 ? '#e53935' : '#43a047';
      ctx.fillRect(Math.floor(Math.random() * 120), Math.floor(Math.random() * 120), 1, 1);
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HangulAcademy;
}
