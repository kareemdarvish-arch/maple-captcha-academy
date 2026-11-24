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

  // 3. Player Authentication & Header Widget (2-Step: Google First, then IGN & Avatar)
  const profileWidget = document.getElementById('user-profile-header-widget');
  const signinModal = document.getElementById('signin-modal');
  const btnOpenSignin = document.getElementById('btn-open-signin-modal');
  const btnCloseSignin = document.getElementById('btn-close-signin-modal');
  const btnGoogleSignin = document.getElementById('btn-google-signin');
  const inputGoogleEmail = document.getElementById('input-google-email');
  const btnVerifyGoogleEmail = document.getElementById('btn-verify-google-email');
  const verifiedGoogleChip = document.getElementById('verified-google-chip');
  const verifiedEmailText = document.getElementById('verified-email-text');
  const btnChangeGoogleEmail = document.getElementById('btn-change-google-email');
  const authStepGoogle = document.getElementById('auth-step-google');
  const authStepIgn = document.getElementById('auth-step-ign');
  const inputPlayerName = document.getElementById('input-player-name');
  const btnCompleteReg = document.getElementById('btn-complete-registration');
  const avatarChoices = document.querySelectorAll('.avatar-choice');

  let verifiedGoogleEmail = null;
  let selectedAvatar = '🍁';

  function updateAuthUI() {
    const profile = PlayerAuth.getProfile();
    if (profile && profile.name) {
      profileWidget.innerHTML = `
        <div class="user-chip">
          <span class="user-chip-avatar">${profile.avatar || '🍁'}</span>
          <span class="user-chip-name">${profile.name}</span>
          <span class="user-verified-badge" title="تم التحقق بحساب Google: ${profile.email}">✓ G</span>
          <button type="button" id="btn-signout" class="btn-signout" title="تسجيل الخروج">✕</button>
        </div>
      `;
      const signoutBtn = document.getElementById('btn-signout');
      if (signoutBtn) signoutBtn.addEventListener('click', () => PlayerAuth.signOut());
    } else {
      profileWidget.innerHTML = `
        <button id="btn-open-signin-modal" class="btn btn-sm btn-primary">
          <span data-i18n="btnSignIn">👤 سجل بجوجل واسمك</span>
        </button>
      `;
      const openBtn = document.getElementById('btn-open-signin-modal');
      if (openBtn) openBtn.addEventListener('click', openSignInModal);
    }
  }

  function openSignInModal() {
    if (signinModal) {
      signinModal.classList.add('active');
      const profile = PlayerAuth.getProfile();
      if (profile && profile.email) {
        setGoogleVerified(profile.email);
        if (inputPlayerName) inputPlayerName.value = profile.name || '';
      } else {
        resetSignInForm();
      }
    }
  }

  function closeSignInModal() {
    if (signinModal) signinModal.classList.remove('active');
  }

  function setGoogleVerified(email) {
    verifiedGoogleEmail = email.trim().toLowerCase();
    if (authStepGoogle) authStepGoogle.style.display = 'none';
    if (verifiedGoogleChip) {
      verifiedGoogleChip.style.display = 'flex';
      if (verifiedEmailText) verifiedEmailText.textContent = verifiedGoogleEmail;
    }
    if (authStepIgn) {
      authStepIgn.classList.remove('auth-step-locked');
      const indicator = authStepIgn.querySelector('.auth-step-indicator');
      if (indicator) indicator.classList.add('active');
    }
    if (inputPlayerName) {
      inputPlayerName.disabled = false;
      inputPlayerName.focus();
    }
    if (btnCompleteReg) {
      btnCompleteReg.disabled = false;
    }
  }

  function resetSignInForm() {
    verifiedGoogleEmail = null;
    if (authStepGoogle) authStepGoogle.style.display = 'block';
    if (verifiedGoogleChip) verifiedGoogleChip.style.display = 'none';
    if (authStepIgn) {
      authStepIgn.classList.add('auth-step-locked');
      const indicator = authStepIgn.querySelector('.auth-step-indicator');
      if (indicator) indicator.classList.remove('active');
    }
    if (inputPlayerName) {
      inputPlayerName.disabled = true;
      inputPlayerName.value = '';
    }
    if (btnCompleteReg) btnCompleteReg.disabled = true;
    if (inputGoogleEmail) inputGoogleEmail.value = '';
  }

  if (btnOpenSignin) btnOpenSignin.addEventListener('click', openSignInModal);
  if (btnCloseSignin) btnCloseSignin.addEventListener('click', closeSignInModal);

  // 1-Click Fast Google Sign-In Simulation
  if (btnGoogleSignin) {
    btnGoogleSignin.addEventListener('click', () => {
      SoundFX.playKeyClick();
      const promptEmail = prompt(
        I18n.getLang() === 'ar'
          ? 'أدخل بريد حساب Google الخاص بك (مثال: player@gmail.com):'
          : 'Enter your Google Account email (e.g. player@gmail.com):',
        'maple.hero@gmail.com'
      );
      if (promptEmail && promptEmail.includes('@')) {
        setGoogleVerified(promptEmail);
        SoundFX.playCorrect();
      }
    });
  }

  // Google Email Input Verification
  if (btnVerifyGoogleEmail && inputGoogleEmail) {
    const doVerify = () => {
      const email = inputGoogleEmail.value.trim();
      if (email && email.includes('@')) {
        SoundFX.playCorrect();
        setGoogleVerified(email);
      } else {
        alert(I18n.getLang() === 'ar' ? 'يُرجى إدخال بريد Google صالح (مثال: name@gmail.com)' : 'Please enter a valid Google email address');
        inputGoogleEmail.focus();
      }
    };
    btnVerifyGoogleEmail.addEventListener('click', doVerify);
    inputGoogleEmail.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doVerify();
    });
  }

  if (btnChangeGoogleEmail) {
    btnChangeGoogleEmail.addEventListener('click', () => {
      resetSignInForm();
      if (inputGoogleEmail) inputGoogleEmail.focus();
    });
  }

  avatarChoices.forEach(btn => {
    btn.addEventListener('click', () => {
      avatarChoices.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedAvatar = btn.dataset.avatar || '🍁';
    });
  });

  if (btnCompleteReg && inputPlayerName) {
    btnCompleteReg.addEventListener('click', () => {
      const ign = inputPlayerName.value.trim();
      if (!verifiedGoogleEmail) {
        alert(I18n.getLang() === 'ar' ? 'يجب تسجيل الدخول بحساب Google أولاً!' : 'Please sign in with Google first!');
        return;
      }
      if (!ign) {
        alert(I18n.getLang() === 'ar' ? 'يُرجى كتابة اسم اللاعب (IGN) الذي سيظهر في لوحة المتصدرين!' : 'Please enter your in-game name (IGN)!');
        inputPlayerName.focus();
        return;
      }

      PlayerAuth.registerPlayer(verifiedGoogleEmail, ign, selectedAvatar);
      closeSignInModal();
      SoundFX.playFanfare();
      if (typeof EgyptianCoach !== 'undefined') {
        EgyptianCoach.showRandomBanter();
      }
    });
    inputPlayerName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btnCompleteReg.click();
    });
  }

  window.addEventListener('playerAuthChanged', () => {
    updateAuthUI();
    MapleLeaderboard.renderLeaderboardTable('leaderboard-table-container', 'all');
  });

  updateAuthUI();

  // 4. Onboarding Tour Modal
  const onboardingModal = document.getElementById('onboarding-tour-modal');
  const btnOpenTourGuide = document.getElementById('btn-open-tour-guide');
  const btnCloseTour = document.getElementById('btn-close-onboarding-tour');
  const btnStartOnboarding = document.getElementById('btn-start-onboarding-now');
  const tourBtnOpenSignin = document.getElementById('tour-btn-open-signin');

  function openOnboardingTour() {
    if (onboardingModal) onboardingModal.classList.add('active');
  }

  function closeOnboardingTour(markCompleted = true) {
    if (onboardingModal) onboardingModal.classList.remove('active');
    if (markCompleted) localStorage.setItem('maple_onboarding_shown', 'true');
  }

  if (btnOpenTourGuide) btnOpenTourGuide.addEventListener('click', openOnboardingTour);
  if (btnCloseTour) btnCloseTour.addEventListener('click', () => closeOnboardingTour(true));

  if (btnStartOnboarding) {
    btnStartOnboarding.addEventListener('click', () => {
      closeOnboardingTour(true);
      openSignInModal();
    });
  }

  if (tourBtnOpenSignin) {
    tourBtnOpenSignin.addEventListener('click', () => {
      closeOnboardingTour(true);
      openSignInModal();
    });
  }

  // Auto-launch tour on first visit
  if (!localStorage.getItem('maple_onboarding_shown')) {
    setTimeout(openOnboardingTour, 600);
  }

  // 5. Tab Navigation & Player Learning Badges Tracking
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
        PlayerAuth.markHangulRead();
        academy.renderJamoGrid('jamo-grid-container', 'all');
      } else if (targetTab === 'lookalikes') {
        PlayerAuth.markLookalikesRead();
        academy.renderLookalikes('lookalikes-container');
      } else if (targetTab === 'drill') {
        PlayerAuth.markDrillCompleted();
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
