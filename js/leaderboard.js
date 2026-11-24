/**
 * Live Leaderboard & Hall of Fame System
 * Persists top exam scores, rankings, medals, and speed records.
 */

const MapleLeaderboard = (() => {
  const STORAGE_KEY = 'maple_captcha_leaderboard_data';

  // Only Kareem with 100% on all exam tiers with a realistic, beatable normal human speed (4.0s - 4.5s)
  const DEFAULT_LEADERBOARD = [
    { id: 'lb_kareem_20', name: 'Kareem (كريم)', avatar: '🍁', score: 20, total: 20, pct: 100, avgTime: 4.5, examType: 20, date: '2026-11-24' },
    { id: 'lb_kareem_15', name: 'Kareem (كريم)', avatar: '🍁', score: 15, total: 15, pct: 100, avgTime: 4.2, examType: 15, date: '2026-11-24' },
    { id: 'lb_kareem_10', name: 'Kareem (كريم)', avatar: '🍁', score: 10, total: 10, pct: 100, avgTime: 4.0, examType: 10, date: '2026-11-24' }
  ];

  function loadData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If legacy seed data is detected, clean up and reset to Kareem only
        if (Array.isArray(parsed) && parsed.some(e => e.name === 'KMS_Pro_Gamer' || e.name === 'MapleHero_EG')) {
          saveData(DEFAULT_LEADERBOARD);
          return DEFAULT_LEADERBOARD;
        }
        return parsed;
      }
    } catch (e) {}
    saveData(DEFAULT_LEADERBOARD);
    return DEFAULT_LEADERBOARD;
  }

  function saveData(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function addEntry(entry) {
    const list = loadData();
    const newEntry = {
      id: 'entry_' + Date.now().toString(36),
      name: entry.name || 'Anonymous Maple Player',
      avatar: entry.avatar || '⚔️',
      score: entry.score,
      total: entry.total,
      pct: Math.round((entry.score / entry.total) * 100),
      avgTime: parseFloat(entry.avgTime) || 4.0,
      examType: entry.total,
      date: new Date().toISOString().split('T')[0]
    };

    list.push(newEntry);

    // Sort by: percentage descending, then total questions descending, then avgTime ascending
    list.sort((a, b) => {
      if (b.pct !== a.pct) return b.pct - a.pct;
      if (b.total !== a.total) return b.total - a.total;
      return a.avgTime - b.avgTime;
    });

    saveData(list);
    window.dispatchEvent(new CustomEvent('leaderboardUpdated', { detail: list }));
    return newEntry;
  }

  function getEntries(filter = 'all') {
    const list = loadData();
    if (filter === '20') return list.filter(x => x.total === 20);
    if (filter === '15') return list.filter(x => x.total === 15);
    if (filter === '10') return list.filter(x => x.total === 10);
    return list;
  }

  function renderLeaderboardTable(containerId, filter = 'all') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const entries = getEntries(filter);
    const isAr = (typeof I18n !== 'undefined' && I18n.getLang() === 'ar');

    let rowsHtml = '';
    entries.forEach((e, idx) => {
      let rankBadge = `${idx + 1}`;
      let rowClass = '';
      if (idx === 0) { rankBadge = '🥇'; rowClass = 'rank-gold'; }
      else if (idx === 1) { rankBadge = '🥈'; rowClass = 'rank-silver'; }
      else if (idx === 2) { rankBadge = '🥉'; rowClass = 'rank-bronze'; }

      rowsHtml += `
        <tr class="lb-row ${rowClass}">
          <td class="lb-rank">${rankBadge}</td>
          <td class="lb-player">
            <span class="lb-avatar">${e.avatar || '⚔️'}</span>
            <span class="lb-name">${e.name}</span>
          </td>
          <td class="lb-score">
            <strong class="score-pct">${e.pct}%</strong>
            <span class="score-fraction">(${e.score}/${e.total})</span>
          </td>
          <td class="lb-speed">${e.avgTime}s</td>
          <td class="lb-type">${e.total} ${isAr ? 'كابتشا' : 'Captchas'}</td>
          <td class="lb-date">${e.date}</td>
        </tr>
      `;
    });

    container.innerHTML = `
      <div class="lb-table-wrapper">
        <table class="lb-table">
          <thead>
            <tr>
              <th>${isAr ? 'الترتيب' : 'Rank'}</th>
              <th>${isAr ? 'اسم اللاعب' : 'Player'}</th>
              <th>${isAr ? 'النتيجة والدقة' : 'Score'}</th>
              <th>${isAr ? 'متوسط السرعة' : 'Avg Speed'}</th>
              <th>${isAr ? 'نوع الاختبار' : 'Exam'}</th>
              <th>${isAr ? 'التاريخ' : 'Date'}</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="6" style="text-align:center; padding: 2rem;">${isAr ? 'لا توجد نتائج مسجلة بعد' : 'No records yet'}</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  }

  return {
    addEntry,
    getEntries,
    renderLeaderboardTable
  };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapleLeaderboard;
}
