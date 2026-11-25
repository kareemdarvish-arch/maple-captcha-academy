/**
 * Live Leaderboard & Official Exam Scoreboard System
 * Persists exam scores, rankings, medals, speed records, and learning badges:
 * (Practice count, Hangul Academy reading, Lookalike Traps mastery, Reaction Drill completion).
 * Renders seamlessly inside both the Standalone Official Exam Board and the Leaderboard tab.
 */

const MapleLeaderboard = (() => {
  const STORAGE_KEY = 'maple_captcha_leaderboard_data';
  // Optional remote cloud endpoint (e.g. Supabase / Cloudflare Worker) for cross-device global sync
  const CLOUD_ENDPOINT = '';

  // Only Kareem with 100% on all exam tiers and complete mastery across all training modes
  const DEFAULT_LEADERBOARD = [
    { 
      id: 'lb_kareem_20', 
      name: 'Kareem (كريم)', 
      avatar: '👑', 
      score: 20, 
      total: 20, 
      pct: 100, 
      avgTime: 4.5, 
      examType: 20, 
      practiceCount: 520, 
      hangulRead: true, 
      lookalikesRead: true, 
      drillCompleted: true, 
      date: '2026-11-24' 
    },
    { 
      id: 'lb_kareem_15', 
      name: 'Kareem (كريم)', 
      avatar: '👑', 
      score: 15, 
      total: 15, 
      pct: 100, 
      avgTime: 4.2, 
      examType: 15, 
      practiceCount: 520, 
      hangulRead: true, 
      lookalikesRead: true, 
      drillCompleted: true, 
      date: '2026-11-24' 
    },
    { 
      id: 'lb_kareem_10', 
      name: 'Kareem (كريم)', 
      avatar: '👑', 
      score: 10, 
      total: 10, 
      pct: 100, 
      avgTime: 4.0, 
      examType: 10, 
      practiceCount: 520, 
      hangulRead: true, 
      lookalikesRead: true, 
      drillCompleted: true, 
      date: '2026-11-24' 
    }
  ];

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sortEntries(list) {
    return list.sort((a, b) => {
      if (b.pct !== a.pct) return b.pct - a.pct;
      if (b.total !== a.total) return b.total - a.total;
      return parseFloat(a.avgTime) - parseFloat(b.avgTime);
    });
  }

  function loadData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (parsed.some(e => e.name === 'KMS_Pro_Gamer' || e.name === 'MapleHero_EG' || e.practiceCount === undefined)) {
            saveData(DEFAULT_LEADERBOARD);
            return [...DEFAULT_LEADERBOARD];
          }
          return sortEntries(parsed);
        }
      }
    } catch (e) {}
    saveData(DEFAULT_LEADERBOARD);
    return [...DEFAULT_LEADERBOARD];
  }

  function saveData(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  async function syncFromCloud() {
    if (!CLOUD_ENDPOINT) return loadData();
    try {
      const res = await fetch(CLOUD_ENDPOINT, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const remote = await res.json();
        if (Array.isArray(remote) && remote.length > 0) {
          const local = loadData();
          const byId = new Map();
          [...DEFAULT_LEADERBOARD, ...local, ...remote].forEach(item => {
            if (item && item.id) byId.set(item.id, item);
          });
          const merged = sortEntries(Array.from(byId.values()));
          saveData(merged);
          window.dispatchEvent(new CustomEvent('leaderboardUpdated', { detail: { list: merged, latestEntry: null } }));
          return merged;
        }
      }
    } catch (err) {}
    return loadData();
  }

  async function pushToCloud(newEntry) {
    if (!CLOUD_ENDPOINT) return;
    try {
      await fetch(CLOUD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
    } catch (err) {}
  }

  function addEntry(entry) {
    const list = loadData();
    const profile = (typeof PlayerAuth !== 'undefined') ? PlayerAuth.getProfile() : null;

    const newEntry = {
      id: 'entry_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
      name: entry.name || (profile ? profile.name : 'لاعب زائر (بدون تسجيل)'),
      avatar: entry.avatar || (profile ? profile.avatar : '⚔️'),
      score: entry.score,
      total: entry.total,
      pct: entry.total > 0 ? Math.round((entry.score / entry.total) * 100) : 0,
      avgTime: parseFloat(entry.avgTime) || 4.0,
      examType: entry.total,
      practiceCount: (profile && profile.practiceCount) ? profile.practiceCount : (entry.practiceCount || 0),
      hangulRead: profile ? !!profile.hangulRead : (entry.hangulRead || false),
      lookalikesRead: profile ? !!profile.lookalikesRead : (entry.lookalikesRead || false),
      drillCompleted: profile ? !!profile.drillCompleted : (entry.drillCompleted || false),
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now()
    };

    list.push(newEntry);
    sortEntries(list);

    saveData(list);
    pushToCloud(newEntry);
    window.dispatchEvent(new CustomEvent('leaderboardUpdated', { detail: { list, latestEntry: newEntry } }));
    return newEntry;
  }

  function updateEntryName(entryId, newName, newAvatar) {
    if (!entryId || !newName) return null;
    const list = loadData();
    const target = list.find(e => e.id === entryId);
    if (!target) return null;
    target.name = newName;
    if (newAvatar) target.avatar = newAvatar;
    saveData(list);
    window.dispatchEvent(new CustomEvent('leaderboardUpdated', { detail: { list, latestEntry: target } }));
    return target;
  }

  function getEntries(filter = 'all') {
    const list = loadData();
    if (filter === '20') return list.filter(x => x.total === 20);
    if (filter === '15') return list.filter(x => x.total === 15);
    if (filter === '10') return list.filter(x => x.total === 10);
    return list;
  }

  function getRankOf(entryId, filter = 'all') {
    const entries = getEntries(filter);
    const idx = entries.findIndex(e => e.id === entryId);
    return idx >= 0 ? idx + 1 : null;
  }

  function renderLeaderboardTable(containerId, filter = 'all', highlightEntryId = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const entries = getEntries(filter);
    const isAr = (typeof I18n === 'undefined' || I18n.getLang() === 'ar');
    const profile = (typeof PlayerAuth !== 'undefined') ? PlayerAuth.getProfile() : null;
    const currentPlayerName = profile ? profile.name : '';

    let rowsHtml = '';
    entries.forEach((e, idx) => {
      let rankBadge = `${idx + 1}`;
      let rowClass = '';
      if (idx === 0) { rankBadge = '🥇'; rowClass = 'rank-gold'; }
      else if (idx === 1) { rankBadge = '🥈'; rowClass = 'rank-silver'; }
      else if (idx === 2) { rankBadge = '🥉'; rowClass = 'rank-bronze'; }

      const isCurrentUserRow = (highlightEntryId && e.id === highlightEntryId) ||
        (currentPlayerName && e.name === currentPlayerName);
      if (isCurrentUserRow) {
        rowClass += ' row-current-player';
      }

      // Learning Path Badges
      const hangulBadge = e.hangulRead
        ? `<span class="achievement-pill pill-done" title="${isAr ? 'قرأ أساسيات الهانغل' : 'Read Hangul Basics'}">📚 ${isAr ? 'الهانغل' : 'Hangul'} ✓</span>`
        : `<span class="achievement-pill pill-miss" title="${isAr ? 'لم يقرأ أكاديمية الهانغل' : 'Did not read Hangul Basics'}">📚 ✗</span>`;

      const trapBadge = e.lookalikesRead
        ? `<span class="achievement-pill pill-done" title="${isAr ? 'أتقن فخاخ الحروف المتشابهة' : 'Mastered Lookalike Traps'}">👁️ ${isAr ? 'الفخاخ' : 'Traps'} ✓</span>`
        : `<span class="achievement-pill pill-miss" title="${isAr ? 'لم يقرأ فخاخ الحروف' : 'Did not read Traps'}">👁️ ✗</span>`;

      const drillBadge = e.drillCompleted
        ? `<span class="achievement-pill pill-done" title="${isAr ? 'أتم تدريب السرعة للحروف' : 'Completed Reaction Drills'}">⚡ ${isAr ? 'السرعة' : 'Speed'} ✓</span>`
        : `<span class="achievement-pill pill-miss" title="${isAr ? 'لم يكمل تدريب السرعة' : 'No Reaction Drills'}">⚡ ✗</span>`;

      const youPill = isCurrentUserRow
        ? `<span class="you-badge">${isAr ? 'أنت' : 'You'}</span>`
        : '';

      rowsHtml += `
        <tr class="lb-row ${rowClass}">
          <td class="lb-rank">${rankBadge}</td>
          <td class="lb-player">
            <span class="lb-avatar">${escapeHtml(e.avatar || '⚔️')}</span>
            <span class="lb-name">${escapeHtml(e.name)}</span>
            ${youPill}
          </td>
          <td class="lb-score">
            <strong class="score-pct">${e.pct}%</strong>
            <span class="score-fraction">(${e.score}/${e.total})</span>
          </td>
          <td class="lb-practice">
            <span class="practice-chip">🎯 ${e.practiceCount || 0} ${isAr ? 'تدريب' : 'solves'}</span>
          </td>
          <td class="lb-achievements">
            <div class="achievements-cluster">
              ${hangulBadge}
              ${trapBadge}
              ${drillBadge}
            </div>
          </td>
          <td class="lb-speed">${e.avgTime}s</td>
          <td class="lb-type">${e.total} ${isAr ? 'كابتشا' : 'Captchas'}</td>
          <td class="lb-date">${escapeHtml(e.date)}</td>
        </tr>
      `;
    });

    container.innerHTML = `
      <div class="lb-table-wrapper">
        <table class="lb-table">
          <thead>
            <tr>
              <th>${isAr ? 'الترتيب' : 'Rank'}</th>
              <th>${isAr ? 'اللاعب' : 'Player'}</th>
              <th>${isAr ? 'النتيجة والدقة' : 'Score'}</th>
              <th>${isAr ? 'مرات التدريب' : 'Practices'}</th>
              <th>${isAr ? 'إنجازات التعلم' : 'Learning Path'}</th>
              <th>${isAr ? 'متوسط السرعة' : 'Avg Speed'}</th>
              <th>${isAr ? 'نوع الاختبار' : 'Exam'}</th>
              <th>${isAr ? 'التاريخ' : 'Date'}</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="8" style="text-align:center; padding: 2rem;">${isAr ? 'لا توجد نتائج مسجلة بعد' : 'No records yet'}</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  }

  return {
    addEntry,
    updateEntryName,
    getEntries,
    getRankOf,
    syncFromCloud,
    renderLeaderboardTable,
    isCloudEnabled: () => Boolean(CLOUD_ENDPOINT)
  };
})();

if (typeof window !== 'undefined') {
  window.MapleLeaderboard = MapleLeaderboard;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapleLeaderboard;
}
