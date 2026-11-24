/**
 * Egyptian Coach & Maple Banter Toast System
 * Displays hilarious Egyptian gaming coach messages on first visit and periodically/on events.
 */

const EgyptianCoach = (() => {
  const BANTER_MESSAGES = [
    { text: "ركز يا وحش بدل ما تجيب للأكونت حظر ونقعد نعيط جمبه! 🚨😂", icon: "👮‍♂️" },
    { text: "وربنا هخصملك من المرتب لو غلطت في الحرف ده تاني! 😂💸", icon: "🍄" },
    { text: "أصحى معايا وبلاش تسريح.. كاشف الكذب مابيهزرش وهيبعتك سجن غرفة الحقيقة! 👮‍♂️", icon: "🚨" },
    { text: "عينك على الحروف المتشابهة! ㅓ مش زي ㅏ و ㅗ مش زي ㅜ، ركز يابني!", icon: "🧐" },
    { text: "الجي ام (GM) واقف في ضهرك وعينه في شاشتك.. حاسب على نفسك! 🍁👀", icon: "🍁" },
    { text: "بلاش فتونة.. مفتاح الـ Shift هو اللي بيجيب الحروف المزدوجة، ركّز يا غالي! ⚔️", icon: "💡" },
    { text: "أوعى تكسفنا قدام كريم في لوحة المتصدرين.. عايزينك تكسر رقمه! 🏆🔥", icon: "👑" },
    { text: "صباعك على الـ Enter وقلبك حديد.. كاشف الكذب جاي في ثواني! ⚡", icon: "🎯" }
  ];

  let toastElem = null;
  let timerId = null;
  let lastIndex = -1;

  function init() {
    createToastElement();
    
    // Show first humorous coach message shortly after page load
    setTimeout(() => {
      showRandomBanter(0);
    }, 1400);

    // Periodically show a humorous reminder every 50 seconds
    setInterval(() => {
      showRandomBanter();
    }, 50000);
  }

  function createToastElement() {
    toastElem = document.createElement('div');
    toastElem.id = 'egyptian-coach-toast';
    toastElem.className = 'egyptian-coach-toast';
    toastElem.innerHTML = `
      <div class="coach-icon-bubble">🍄</div>
      <div class="coach-content">
        <div class="coach-badge">كوتش مابل المصري 🇪🇬</div>
        <div class="coach-message">ركز يا وحش بدل ما تجيب للأكونت حظر ونقعد نعيط جمبه! 🚨😂</div>
      </div>
      <button type="button" class="coach-close-btn" title="إغلاق">✕</button>
    `;
    document.body.appendChild(toastElem);

    const closeBtn = toastElem.querySelector('.coach-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', hideToast);
    }
  }

  function showRandomBanter(forceIndex = null) {
    if (!toastElem) return;
    
    let idx = forceIndex !== null ? forceIndex : Math.floor(Math.random() * BANTER_MESSAGES.length);
    if (forceIndex === null && idx === lastIndex) {
      idx = (idx + 1) % BANTER_MESSAGES.length;
    }
    lastIndex = idx;

    const item = BANTER_MESSAGES[idx];
    const msgElem = toastElem.querySelector('.coach-message');
    const iconElem = toastElem.querySelector('.coach-icon-bubble');

    if (msgElem) msgElem.textContent = item.text;
    if (iconElem) iconElem.textContent = item.icon;

    toastElem.classList.remove('hiding');
    toastElem.classList.add('active');

    // Auto hide after 8 seconds
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      hideToast();
    }, 8000);
  }

  function hideToast() {
    if (!toastElem) return;
    toastElem.classList.add('hiding');
    setTimeout(() => {
      toastElem.classList.remove('active');
      toastElem.classList.remove('hiding');
    }, 350);
  }

  return {
    init,
    showRandomBanter,
    hideToast
  };
})();
