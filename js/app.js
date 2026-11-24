/**
 * MapleCaptcha Academy - Application Orchestrator
 * Connects UI tabs, Standalone Exam Mode, Leaderboard, Player Authentication,
 * Floating Keyboard, and Smart Diagnostics.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Components
  const canvas = document.getElementById('captcha-canvas');
  const generator = new MapleCaptchaGenerator(canvas, {
    width: 520,
    height: 115,
    background: 'sky_rock',
    noisePreset: 'normal',
    tiltAngle: -4.5
  });

  // Use keyboard stub for physical Windows keyboard
  const keyboardStub = {
    highlightKey: () => {},
    options: {}
  };
  const game = new MapleCaptchaGame(generator, keyboardStub);
  const academy = new HangulAcademy({
    onHighlightKey: () => {},
    onPlaySound: (type) => {
      if (type === 'correct') SoundFX.playCorrect();
      else if (type === 'error') SoundFX.playError();
      else SoundFX.playKeyClick();
    }
  });

  // 2. Language Selector (Default: Arabic 🇪🇬)
  const langSelect = document.getElementById('select-language');
  if (langSelect) {
    langSelect.value = I18n.getLang();
    langSelect.addEventListener('change', (e) => {
      I18n.setLang(e.target.value);
    });
  }
  I18n.setLang(I18n.getLang());

  // 3. Player Authentication & Header Widget
  const profileWidget = document.getElementById('user-profile-header-widget');
  const signinModal = document.getElementById('signin-modal');
  const btnOpenSignin = document.getElementById('btn-open-signin-modal');
  const btnCloseSignin = document.getElementById('btn-close-signin-modal');
  const btnGoogleSignin = document.getElementById('btn-google-signin');
  const btnCustomSignin = document.getElementById('btn-custom-signin');
  const inputPlayerName = document.getElementById('input-player-name');
  const avatarChoices = document.querySelectorAll('.avatar-choice');
  let selectedAvatar = '⚔️';

  function updateAuthUI() {
    const profile = PlayerAuth.getProfile();
    if (profile && profile.name) {
      profileWidget.innerHTML = `
        <div class="user-chip">
          <span class="user-chip-avatar">${profile.avatar || '🍁'}</span>
          <span class="user-chip-name">${profile.name}</span>
          <button type="button" id="btn-signout" class="btn-signout" title="Sign Out">✕</button>
        </div>
      `;
      const signoutBtn = document.getElementById('btn-signout');
      if (signoutBtn) signoutBtn.addEventListener('click', () => PlayerAuth.signOut());
    } else {
      profileWidget.innerHTML = `
        <button id="btn-open-signin-modal" class="btn btn-sm btn-primary">
          <span data-i18n="btnSignIn">${I18n.t('btnSignIn')}</span>
        </button>
      `;
      const openBtn = document.getElementById('btn-open-signin-modal');
      if (openBtn) openBtn.addEventListener('click', openSignInModal);
    }
  }

  function openSignInModal() {
    if (signinModal) signinModal.classList.add('active');
  }

  function closeSignInModal() {
    if (signinModal) signinModal.classList.remove('active');
  }

  if (btnOpenSignin) btnOpenSignin.addEventListener('click', openSignInModal);
  if (btnCloseSignin) btnCloseSignin.addEventListener('click', closeSignInModal);

  avatarChoices.forEach(btn => {
    btn.addEventListener('click', () => {
      avatarChoices.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedAvatar = btn.dataset.avatar || '⚔️';
    });
  });

  if (btnCustomSignin && inputPlayerName) {
    btnCustomSignin.addEventListener('click', () => {
      const name = inputPlayerName.value.trim();
      if (name) {
        PlayerAuth.signInCustom(name, selectedAvatar);
        closeSignInModal();
        SoundFX.playCorrect();
      } else {
        inputPlayerName.focus();
      }
    });
    inputPlayerName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btnCustomSignin.click();
    });
  }

  if (btnGoogleSignin) {
    btnGoogleSignin.addEventListener('click', () => {
      // Simulate Google Sign In with realistic profile prompt or mock
      const mockName = prompt(I18n.getLang() === 'ar' ? 'ادخل بريدك الإلكتروني أو اسمك لحساب Google:' : 'Enter your Google name or email:', 'maple_hero');
      if (mockName) {
        PlayerAuth.signInGoogle(mockName.includes('@') ? mockName : `${mockName}@gmail.com`, mockName.replace('@gmail.com', ''));
        closeSignInModal();
        SoundFX.playFanfare();
      }
    });
  }

  window.addEventListener('playerAuthChanged', () => {
    updateAuthUI();
    MapleLeaderboard.renderLeaderboardTable('leaderboard-table-container', 'all');
  });

  updateAuthUI();

  // 4. Tab Navigation
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
      } else if (targetTab === 'leaderboard') {
        MapleLeaderboard.renderLeaderboardTable('leaderboard-table-container', 'all');
      } else if (targetTab === 'trainer') {
        const input = document.getElementById('captcha-hidden-input');
        if (input) input.focus();
      }
    });
  });

  // 5. Standalone Exam Tab Setup
  const btnStartExam = document.getElementById('btn-start-exam-standalone');
  const selectStandaloneLength = document.getElementById('select-standalone-exam-length');
  const examIntroCard = document.getElementById('exam-intro-card');
  const examStageContainer = document.getElementById('exam-stage-container');

  if (btnStartExam && selectStandaloneLength) {
    btnStartExam.addEventListener('click', () => {
      // If player not signed in, prompt them nicely
      if (!PlayerAuth.isSignedIn()) {
        const wantsSignin = confirm(I18n.t('signInPromptBeforeExam'));
        if (wantsSignin) {
          openSignInModal();
          return;
        }
      }

      SoundFX.playKeyClick();
      const length = parseInt(selectStandaloneLength.value, 10) || 10;
      game.examLength = length;

      if (examIntroCard) examIntroCard.style.display = 'none';
      if (examStageContainer) {
        examStageContainer.style.display = 'block';
        // Move the canvas and input into exam container cleanly before the notice
        const stageCard = document.getElementById('captcha-main-stage-card');
        if (stageCard) {
          const noticeCard = examStageContainer.querySelector('.exam-kb-notice-card');
          if (noticeCard) {
            examStageContainer.insertBefore(stageCard, noticeCard);
          } else {
            examStageContainer.appendChild(stageCard);
          }
        }
      }

      game.startExam(length);
    });
  }

  // When switching back to Trainer tab, move stage card back if needed
  const trainerTabBtn = document.querySelector('[data-tab="trainer"]');
  if (trainerTabBtn) {
    trainerTabBtn.addEventListener('click', () => {
      const stageCard = document.getElementById('captcha-main-stage-card');
      const trainerHolder = document.getElementById('trainer-stage-holder');
      if (stageCard && trainerHolder && !trainerHolder.contains(stageCard)) {
        trainerHolder.appendChild(stageCard);
      }
      if (examIntroCard) examIntroCard.style.display = 'block';
      if (examStageContainer) examStageContainer.style.display = 'none';
      game.setMode('practice');
    });
  }

  // 6. Leaderboard Filters
  const lbFilterBtns = document.querySelectorAll('.lb-filter-btn');
  lbFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      lbFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      SoundFX.playKeyClick();
      MapleLeaderboard.renderLeaderboardTable('leaderboard-table-container', btn.dataset.filter);
    });
  });

  // 7. Trainer Controls
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

  const btnMute = document.getElementById('btn-toggle-sound');
  if (btnMute) {
    let muted = SoundFX.getMuted();
    btnMute.innerHTML = muted ? I18n.t('soundOff') : I18n.t('soundOn');
    btnMute.classList.toggle('muted', muted);

    btnMute.addEventListener('click', () => {
      muted = !muted;
      SoundFX.setMuted(muted);
      btnMute.innerHTML = muted ? I18n.t('soundOff') : I18n.t('soundOn');
      btnMute.classList.toggle('muted', muted);
      if (!muted) SoundFX.playKeyClick();
    });
  }

  const btnCloseTruthRoom = document.getElementById('btn-close-truth-room');
  if (btnCloseTruthRoom) {
    btnCloseTruthRoom.addEventListener('click', () => {
      game.closeTruthRoom();
    });
  }

  // 9. Academy Filters & Syllable Deconstructor
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

  // 10. Custom Captcha Sandbox
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
      width: 520,
      height: 115,
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

  // 11. Initial Startup
  game.newRound();
  game.updateStatsUI();

  if (typeof EgyptianCoach !== 'undefined') {
    EgyptianCoach.init();
  }

  // Expose for debugging & accessibility
  window.game = game;
  window.generator = generator;

  academy.renderLookalikes('lookalikes-container');
  academy.inspectCharacter('빛');
  MapleLeaderboard.renderLeaderboardTable('leaderboard-table-container', 'all');
});
