/**
 * Interactive Dubeolsik (2-Set) Korean Virtual Keyboard
 * Supports docked and floating draggable window modes, sound triggers,
 * shift toggling, and physical keyboard sync.
 */

class KoreanKeyboard {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = Object.assign({
      onInput: null,
      onBackspace: null,
      onEnter: null,
      onSpace: null,
      onClear: null,
      playClickSound: null
    }, options);

    this.isShifted = false;
    this.isCapsLock = false;
    this.isFloating = false;
    this.activeKeyElements = new Map();

    // Key definitions for Dubeolsik layout
    this.layout = [
      // Row 1: Numbers
      [
        { code: 'Backquote', label: '`', shiftLabel: '~' },
        { code: 'Digit1', label: '1', shiftLabel: '!' },
        { code: 'Digit2', label: '2', shiftLabel: '@' },
        { code: 'Digit3', label: '3', shiftLabel: '#' },
        { code: 'Digit4', label: '4', shiftLabel: '$' },
        { code: 'Digit5', label: '5', shiftLabel: '%' },
        { code: 'Digit6', label: '6', shiftLabel: '^' },
        { code: 'Digit7', label: '7', shiftLabel: '&' },
        { code: 'Digit8', label: '8', shiftLabel: '*' },
        { code: 'Digit9', label: '9', shiftLabel: '(' },
        { code: 'Digit0', label: '0', shiftLabel: ')' },
        { code: 'Minus', label: '-', shiftLabel: '_' },
        { code: 'Equal', label: '=', shiftLabel: '+' },
        { code: 'Backspace', label: '⌫ Back', isAction: true, action: 'backspace', width: 'wide-1' }
      ],
      // Row 2: QWERTY + Jamo
      [
        { code: 'Tab', label: 'Tab', isAction: true, action: 'tab', width: 'medium' },
        { code: 'KeyQ', q: 'Q', j: 'ㅂ', jShift: 'ㅃ', type: 'consonant' },
        { code: 'KeyW', q: 'W', j: 'ㅈ', jShift: 'ㅉ', type: 'consonant' },
        { code: 'KeyE', q: 'E', j: 'ㄷ', jShift: 'ㄸ', type: 'consonant' },
        { code: 'KeyR', q: 'R', j: 'ㄱ', jShift: 'ㄲ', type: 'consonant' },
        { code: 'KeyT', q: 'T', j: 'ㅅ', jShift: 'ㅆ', type: 'consonant' },
        { code: 'KeyY', q: 'Y', j: 'ㅛ', type: 'vowel' },
        { code: 'KeyU', q: 'U', j: 'ㅕ', type: 'vowel' },
        { code: 'KeyI', q: 'I', j: 'ㅑ', type: 'vowel' },
        { code: 'KeyO', q: 'O', j: 'ㅐ', jShift: 'ㅒ', type: 'vowel' },
        { code: 'KeyP', q: 'P', j: 'ㅔ', jShift: 'ㅖ', type: 'vowel' },
        { code: 'BracketLeft', label: '[', shiftLabel: '{' },
        { code: 'BracketRight', label: ']', shiftLabel: '}' },
        { code: 'Backslash', label: '\\', shiftLabel: '|' }
      ],
      // Row 3: Home row
      [
        { code: 'CapsLock', label: 'Caps', isAction: true, action: 'caps', width: 'medium' },
        { code: 'KeyA', q: 'A', j: 'ㅁ', type: 'consonant' },
        { code: 'KeyS', q: 'S', j: 'ㄴ', type: 'consonant' },
        { code: 'KeyD', q: 'D', j: 'ㅇ', type: 'consonant' },
        { code: 'KeyF', q: 'F', j: 'ㄹ', type: 'consonant' },
        { code: 'KeyG', q: 'G', j: 'ㅎ', type: 'consonant' },
        { code: 'KeyH', q: 'H', j: 'ㅗ', type: 'vowel' },
        { code: 'KeyJ', q: 'J', j: 'ㅓ', type: 'vowel' },
        { code: 'KeyK', q: 'K', j: 'ㅏ', type: 'vowel' },
        { code: 'KeyL', q: 'L', j: 'ㅣ', type: 'vowel' },
        { code: 'Semicolon', label: ';', shiftLabel: ':' },
        { code: 'Quote', label: "'", shiftLabel: '"' },
        { code: 'Enter', label: 'Enter ↵', isAction: true, action: 'enter', width: 'wide-1' }
      ],
      // Row 4: Bottom row
      [
        { code: 'ShiftLeft', label: '⇧ Shift', isAction: true, action: 'shift', width: 'wide-1' },
        { code: 'KeyZ', q: 'Z', j: 'ㅋ', type: 'consonant' },
        { code: 'KeyX', q: 'X', j: 'ㅌ', type: 'consonant' },
        { code: 'KeyC', q: 'C', j: 'ㅊ', type: 'consonant' },
        { code: 'KeyV', q: 'V', j: 'ㅍ', type: 'consonant' },
        { code: 'KeyB', q: 'B', j: 'ㅠ', type: 'vowel' },
        { code: 'KeyN', q: 'N', j: 'ㅜ', type: 'vowel' },
        { code: 'KeyM', q: 'M', j: 'ㅡ', type: 'vowel' },
        { code: 'Comma', label: ',', shiftLabel: '<' },
        { code: 'Period', label: '.', shiftLabel: '>' },
        { code: 'Slash', label: '/', shiftLabel: '?' },
        { code: 'ShiftRight', label: '⇧ Shift', isAction: true, action: 'shift', width: 'wide-1' }
      ],
      // Row 5: Space and control bar
      [
        { code: 'ClearAll', label: 'Clear ✕', isAction: true, action: 'clear', width: 'medium' },
        { code: 'Space', label: 'Space Bar', isAction: true, action: 'space', width: 'spacebar' },
        { code: 'SubmitCaptcha', label: 'Submit ✓', isAction: true, action: 'enter', width: 'medium' }
      ]
    ];

    this.render();
    this.bindPhysicalEvents();
    this.setupDraggable();
  }

  /**
   * Build keyboard HTML
   */
  render() {
    if (!this.container) return;
    this.container.innerHTML = '';

    const kbWrapper = document.createElement('div');
    kbWrapper.className = 'virtual-keyboard-inner';
    kbWrapper.id = 'virtual-keyboard-inner-box';

    // Drag handle header (visible when floating)
    const dragBar = document.createElement('div');
    dragBar.className = 'kb-drag-handle';
    dragBar.innerHTML = `
      <span class="drag-title">🪟 Korean Keyboard (두벌식) - Drag Anywhere</span>
      <div class="drag-actions">
        <button type="button" id="btn-dock-keyboard-internal" class="btn-dock" title="Dock Keyboard">⬇️ Dock</button>
      </div>
    `;
    kbWrapper.appendChild(dragBar);

    // Header legend / tip bar
    const legend = document.createElement('div');
    legend.className = 'kb-legend';
    legend.innerHTML = `
      <div class="legend-item"><span class="legend-swatch consonant"></span> <strong data-i18n="leftHand">${typeof I18n !== 'undefined' ? I18n.t('leftHand') : 'Left Hand: Consonants (자음)'}</strong></div>
      <div class="legend-item"><span class="legend-swatch vowel"></span> <strong data-i18n="rightHand">${typeof I18n !== 'undefined' ? I18n.t('rightHand') : 'Right Hand: Vowels (모음)'}</strong></div>
      <div class="legend-tip" data-i18n="shiftTip">${typeof I18n !== 'undefined' ? I18n.t('shiftTip') : 'Shift for Double Letters (ㄲ, ㄸ, ㅃ, ㅆ, ㅉ, ㅒ, ㅖ)'}</div>
    `;
    kbWrapper.appendChild(legend);

    // Build rows
    this.layout.forEach((rowDef) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'kb-row';

      rowDef.forEach((keyDef) => {
        const keyBtn = document.createElement('button');
        keyBtn.type = 'button';
        keyBtn.className = 'kb-key';
        keyBtn.dataset.code = keyDef.code;

        if (keyDef.width) keyBtn.classList.add(`key-${keyDef.width}`);
        if (keyDef.type) keyBtn.classList.add(`key-${keyDef.type}`);
        if (keyDef.isAction) keyBtn.classList.add('key-action');

        this.updateKeyContent(keyBtn, keyDef);

        // Click / Touch handler
        keyBtn.addEventListener('mousedown', (e) => {
          e.preventDefault();
          this.handleKeyClick(keyDef, keyBtn);
        });

        this.activeKeyElements.set(keyDef.code, { el: keyBtn, def: keyDef });
        rowEl.appendChild(keyBtn);
      });

      kbWrapper.appendChild(rowEl);
    });

    this.container.appendChild(kbWrapper);

    const dockBtn = document.getElementById('btn-dock-keyboard-internal');
    if (dockBtn) {
      dockBtn.addEventListener('click', () => this.toggleFloating(false));
    }
  }

  updateKeyContent(keyBtn, keyDef) {
    if (keyDef.isAction) {
      keyBtn.innerHTML = `<span class="action-label">${keyDef.label}</span>`;
      return;
    }

    if (keyDef.j) {
      const activeHangul = (this.isShifted && keyDef.jShift) ? keyDef.jShift : keyDef.j;
      const subHangul = keyDef.jShift && !this.isShifted ? `<span class="jamo-shift">${keyDef.jShift}</span>` : '';
      const qwertyLabel = this.isShifted ? keyDef.q : keyDef.q.toLowerCase();

      keyBtn.innerHTML = `
        <div class="key-inner">
          <div class="key-hangul-row">
            <span class="jamo-main ${this.isShifted && keyDef.jShift ? 'highlight-shift' : ''}">${activeHangul}</span>
            ${subHangul}
          </div>
          <span class="key-qwerty">${qwertyLabel}</span>
        </div>
      `;
    } else {
      const main = this.isShifted ? keyDef.shiftLabel : keyDef.label;
      const secondary = this.isShifted ? keyDef.label : keyDef.shiftLabel;
      keyBtn.innerHTML = `
        <div class="key-inner">
          <span class="key-main-symbol">${main}</span>
          ${secondary ? `<span class="key-sub-symbol">${secondary}</span>` : ''}
        </div>
      `;
    }
  }

  refreshKeys() {
    this.activeKeyElements.forEach(({ el, def }) => {
      this.updateKeyContent(el, def);
      if (def.action === 'shift') {
        el.classList.toggle('key-active-toggle', this.isShifted);
      }
      if (def.action === 'caps') {
        el.classList.toggle('key-active-toggle', this.isCapsLock);
      }
    });
  }

  handleKeyClick(keyDef, keyBtn) {
    if (this.options.playClickSound) {
      this.options.playClickSound(keyDef.type || 'default');
    }

    keyBtn.classList.add('key-pressed');
    setTimeout(() => keyBtn.classList.remove('key-pressed'), 120);

    if (keyDef.isAction) {
      switch (keyDef.action) {
        case 'shift':
          this.isShifted = !this.isShifted;
          this.refreshKeys();
          break;
        case 'caps':
          this.isCapsLock = !this.isCapsLock;
          this.isShifted = this.isCapsLock;
          this.refreshKeys();
          break;
        case 'backspace':
          if (this.options.onBackspace) this.options.onBackspace();
          break;
        case 'space':
          if (this.options.onSpace) this.options.onSpace();
          break;
        case 'enter':
          if (this.options.onEnter) this.options.onEnter();
          break;
        case 'clear':
          if (this.options.onClear) this.options.onClear();
          break;
      }
      return;
    }

    let inputChar = '';
    if (keyDef.j) {
      inputChar = (this.isShifted && keyDef.jShift) ? keyDef.q : keyDef.q.toLowerCase();
    } else {
      inputChar = this.isShifted ? keyDef.shiftLabel : keyDef.label;
    }

    if (this.options.onInput && inputChar) {
      this.options.onInput(inputChar);
    }

    if (this.isShifted && !this.isCapsLock) {
      this.isShifted = false;
      this.refreshKeys();
    }
  }

  bindPhysicalEvents() {
    window.addEventListener('keydown', (e) => {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.tagName === 'INPUT' && !activeEl.classList.contains('trainer-input')) {
        return;
      }

      const keyInfo = this.activeKeyElements.get(e.code);
      if (keyInfo) {
        keyInfo.el.classList.add('key-pressed');
      }

      if (e.key === 'Shift') {
        if (!this.isShifted) {
          this.isShifted = true;
          this.refreshKeys();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      const keyInfo = this.activeKeyElements.get(e.code);
      if (keyInfo) {
        keyInfo.el.classList.remove('key-pressed');
      }

      if (e.key === 'Shift') {
        this.isShifted = false;
        this.refreshKeys();
      }
    });
  }

  /**
   * Floating & Draggable window logic
   */
  toggleFloating(forceState = null) {
    this.isFloating = (forceState !== null) ? forceState : !this.isFloating;
    const kbInner = document.getElementById('virtual-keyboard-inner-box');

    if (kbInner) {
      if (this.isFloating) {
        kbInner.classList.add('is-floating-window');
        // Initial center-bottom position
        kbInner.style.top = 'auto';
        kbInner.style.bottom = '20px';
        kbInner.style.left = '50%';
        kbInner.style.transform = 'translateX(-50%)';
      } else {
        kbInner.classList.remove('is-floating-window');
        kbInner.style.top = '';
        kbInner.style.bottom = '';
        kbInner.style.left = '';
        kbInner.style.transform = '';
      }
    }

    return this.isFloating;
  }

  setupDraggable() {
    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;

    const getTarget = () => document.getElementById('virtual-keyboard-inner-box');

    document.addEventListener('mousedown', (e) => {
      const handle = e.target.closest('.kb-drag-handle');
      const target = getTarget();
      if (!handle || !target || !this.isFloating) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      const rect = target.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      target.style.bottom = 'auto';
      target.style.transform = 'none';
      target.style.left = `${initialLeft}px`;
      target.style.top = `${initialTop}px`;
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const target = getTarget();
      if (!target) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      target.style.left = `${initialLeft + dx}px`;
      target.style.top = `${initialTop + dy}px`;
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  highlightKey(jamoOrChar) {
    this.clearHighlights();
    this.activeKeyElements.forEach(({ el, def }) => {
      if (def.j === jamoOrChar || def.jShift === jamoOrChar || def.q === jamoOrChar || def.label === jamoOrChar) {
        el.classList.add('key-hint-glow');
      }
    });
  }

  clearHighlights() {
    this.activeKeyElements.forEach(({ el }) => {
      el.classList.remove('key-hint-glow');
    });
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KoreanKeyboard;
}
