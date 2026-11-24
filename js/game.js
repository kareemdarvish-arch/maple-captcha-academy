/**
 * Game Modes, Timers, Scoring, Smart Diagnostics, Official Exam Mode (10/15/20) & Detailed Error Report
 */

class MapleCaptchaGame {
  constructor(generator, keyboard, options = {}) {
    this.generator = generator;
    this.keyboard = keyboard;
    this.options = options;

    this.mode = 'practice'; // 'practice', 'test', 'speedrun', 'exam'
    this.category = 'balanced';
    this.timerDuration = 30;
    this.timeLeft = 30;
    this.examTimerDuration = 60; // 1 minute for official exam
    this.timerInterval = null;

    // Exam Mode (10, 15, 20 captchas)
    this.examLength = 10;
    this.examCurrentIndex = 0;
    this.examQuestions = [];
    this.examTotalTime = 0;
    this.examFailedQueue = [];

    // General Stats
    this.stats = this.loadStats();
    this.strikes = 0;
    this.maxStrikes = 3;
    this.currentStreak = 0;
    this.startTime = null;
    this.speedrunCount = 0;
    this.speedrunTotalTime = 0;
    this.prevTypedLen = 0;

    this.automaton = new Hangul.HangulAutomaton();
    this.elements = {};
    this.bindDOM();

    window.addEventListener('languageChanged', () => {
      this.updateStatsUI();
      if (this.currentRoundData) {
        this.renderDeconstructionPreview(this.currentRoundData);
      }
      this.updateExamUI();
    });
  }

  loadStats() {
    const saved = localStorage.getItem('maple_captcha_stats');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      totalSolved: 0,
      totalFailed: 0,
      bestStreak: 0,
      fastestTime: null,
      history: []
    };
  }

  saveStats() {
    localStorage.setItem('maple_captcha_stats', JSON.stringify(this.stats));
    this.updateStatsUI();
  }

  bindDOM() {
    this.elements = {
      inputDisplay: document.getElementById('captcha-input-display'),
      textInput: document.getElementById('captcha-hidden-input'),
      timerBar: document.getElementById('timer-progress-fill'),
      timerText: document.getElementById('timer-time-left'),
      timerContainer: document.getElementById('timer-container'),
      streakDisplay: document.getElementById('stat-streak'),
      strikesContainer: document.getElementById('strikes-container'),
      feedbackBox: document.getElementById('feedback-banner'),
      hintDrawer: document.getElementById('captcha-hint-drawer'),
      truthRoomModal: document.getElementById('truth-room-modal'),
      examResultsModal: document.getElementById('exam-results-modal'),
      deconstructedPreview: document.getElementById('current-captcha-breakdown'),
      examProgressBanner: document.getElementById('exam-progress-banner'),
      examProgressText: document.getElementById('exam-progress-text'),
      examScoreText: document.getElementById('exam-score-text'),
      examProgressBarFill: document.getElementById('exam-progress-bar-fill')
    };

    this.keyboard.options.onInput = (char) => this.handleKeystroke(char);
    this.keyboard.options.onBackspace = () => this.handleBackspace();
    this.keyboard.options.onEnter = () => this.submitAnswer();
    this.keyboard.options.onSpace = () => this.handleKeystroke(' ');
    this.keyboard.options.onClear = () => this.clearInput();
    this.keyboard.options.playClickSound = (type) => SoundFX.playKeyClick(type);

    if (this.elements.textInput) {
      this.elements.textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          this.submitAnswer();
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          this.handleBackspace();
        } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
          this.handleKeystroke(e.key);
        }
      });

      this.elements.textInput.addEventListener('input', (e) => {
        if (e.data && Hangul.isSyllable(e.data)) {
          this.automaton.setText(this.automaton.getValue() + e.data);
          this.renderInput();
        }
      });
    }

    // Global Enter key listener for frictionless exam & trainer confirmation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (e.target === this.elements.textInput) return; // Already handled by textInput listener
        const activeModal = document.querySelector('.modal-overlay.active, .onboarding-modal-overlay.active');
        if (!activeModal && (this.mode === 'exam' || this.mode === 'test' || this.mode === 'practice')) {
          if (document.activeElement && document.activeElement.tagName === 'INPUT' && document.activeElement.id !== 'captcha-hidden-input') {
            return;
          }
          e.preventDefault();
          this.submitAnswer();
        }
      }
    });

    document.addEventListener('click', (e) => {
      if (this.elements.textInput && !e.target.closest('button, input, select, textarea, a, .kb-drag-handle, .modal-overlay')) {
        this.elements.textInput.focus();
      }
    });
  }

  /**
   * Start or Advance Round
   */
  newRound(category = null) {
    if (category) this.category = category;

    this.automaton.reset();
    this.prevTypedLen = 0;
    this.renderInput();
    this.hideFeedback();
    this.hideHint();

    let targetWord = null;

    // Check if we are in Exam Mode with predefined questions
    if (this.mode === 'exam' && this.examQuestions[this.examCurrentIndex]) {
      targetWord = this.examQuestions[this.examCurrentIndex].targetText;
    }

    const data = this.generator.generate(targetWord, this.category);
    this.currentRoundData = data;
    this.startTime = Date.now();

    this.renderDeconstructionPreview(data);

    if (this.mode === 'test') {
      this.startTimer(30);
    } else if (this.mode === 'exam') {
      this.startTimer(60); // 1 minute (60 seconds) per captcha question in official exam
    } else if (this.mode === 'speedrun') {
      this.startTimer(45);
    } else {
      this.stopTimer();
      if (this.elements.timerContainer) {
        this.elements.timerContainer.style.display = 'none';
      }
    }

    this.updateExamUI();

    if (this.elements.textInput) {
      this.elements.textInput.value = '';
      this.elements.textInput.focus();
    }
  }

  setMode(mode) {
    this.mode = mode;
    this.strikes = 0;
    this.updateStrikesUI();

    if (this.mode === 'exam') {
      this.startExam(this.examLength);
      return;
    }

    if (this.elements.examProgressBanner) {
      this.elements.examProgressBanner.style.display = 'none';
    }

    if (this.mode === 'test' || this.mode === 'speedrun') {
      if (this.elements.timerContainer) this.elements.timerContainer.style.display = 'flex';
      if (this.mode === 'speedrun') {
        this.speedrunCount = 0;
        this.speedrunTotalTime = 0;
      }
    } else {
      if (this.elements.timerContainer) this.elements.timerContainer.style.display = 'none';
      this.stopTimer();
    }

    if (this.mode === 'practice' || this.mode === 'test') {
      this.timerDuration = 30;
      this.timeLeft = 30;
    }

    if (this.mode === 'practice' && this.generator) {
      const noiseSelect = document.getElementById('select-noise-level');
      const preset = noiseSelect ? noiseSelect.value : 'hard';
      this.generator.setConfig({ noisePreset: preset });
    }

    this.newRound();
  }

  /**
   * Official Exam Mode (10, 15, or 20 questions)
   */
  startExam(length = 10, customTargets = null) {
    this.mode = 'exam';
    this.examLength = length;
    this.timerDuration = 60; // 1 minute (60 seconds) official exam timer
    this.timeLeft = 60;
    this.examCurrentIndex = 0;
    this.examTotalTime = 0;
    this.examQuestions = [];
    this.examFailedQueue = [];

    // Official Exam Default Noise is HARD (Authentic KMS Game Accurate / مطابق للعبة تماماً)
    if (this.generator) {
      this.generator.setConfig({ noisePreset: 'hard' });
    }

    // Pre-generate authentic questions
    for (let i = 0; i < length; i++) {
      const target = customTargets && customTargets[i] 
        ? customTargets[i] 
        : Hangul.generateCaptchaText({ length: 6, category: this.category, includeJamo: true });

      this.examQuestions.push({
        index: i + 1,
        targetText: target,
        typedText: '',
        isCorrect: false,
        solveTime: 0,
        timedOut: false,
        mistakeAnalysis: null
      });
    }

    if (this.elements.timerContainer) this.elements.timerContainer.style.display = 'flex';
    if (this.elements.examProgressBanner) this.elements.examProgressBanner.style.display = 'flex';

    this.updateExamUI();
    this.newRound();
  }

  updateExamUI() {
    if (this.mode !== 'exam' || !this.elements.examProgressBanner) return;

    this.elements.examProgressBanner.style.display = 'flex';
    const current = this.examCurrentIndex + 1;
    const total = this.examLength;
    const correctCount = this.examQuestions.filter(q => q.isCorrect).length;

    if (this.elements.examProgressText) {
      this.elements.examProgressText.textContent = I18n.t('examProgress', { current: Math.min(current, total), total });
    }

    if (this.elements.examScoreText) {
      this.elements.examScoreText.textContent = I18n.t('examScoreSoFar', { correct: correctCount, total });
    }

    if (this.elements.examProgressBarFill) {
      const pct = (this.examCurrentIndex / total) * 100;
      this.elements.examProgressBarFill.style.width = `${pct}%`;
    }
  }

  handleKeystroke(char) {
    this.automaton.input(char);
    this.renderInput();
  }

  handleBackspace() {
    this.automaton.backspace();
    this.renderInput();
  }

  clearInput() {
    this.automaton.reset();
    this.renderInput();
  }

  renderInput() {
    const val = this.automaton.getValue();
    const target = this.generator.currentText;

    if (!this.elements.inputDisplay) return;

    if (val.length > this.prevTypedLen) {
      const idx = val.length - 1;
      if (val[idx] === target[idx]) {
        SoundFX.playMatchSyllable();
      }
    }
    this.prevTypedLen = val.length;

    let html = '';
    const maxLen = Math.max(target.length, val.length, 6);

    for (let i = 0; i < maxLen; i++) {
      const char = val[i] || '';
      const targetChar = target[i] || '';
      let statusClass = 'empty';

      if (char) {
        if (this.mode === 'practice') {
          statusClass = (char === targetChar) ? 'match-correct' : 'match-wrong';
        } else {
          statusClass = 'filled';
        }
      } else if (i === val.length) {
        statusClass = 'active-cursor';
      }

      html += `<div class="input-char-slot ${statusClass}">${char || '&nbsp;'}</div>`;
    }

    this.elements.inputDisplay.innerHTML = html;

    // Visual helper on submit button in Exam Mode to emphasize Enter confirmation
    const btnSubmit = document.getElementById('btn-submit-captcha');
    if (btnSubmit) {
      if (this.mode === 'exam' && val.length >= (target ? target.length : 6)) {
        btnSubmit.classList.add('pulse-ready');
        btnSubmit.innerHTML = 'تأكيد ↵ (Enter)';
      } else {
        btnSubmit.classList.remove('pulse-ready');
        btnSubmit.innerHTML = 'تأكيد ↵';
      }
    }
  }

  submitAnswer() {
    if (this.isSubmitting) return;
    this.automaton.commit();
    const typed = this.automaton.getValue().trim();
    const target = this.generator.currentText.trim();
    const solveTime = (Date.now() - this.startTime) / 1000;

    if (!typed) {
      if (this.mode === 'exam') {
        this.showFeedback('اكتب الحروف الأول وبعدين دوس Enter للتأكيد! ✍️😅', 'warning');
      } else {
        this.showFeedback(I18n.t('diagWrong', { typed: '...', target: '...' }), 'warning');
      }
      return;
    }

    this.isSubmitting = true;
    setTimeout(() => { this.isSubmitting = false; }, 450);

    const isCorrect = (typed === target);

    if (this.mode === 'exam') {
      this.handleExamStep(typed, target, isCorrect, solveTime, false);
      return;
    }

    if (isCorrect) {
      this.handleSuccess(solveTime);
    } else {
      this.handleFailure(typed, target);
    }
  }

  handleSuccess(solveTime) {
    SoundFX.playCorrect();
    this.currentStreak += 1;
    this.stats.totalSolved += 1;

    if (this.currentStreak > this.stats.bestStreak) {
      this.stats.bestStreak = this.currentStreak;
    }

    if (!this.stats.fastestTime || solveTime < this.stats.fastestTime) {
      this.stats.fastestTime = solveTime;
    }

    if (this.currentStreak === 5 || this.currentStreak === 10 || this.currentStreak === 20) {
      SoundFX.playFanfare();
    }

    this.saveStats();
    if (typeof PlayerAuth !== 'undefined') {
      PlayerAuth.recordPracticeSolve();
    }
    const msg = I18n.t('diagCorrect', { time: solveTime.toFixed(2), streak: this.currentStreak });
    this.showFeedback(msg, 'success');

    // Trigger Egyptian Coach praise on correct solve
    if (typeof EgyptianCoach !== 'undefined') {
      setTimeout(() => EgyptianCoach.showSuccessBanter(false), 250);
    }

    if (this.mode === 'speedrun') {
      this.speedrunCount += 1;
      this.speedrunTotalTime += solveTime;
      if (this.speedrunCount >= 10) {
        SoundFX.playFanfare();
        this.showFeedback(`🏆 Speedrun Complete! 10/10 in ${this.speedrunTotalTime.toFixed(1)}s!`, 'success');
        this.stopTimer();
        return;
      }
    }

    setTimeout(() => this.newRound(), 600);
  }

  handleFailure(typed, target) {
    SoundFX.playError();
    this.currentStreak = 0;
    this.stats.totalFailed += 1;
    this.saveStats();

    const smartTip = (typeof SmartTeacher !== 'undefined') ? SmartTeacher.diagnoseMistake(typed, target) : '';
    let msg = I18n.t('diagWrong', { typed, target });

    if (smartTip) {
      msg += `<div class="smart-tip-box">${smartTip}</div>`;
    }

    if (this.mode === 'test') {
      this.strikes += 1;
      this.updateStrikesUI();

      if (this.strikes >= this.maxStrikes) {
        this.triggerTruthRoom();
        return;
      }
    }

    this.showFeedback(msg, 'error');

    // Trigger Egyptian Coach witty warning on mistake
    if (typeof EgyptianCoach !== 'undefined') {
      setTimeout(() => EgyptianCoach.showErrorBanter(false), 300);
    }

    if (this.mode === 'practice') {
      this.showHint();
    }
  }

  handleExamStep(typed, target, isCorrect, solveTime, isTimeout) {
    this.examTotalTime += solveTime;

    const q = this.examQuestions[this.examCurrentIndex];
    if (q) {
      q.typedText = typed;
      q.isCorrect = isCorrect;
      q.solveTime = solveTime;
      q.timedOut = isTimeout;

      if (!isCorrect) {
        q.mistakeAnalysis = this.analyzeMistakeDetails(typed, target);
        this.examFailedQueue.push(target);
      }
    }

    if (isCorrect) {
      SoundFX.playCorrect();
      this.showFeedback(I18n.t('diagCorrect', { time: solveTime.toFixed(1), streak: this.examCurrentIndex + 1 }), 'success');
      // Trigger Egyptian Coach praise on exam success
      if (typeof EgyptianCoach !== 'undefined') {
        setTimeout(() => EgyptianCoach.showSuccessBanter(true), 250);
      }
    } else {
      SoundFX.playError();
      const smartTip = (typeof SmartTeacher !== 'undefined') ? SmartTeacher.diagnoseMistake(typed, target) : '';
      let msg = isTimeout 
        ? I18n.t('diagTimeout', { target }) 
        : I18n.t('diagWrong', { typed: typed || '—', target });
      if (smartTip) msg += `<div class="smart-tip-box">${smartTip}</div>`;
      this.showFeedback(msg, 'error');

      // Trigger Egyptian Coach warning on exam mistake
      if (typeof EgyptianCoach !== 'undefined') {
        setTimeout(() => EgyptianCoach.showErrorBanter(true), 300);
      }
    }

    this.examCurrentIndex += 1;

    setTimeout(() => {
      if (this.examCurrentIndex >= this.examLength) {
        this.finishExam();
      } else {
        this.newRound();
      }
    }, 550);
  }

  /**
   * Detailed breakdown of what went wrong for exam error review
   */
  analyzeMistakeDetails(typed, target) {
    const details = [];
    const maxLen = Math.max(typed.length, target.length);

    for (let i = 0; i < maxLen; i++) {
      const t = typed[i] || '';
      const exp = target[i] || '';

      if (t !== exp) {
        const expDec = Hangul.decompose(exp);
        const tDec = t ? Hangul.decompose(t) : null;

        let reason = '';
        if (!t) {
          reason = 'Character omitted (Missing)';
        } else if (expDec && tDec) {
          if (expDec.medial !== tDec.medial) {
            if ((expDec.medial === 'ㅓ' && tDec.medial === 'ㅏ') || (expDec.medial === 'ㅏ' && tDec.medial === 'ㅓ')) {
              reason = 'Confused vowel ㅓ vs ㅏ (Notch direction: ㅏ points right, ㅓ points left)';
            } else if ((expDec.medial === 'ㅗ' && tDec.medial === 'ㅜ') || (expDec.medial === 'ㅜ' && tDec.medial === 'ㅗ')) {
              reason = 'Confused vowel ㅗ vs ㅜ (Stem direction: ㅗ stands up, ㅜ hangs down)';
            } else {
              reason = `Wrong vowel: typed '${tDec.medial}' instead of '${expDec.medial}'`;
            }
          } else if (expDec.initial !== tDec.initial) {
            reason = `Wrong initial consonant: typed '${tDec.initial}' instead of '${expDec.initial}'`;
          } else if (expDec.final !== tDec.final) {
            reason = expDec.final 
              ? `Missing or wrong batchim: expected '${expDec.final}'` 
              : `Added unnecessary batchim: '${tDec.final}'`;
          }
        }

        details.push({
          pos: i + 1,
          expectedChar: exp,
          typedChar: t || '∅',
          expectedKeys: expDec ? expDec.keysDisplay : '',
          reason
        });
      }
    }

    return details;
  }

  finishExam() {
    this.stopTimer();
    const correctCount = this.examQuestions.filter(q => q.isCorrect).length;
    const total = this.examLength;
    const scorePct = Math.round((correctCount / total) * 100);
    const avgTime = (this.examTotalTime / total).toFixed(1);

    if (scorePct >= 85) SoundFX.playFanfare();
    else if (scorePct >= 70) SoundFX.playCorrect();
    else SoundFX.playError();

    // Record score to Live Leaderboard
    const profile = (typeof PlayerAuth !== 'undefined') ? PlayerAuth.getProfile() : null;
    const playerName = profile ? profile.name : 'Anonymous Player';
    const playerAvatar = profile ? profile.avatar : '⚔️';

    if (typeof MapleLeaderboard !== 'undefined') {
      MapleLeaderboard.addEntry({
        name: playerName,
        avatar: playerAvatar,
        score: correctCount,
        total: total,
        avgTime: avgTime
      });
    }

    this.renderExamResultsModal(correctCount, total, scorePct, avgTime);
  }

  renderExamResultsModal(correct, total, pct, avgTime) {
    if (!this.elements.examResultsModal) return;

    let gradeKey = 'examGradeF';
    let gradeBadgeClass = 'badge-grade-f';

    if (pct === 100) {
      gradeKey = 'examGradeS';
      gradeBadgeClass = 'badge-grade-s';
    } else if (pct >= 85) {
      gradeKey = 'examGradeA';
      gradeBadgeClass = 'badge-grade-a';
    } else if (pct >= 70) {
      gradeKey = 'examGradeB';
      gradeBadgeClass = 'badge-grade-b';
    } else if (pct >= 50) {
      gradeKey = 'examGradeC';
      gradeBadgeClass = 'badge-grade-c';
    }

    const failedQuestions = this.examQuestions.filter(q => !q.isCorrect);

    let mistakesHtml = '';
    if (failedQuestions.length === 0) {
      mistakesHtml = `
        <div class="exam-flawless-box">
          <div class="flawless-icon">🏆</div>
          <p>${I18n.t('examAllCorrectMsg')}</p>
        </div>
      `;
    } else {
      mistakesHtml = `
        <div class="exam-mistakes-list">
          ${failedQuestions.map(q => `
            <div class="exam-mistake-card">
              <div class="mistake-card-head">
                <span class="mistake-q-num">${I18n.t('examQuestionNum', { num: q.index })}</span>
                ${q.timedOut ? `<span class="badge-timeout">${I18n.t('examTimedOutBadge')}</span>` : ''}
                <button type="button" class="btn-listen-exam-word" data-word="${q.targetText}">🔊 ${I18n.t('btnPronounce')}</button>
              </div>
              <div class="mistake-comparison-row">
                <div class="mistake-col">
                  <span class="col-label">${I18n.t('examExpected')}</span>
                  <span class="col-target">${q.targetText}</span>
                </div>
                <div class="mistake-col">
                  <span class="col-label">${I18n.t('examYouTyped')}</span>
                  <span class="col-typed ${q.typedText ? 'wrong-text' : 'empty-text'}">${q.typedText || '—'}</span>
                </div>
              </div>
              ${q.mistakeAnalysis && q.mistakeAnalysis.length > 0 ? `
                <div class="mistake-diff-breakdown">
                  <strong>${I18n.t('examReason')}</strong>
                  <ul>
                    ${q.mistakeAnalysis.map(d => `
                      <li>
                        Character #${d.pos} (<strong>${d.expectedChar}</strong>): ${d.reason} 
                        — <span class="diff-keys">${I18n.t('examKeyTip')} <kbd>${d.expectedKeys}</kbd></span>
                      </li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }

    this.elements.examResultsModal.innerHTML = `
      <div class="exam-results-card">
        <div class="exam-results-header">
          <span class="exam-grade-badge ${gradeBadgeClass}">${I18n.t(gradeKey)}</span>
          <h2>${I18n.t('examResultsTitle')}</h2>
        </div>
        <div class="exam-metrics-row">
          <div class="metric-box">
            <span class="metric-label">${I18n.t('examSummaryTotal')}</span>
            <span class="metric-val highlight-score">${correct} / ${total} (${pct}%)</span>
          </div>
          <div class="metric-box">
            <span class="metric-label">${I18n.t('examSummaryAvgTime')}</span>
            <span class="metric-val">${avgTime}s</span>
          </div>
          <div class="metric-box">
            <span class="metric-label">${I18n.t('examSummaryTotalTime')}</span>
            <span class="metric-val">${this.examTotalTime.toFixed(1)}s</span>
          </div>
        </div>

        <div class="exam-review-section">
          <h3>${I18n.t('examWhatYouDidWrongTitle')}</h3>
          ${mistakesHtml}
        </div>

        <div class="exam-actions-row">
          <button id="btn-retake-exam" class="btn btn-primary btn-lg">${I18n.t('examRetakeBtn')}</button>
          ${failedQuestions.length > 0 ? `
            <button id="btn-retry-mistakes" class="btn btn-secondary btn-lg">${I18n.t('examRetryErrorsBtn', { count: failedQuestions.length })}</button>
          ` : ''}
          <button id="btn-close-exam-modal" class="btn btn-outline btn-lg">Close ✕</button>
        </div>
      </div>
    `;

    this.elements.examResultsModal.classList.add('active');

    // Bind results modal buttons
    const retakeBtn = document.getElementById('btn-retake-exam');
    if (retakeBtn) retakeBtn.addEventListener('click', () => {
      this.elements.examResultsModal.classList.remove('active');
      this.startExam(this.examLength);
    });

    const retryMistakesBtn = document.getElementById('btn-retry-mistakes');
    if (retryMistakesBtn) retryMistakesBtn.addEventListener('click', () => {
      this.elements.examResultsModal.classList.remove('active');
      this.startExam(this.examFailedQueue.length, [...this.examFailedQueue]);
    });

    const closeBtn = document.getElementById('btn-close-exam-modal');
    if (closeBtn) closeBtn.addEventListener('click', () => {
      this.elements.examResultsModal.classList.remove('active');
      this.setMode('practice');
    });

    this.elements.examResultsModal.querySelectorAll('.btn-listen-exam-word').forEach(btn => {
      btn.addEventListener('click', () => {
        const word = btn.dataset.word;
        if (word && typeof SmartTeacher !== 'undefined') {
          SmartTeacher.speakHangul(word);
        }
      });
    });
  }

  startTimer(duration) {
    this.stopTimer();
    this.timerDuration = duration;
    this.timeLeft = duration;

    if (this.elements.timerContainer) {
      this.elements.timerContainer.style.display = 'flex';
    }

    this.updateTimerUI();

    this.timerInterval = setInterval(() => {
      this.timeLeft -= 0.1;

      if (this.timeLeft <= 5.0 && Math.floor(this.timeLeft * 10) % 10 === 0) {
        SoundFX.playTick();
      }

      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.stopTimer();
        this.handleTimeout();
      }

      this.updateTimerUI();
    }, 100);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  handleTimeout() {
    SoundFX.playError();
    const target = this.generator.currentText;

    if (this.mode === 'exam') {
      this.handleExamStep('', target, false, this.timerDuration, true);
      return;
    }

    this.currentStreak = 0;
    this.stats.totalFailed += 1;
    this.saveStats();

    if (this.mode === 'test') {
      this.strikes += 1;
      this.updateStrikesUI();

      if (this.strikes >= this.maxStrikes) {
        this.triggerTruthRoom();
        return;
      }
    }

    this.showFeedback(I18n.t('diagTimeout', { target }), 'error');
    setTimeout(() => this.newRound(), 1500);
  }

  updateTimerUI() {
    if (!this.elements.timerBar || !this.elements.timerText) return;
    const pct = Math.max(0, Math.min(100, (this.timeLeft / this.timerDuration) * 100));
    this.elements.timerBar.style.width = `${pct}%`;
    this.elements.timerText.textContent = `${this.timeLeft.toFixed(1)}s`;

    if (this.timeLeft <= 5) {
      this.elements.timerBar.classList.add('urgent');
    } else {
      this.elements.timerBar.classList.remove('urgent');
    }
  }

  updateStrikesUI() {
    if (!this.elements.strikesContainer) return;
    let html = '';
    for (let i = 0; i < this.maxStrikes; i++) {
      const isStruck = i < this.strikes;
      html += `<span class="strike-marker ${isStruck ? 'struck' : ''}">✕</span>`;
    }
    this.elements.strikesContainer.innerHTML = html;
  }

  updateStatsUI() {
    if (this.elements.streakDisplay) {
      this.elements.streakDisplay.textContent = this.currentStreak;
    }
    const bestEl = document.getElementById('stat-best-streak');
    if (bestEl) bestEl.textContent = this.stats.bestStreak;

    const solvedEl = document.getElementById('stat-solved');
    if (solvedEl) solvedEl.textContent = this.stats.totalSolved;

    const rateEl = document.getElementById('stat-rate');
    if (rateEl) {
      const total = this.stats.totalSolved + this.stats.totalFailed;
      const rate = total > 0 ? ((this.stats.totalSolved / total) * 100).toFixed(1) : '100';
      rateEl.textContent = `${rate}%`;
    }
  }

  triggerTruthRoom() {
    this.stopTimer();
    SoundFX.playError();
    if (this.elements.truthRoomModal) {
      this.elements.truthRoomModal.classList.add('active');
    }
  }

  closeTruthRoom() {
    if (this.elements.truthRoomModal) {
      this.elements.truthRoomModal.classList.remove('active');
    }
    this.strikes = 0;
    this.updateStrikesUI();
    this.newRound();
  }

  showFeedback(msg, type = 'info') {
    if (!this.elements.feedbackBox) return;
    this.elements.feedbackBox.className = `feedback-banner feedback-${type}`;
    this.elements.feedbackBox.innerHTML = msg;
    this.elements.feedbackBox.style.display = 'block';
  }

  hideFeedback() {
    if (this.elements.feedbackBox) {
      this.elements.feedbackBox.style.display = 'none';
    }
  }

  renderDeconstructionPreview(data) {
    if (!this.elements.deconstructedPreview) return;
    const chars = data.text.split('');

    let html = '';
    chars.forEach((c, idx) => {
      const dec = Hangul.decompose(c);
      if (!dec) return;

      html += `
        <div class="hint-char-card" data-idx="${idx}">
          <div class="hint-char-top-row">
            <span class="hint-char-head">${dec.char}</span>
            <button type="button" class="btn-audio-speak" data-char="${dec.char}" title="Listen to Korean pronunciation">🔊</button>
          </div>
          <div class="hint-keys-row">
            ${dec.keystrokes.map(k => `<kbd>${k}</kbd>`).join(' ')}
          </div>
          <div class="hint-jamo-row">
            <span class="jamo-initial">${dec.initial}</span>
            <span class="jamo-medial">${dec.medial}</span>
            ${dec.final ? `<span class="jamo-final">${dec.final}</span>` : ''}
          </div>
        </div>
      `;
    });

    this.elements.deconstructedPreview.innerHTML = html;

    this.elements.deconstructedPreview.querySelectorAll('.btn-audio-speak').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ch = btn.dataset.char;
        if (ch && typeof SmartTeacher !== 'undefined') {
          SmartTeacher.speakHangul(ch);
        }
      });
    });
  }

  toggleHint() {
    if (!this.elements.hintDrawer) return;
    const isShowing = this.elements.hintDrawer.classList.contains('active');
    if (isShowing) this.hideHint();
    else this.showHint();
  }

  showHint() {
    if (this.elements.hintDrawer) {
      this.elements.hintDrawer.classList.add('active');
    }
  }

  hideHint() {
    if (this.elements.hintDrawer) {
      this.elements.hintDrawer.classList.remove('active');
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapleCaptchaGame;
}
