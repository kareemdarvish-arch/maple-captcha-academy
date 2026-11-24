/**
 * Game Modes, Timers, Scoring, Smart Diagnostics, and Truth Room Simulation
 */

class MapleCaptchaGame {
  constructor(generator, keyboard, options = {}) {
    this.generator = generator;
    this.keyboard = keyboard;
    this.options = options;

    this.mode = 'practice';
    this.category = 'balanced';
    this.timerDuration = 30;
    this.timeLeft = 30;
    this.timerInterval = null;

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

    // Listen for language changes to update feedback text
    window.addEventListener('languageChanged', () => {
      this.updateStatsUI();
      if (this.currentRoundData) {
        this.renderDeconstructionPreview(this.currentRoundData);
      }
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
      deconstructedPreview: document.getElementById('current-captcha-breakdown')
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

    document.addEventListener('click', (e) => {
      if (this.elements.textInput && !e.target.closest('button, input, select, textarea, a, .kb-drag-handle')) {
        this.elements.textInput.focus();
      }
    });
  }

  newRound(category = null) {
    if (category) this.category = category;

    this.automaton.reset();
    this.prevTypedLen = 0;
    this.renderInput();
    this.hideFeedback();
    this.hideHint();

    const data = this.generator.generate(null, this.category);
    this.currentRoundData = data;
    this.startTime = Date.now();

    this.renderDeconstructionPreview(data);

    if (this.mode === 'test') {
      this.startTimer(this.timerDuration);
    } else if (this.mode === 'speedrun') {
      this.startTimer(45);
    } else {
      this.stopTimer();
      if (this.elements.timerContainer) {
        this.elements.timerContainer.style.display = 'none';
      }
    }

    if (this.elements.textInput) {
      this.elements.textInput.value = '';
      this.elements.textInput.focus();
    }
  }

  setMode(mode) {
    this.mode = mode;
    this.strikes = 0;
    this.updateStrikesUI();

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
    this.newRound();
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

    // Check if new character matched
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
  }

  submitAnswer() {
    this.automaton.commit();
    const typed = this.automaton.getValue().trim();
    const target = this.generator.currentText.trim();
    const solveTime = (Date.now() - this.startTime) / 1000;

    if (!typed) {
      this.showFeedback(I18n.t('diagWrong', { typed: '...', target: '...' }), 'warning');
      return;
    }

    const isCorrect = (typed === target);

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

    // Milestone fanfare for 5, 10, 20 streaks
    if (this.currentStreak === 5 || this.currentStreak === 10 || this.currentStreak === 20) {
      SoundFX.playFanfare();
    }

    this.saveStats();
    const msg = I18n.t('diagCorrect', { time: solveTime.toFixed(2), streak: this.currentStreak });
    this.showFeedback(msg, 'success');

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

    // Run Smart Teacher Diagnostic on the mistake
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

    if (this.mode === 'practice') {
      this.showHint();
    }
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

    this.showFeedback(I18n.t('diagTimeout', { target: this.generator.currentText }), 'error');
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

    // Connect speech buttons
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
