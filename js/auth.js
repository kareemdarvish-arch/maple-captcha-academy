/**
 * Player Authentication & Profile System
 * Allows players to choose an in-game name (IGN), sign in with Google or custom avatar,
 * and track their personal exam history.
 */

const PlayerAuth = (() => {
  const STORAGE_KEY = 'maple_captcha_player_profile';

  let currentProfile = loadProfile();

  function loadProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
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
    return !!currentProfile && !!currentProfile.name;
  }

  function signInCustom(name, avatar = '⚔️') {
    const trimmed = (name || '').trim();
    if (!trimmed) return null;

    const profile = {
      id: 'usr_' + Date.now().toString(36),
      name: trimmed,
      avatar: avatar || '⚔️',
      provider: 'custom',
      joinedAt: Date.now(),
      bestScore: 0,
      totalExams: 0
    };

    saveProfile(profile);
    return profile;
  }

  function signInGoogle(customEmail = null, customName = null) {
    const email = customEmail || 'maple.player@gmail.com';
    const name = customName || email.split('@')[0];

    const profile = {
      id: 'g_' + Date.now().toString(36),
      name: name,
      email: email,
      avatar: '🍁',
      provider: 'google',
      joinedAt: Date.now(),
      bestScore: 0,
      totalExams: 0
    };

    saveProfile(profile);
    return profile;
  }

  function signOut() {
    currentProfile = null;
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('playerAuthChanged', { detail: null }));
  }

  return {
    getProfile,
    isSignedIn,
    signInCustom,
    signInGoogle,
    signOut
  };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlayerAuth;
}
