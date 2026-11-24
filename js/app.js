/**
 * MapleCaptcha Academy - Application Orchestrator
 * Connects UI tabs, controls, settings, i18n, generator, keyboard, smart diagnostics, and academy.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Components
  const canvas = document.getElementById('captcha-canvas');
  const generator = new MapleCaptchaGenerator(canvas, {
    width: 720,
    height: 210,
    background: 'sky_rock',
    noisePreset: 'normal',
    tiltAngle: -4.5
  });

  const keyboard = new KoreanKeyboard('virtual-keyboard-container');
  const game = new MapleCaptchaGame(generator, keyboard);
  const academy = new HangulAcademy({
    onHighlightKey: (key) => keyboard.highlightKey(key),
    onPlaySound: (type) => {
      if (type === 'correct') SoundFX.playCorrect();
      else if (type === 'error') SoundFX.playError();
      else SoundFX.playKeyClick();
    }
  });

  // 2. Language Selector
  const langSelect = document.getElementById('select-language');
  if (langSelect) {
    langSelect.value = I18n.getLang();
    langSelect.addEventListener('change', (e) => {
      I18n.setLang(e.target.value);
    });
  }
  // Initial translations
  I18n.setLang(I18n.getLang());

  // 3. Tab Navigation
  const tabButtons = document.querySelectorAll('.nav-tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const pane = document.getElementById(`tab-${targetTab}`);
      if (pane) pane.classList.add('active');

      SoundFX.playKeyClick();

      if (targetTab === 'academy') {
        academy.renderJamoGrid('jamo-grid-container', 'all');
      } else if (targetTab === 'lookalikes') {
        academy.renderLookalikes('lookalikes-container');
      } else if (targetTab === 'drill') {
        academy.startDrill('drill-container');
      } else if (targetTab === 'trainer') {
        const input = document.getElementById('captcha-hidden-input');
        if (input) input.focus();
      }
    });
  });

  // 4. Trainer Controls
  const modeSelect = document.getElementById('select-game-mode');
  if (modeSelect) {
    modeSelect.addEventListener('change', (e) => {
      game.setMode(e.target.value);
    });
  }

  const categorySelect = document.getElementById('select-syllable-set');
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      game.newRound(e.target.value);
    });
  }

  const noiseSelect = document.getElementById('select-noise-level');
  if (noiseSelect) {
    noiseSelect.addEventListener('change', (e) => {
      generator.setConfig({ noisePreset: e.target.value });
      generator.render();
    });
  }

  const bgSelect = document.getElementById('select-background');
  if (bgSelect) {
    bgSelect.addEventListener('change', (e) => {
      generator.setConfig({ background: e.target.value });
      generator.render();
    });
  }

  // Buttons
  const btnNext = document.getElementById('btn-next-captcha');
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      SoundFX.playKeyClick();
      game.newRound();
    });
  }

  const btnMagnifier = document.getElementById('btn-toggle-magnifier');
  if (btnMagnifier) {
    btnMagnifier.addEventListener('click', () => {
      SoundFX.playKeyClick();
      const isActive = generator.toggleMagnifier();
      btnMagnifier.classList.toggle('btn-active', isActive);
      btnMagnifier.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  const btnHint = document.getElementById('btn-toggle-hint');
  if (btnHint) {
    btnHint.addEventListener('click', () => {
      SoundFX.playKeyClick();
      game.toggleHint();
    });
  }

  const btnClear = document.getElementById('btn-clear-input');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      SoundFX.playKeyClick();
      game.clearInput();
    });
  }

  const btnSubmit = document.getElementById('btn-submit-captcha');
  if (btnSubmit) {
    btnSubmit.addEventListener('click', () => {
      game.submitAnswer();
    });
  }

  // Floating Keyboard Toggle Button
  const btnFloatKb = document.getElementById('btn-toggle-float-keyboard');
  if (btnFloatKb) {
    btnFloatKb.addEventListener('click', () => {
      SoundFX.playKeyClick();
      const isFloating = keyboard.toggleFloating();
      btnFloatKb.innerHTML = isFloating ? I18n.t('btnDockKb') : I18n.t('btnFloatingKb');
      btnFloatKb.classList.toggle('btn-active', isFloating);
    });
  }

  const btnMute = document.getElementById('btn-toggle-sound');
  if (btnMute) {
    let muted = SoundFX.getMuted();
    updateMuteButtonUI(muted);

    btnMute.addEventListener('click', () => {
      muted = !muted;
      SoundFX.setMuted(muted);
      updateMuteButtonUI(muted);
      if (!muted) SoundFX.playKeyClick();
    });
  }

  function updateMuteButtonUI(isMuted) {
    if (!btnMute) return;
    btnMute.innerHTML = isMuted ? I18n.t('soundOff') : I18n.t('soundOn');
    btnMute.classList.toggle('muted', isMuted);
  }

  // Truth Room Modal Close
  const btnCloseTruthRoom = document.getElementById('btn-close-truth-room');
  if (btnCloseTruthRoom) {
    btnCloseTruthRoom.addEventListener('click', () => {
      game.closeTruthRoom();
    });
  }

  // Academy Filters & Syllable Deconstructor
  const jamoFilterBtns = document.querySelectorAll('.jamo-filter-btn');
  jamoFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      jamoFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      SoundFX.playKeyClick();
      academy.renderJamoGrid('jamo-grid-container', btn.dataset.filter);
    });
  });

  const inspectInput = document.getElementById('inspect-char-input');
  const inspectBtn = document.getElementById('inspect-char-btn');
  if (inspectInput && inspectBtn) {
    const doInspect = () => {
      const char = inspectInput.value.trim().charAt(0);
      if (char) {
        SoundFX.playKeyClick();
        academy.inspectCharacter(char, 'deconstructor-output');
      }
    };
    inspectBtn.addEventListener('click', doInspect);
    inspectInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doInspect();
    });
  }

  // Custom Captcha Sandbox
  const sandboxInput = document.getElementById('sandbox-custom-text');
  const sandboxGenerateBtn = document.getElementById('sandbox-generate-btn');
  const sandboxRandomBtn = document.getElementById('sandbox-random-btn');
  const sandboxExportBtn = document.getElementById('sandbox-export-btn');
  const sandboxTilt = document.getElementById('sandbox-tilt-slider');
  const sandboxTiltVal = document.getElementById('sandbox-tilt-val');
  const sandboxNoisePreset = document.getElementById('sandbox-noise-preset');
  const sandboxBg = document.getElementById('sandbox-bg');

  const sandboxCanvas = document.getElementById('sandbox-canvas');
  let sandboxGen = null;
  if (sandboxCanvas) {
    sandboxGen = new MapleCaptchaGenerator(sandboxCanvas, {
      width: 720,
      height: 210,
      background: 'sky_rock',
      noisePreset: 'normal',
      tiltAngle: -4.5
    });
    sandboxGen.generate('메이플스토리');
  }

  if (sandboxGenerateBtn && sandboxInput && sandboxGen) {
    sandboxGenerateBtn.addEventListener('click', () => {
      const val = sandboxInput.value.trim();
      if (val) {
        SoundFX.playKeyClick();
        sandboxGen.generate(val);
      }
    });
  }

  if (sandboxRandomBtn && sandboxGen) {
    sandboxRandomBtn.addEventListener('click', () => {
      SoundFX.playKeyClick();
      const txt = Hangul.generateCaptchaText({ length: 6, category: 'balanced' });
      if (sandboxInput) sandboxInput.value = txt;
      sandboxGen.generate(txt);
    });
  }

  if (sandboxTilt && sandboxGen) {
    sandboxTilt.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (sandboxTiltVal) sandboxTiltVal.textContent = `${val}°`;
      sandboxGen.setConfig({ tiltAngle: val });
      sandboxGen.render();
    });
  }

  if (sandboxNoisePreset && sandboxGen) {
    sandboxNoisePreset.addEventListener('change', (e) => {
      sandboxGen.setConfig({ noisePreset: e.target.value });
      sandboxGen.render();
    });
  }

  if (sandboxBg && sandboxGen) {
    sandboxBg.addEventListener('change', (e) => {
      sandboxGen.setConfig({ background: e.target.value });
      sandboxGen.render();
    });
  }

  if (sandboxExportBtn && sandboxGen) {
    sandboxExportBtn.addEventListener('click', () => {
      SoundFX.playCorrect();
      sandboxGen.exportPNG('maplestory_custom_captcha.png');
    });
  }

  // Start Initial Round
  game.newRound();
  game.updateStatsUI();

  academy.renderLookalikes('lookalikes-container');
  academy.inspectCharacter('빛');
});
