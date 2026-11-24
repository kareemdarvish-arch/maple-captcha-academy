/**
 * Player Authentication & Profile System
 * Enforces Google Sign-In first, then choosing Display Name (IGN) and avatar.
 * Tracks practice counts and learning achievements (Hangul Academy, Lookalike Traps, Speed Drills).
 */

const PlayerAuth = (() => {
  const STORAGE_KEY = 'maple_captcha_player_profile';

  let currentProfile = loadProfile();

  function loadProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.email && parsed.name) {
          // Ensure metrics fields exist
          parsed.practiceCount = parsed.practiceCount || 0;
          parsed.hangulRead = !!parsed.hangulRead;
          parsed.lookalikesRead = !!parsed.lookalikesRead;
          parsed.drillCompleted = !!parsed.drillCompleted;
          return parsed;
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  function saveProfile(profile) {
    currentProfile = profile;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('playerAuthChanged', { detail: profile }));
  }

  function getProfile() {
    return currentProfile;
  }

  function isSignedIn() {
    return !!currentProfile && !!currentProfile.email && !!currentProfile.name;
  }

  /**
   * Complete 2-Step Sign In:
   * Requires verified Google email + In-game display name (IGN) + Avatar
   */
  function registerPlayer(googleEmail, inGameName, avatar = '🍁') {
    const email = (googleEmail || '').trim().toLowerCase();
    const ign = (inGameName || '').trim();

    if (!email || !email.includes('@')) {
      throw new Error('Invalid Google Email');
    }
    if (!ign) {
      throw new Error('In-Game Name (IGN) is required');
    }

    const existing = currentProfile && currentProfile.email === email ? currentProfile : null;

    const profile = {
      id: 'usr_' + Date.now().toString(36),
      email: email,
      name: ign,
      avatar: avatar || '🍁',
      provider: 'google',
      practiceCount: existing ? (existing.practiceCount || 0) : 0,
      hangulRead: existing ? !!existing.hangulRead : false,
      lookalikesRead: existing ? !!existing.lookalikesRead : false,
      drillCompleted: existing ? !!existing.drillCompleted : false,
      joinedAt: existing ? existing.joinedAt : Date.now(),
      bestScore: existing ? existing.bestScore : 0,
      totalExams: existing ? existing.totalExams : 0
    };

    saveProfile(profile);
    return profile;
  }

  function recordPracticeSolve() {
    if (!currentProfile) return;
    currentProfile.practiceCount = (currentProfile.practiceCount || 0) + 1;
    saveProfile(currentProfile);
  }

  function markHangulRead() {
    if (!currentProfile) return;
    if (!currentProfile.hangulRead) {
      currentProfile.hangulRead = true;
      saveProfile(currentProfile);
    }
  }

  function markLookalikesRead() {
    if (!currentProfile) return;
    if (!currentProfile.lookalikesRead) {
      currentProfile.lookalikesRead = true;
      saveProfile(currentProfile);
    }
  }

  function markDrillCompleted() {
    if (!currentProfile) return;
    if (!currentProfile.drillCompleted) {
      currentProfile.drillCompleted = true;
      saveProfile(currentProfile);
    }
  }

  function signOut() {
    currentProfile = null;
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('playerAuthChanged', { detail: null }));
  }

  return {
    getProfile,
    isSignedIn,
    registerPlayer,
    recordPracticeSolve,
    markHangulRead,
    markLookalikesRead,
    markDrillCompleted,
    signOut
  };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlayerAuth;
}
