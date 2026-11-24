/**
 * Egyptian Coach & Maple Banter Toast System
 * Displays hilarious Egyptian gaming coach messages on first visit and periodically/on events.
 * Urges players to sign in with Google so their training counts before Kareem complains!
 */

const EgyptianCoach = (() => {
  const GENERAL_BANTER = [
    { text: "ركز يا وحش بدل ما تجيب للأكونت حظر ونقعد نعيط جمبه! 🚨😂", icon: "👮‍♂️" },
    { text: "وربنا هخصملك من المرتب لو غلطت في الحرف ده تاني! 😂💸", icon: "🍄" },
    { text: "أصحى معايا وبلاش تسريح.. كاشف الكذب مابيهزرش وهيبعتك سجن غرفة الحقيقة! 👮‍♂️", icon: "🚨" },
    { text: "عينك على الحروف المتشابهة! ㅓ مش زي ㅏ و ㅗ مش زي ㅜ، ركز يابني!", icon: "🧐" },
    { text: "الجي ام (GM) واقف في ضهرك وعينه في شاشتك.. حاسب على نفسك! 🍁👀", icon: "🍁" },
    { text: "بلاش فتونة.. مفتاح الـ Shift هو اللي بيجيب الحروف المزدوجة، ركّز يا غالي! ⚔️", icon: "💡" },
    { text: "أوعى تكسفنا قدام كريم في لوحة المتصدرين.. كريم مقفل 520 تدريب و100%! 🏆🔥", icon: "👑" },
    { text: "صباعك على الـ Enter وقلبك حديد.. كاشف الكذب جاي في ثواني! ⚡", icon: "🎯" }
  ];

  const SIGNIN_REMINDERS = [
    { text: "سجل بحساب Google واكتب اسمك عشان تدريبك يتسجل، بدل ما كريم يقعد يصيح إنك متعلمتش الكيبورد الكوري ومبتعرفش تحل! 😂🍁", icon: "📢" },
    { text: "كل كابتشا بتحلها بتضيع في الهوا عشان مش مسجل بجوجل.. سجل دلوقتي بدل ما كريم يقعد يروش عليك! 💸", icon: "🍄" },
    { text: "كريم قاعد مستنيك في لوحة المتصدرين.. سجل بجوجل واثبتله إنك بتعرف تكتب كوري أسرع منه! 🏆", icon: "⚔️" },
    { text: "الحق سجل بجوجل عشان عدد تدريباتك وإنجازاتك في الهانغل تتسجل رسمي في السيرفر! 📝", icon: "🍁" }
  ];

  let toastElem = null;
  let ambientLightingElem = null;
  let timerId = null;
  let lastIndex = -1;

  function init() {
    createToastElement();
    createAmbientLightingElement();
    
    // Show first humorous coach message shortly after page load
    setTimeout(() => {
      if (typeof PlayerAuth !== 'undefined' && !PlayerAuth.isSignedIn()) {
        showRandomBanter(0, true);
      } else {
        showRandomBanter(0, false);
      }
    }, 1800);

    // Periodically show reminders every 45 seconds
    setInterval(() => {
      const needsSignin = typeof PlayerAuth !== 'undefined' && !PlayerAuth.isSignedIn();
      showRandomBanter(null, needsSignin && Math.random() < 0.65);
    }, 45000);
  }

  function createAmbientLightingElement() {
    if (document.getElementById('coach-ambient-lighting')) {
      ambientLightingElem = document.getElementById('coach-ambient-lighting');
      return;
    }
    ambientLightingElem = document.createElement('div');
    ambientLightingElem.id = 'coach-ambient-lighting';
    ambientLightingElem.className = 'coach-ambient-lighting';
    document.body.appendChild(ambientLightingElem);
  }

  function triggerAmbientLighting() {
    if (!ambientLightingElem) createAmbientLightingElement();
    if (!ambientLightingElem) return;

    // Reset and trigger smooth cinematic golden ambient pulse
    ambientLightingElem.classList.remove('active');
    document.body.classList.remove('coach-screen-flash');
    void ambientLightingElem.offsetWidth; // force DOM reflow
    void document.body.offsetWidth;

    ambientLightingElem.classList.add('active');
    document.body.classList.add('coach-screen-flash');

    setTimeout(() => {
      if (ambientLightingElem) ambientLightingElem.classList.remove('active');
      document.body.classList.remove('coach-screen-flash');
    }, 2400);
  }

  function createToastElement() {
    if (document.getElementById('egyptian-coach-toast')) return;
    toastElem = document.createElement('div');
    toastElem.id = 'egyptian-coach-toast';
    toastElem.className = 'egyptian-coach-toast';
    toastElem.innerHTML = `
      <div class="coach-icon-bubble">🍄</div>
      <div class="coach-content">
        <div class="coach-badge">✨ كوتش مابل المصري 🇪🇬 ✨</div>
        <div class="coach-message">ركز يا وحش بدل ما تجيب للأكونت حظر ونقعد نعيط جمبه! 🚨😂</div>
      </div>
      <button type="button" class="coach-close-btn" title="إغلاق">✕</button>
    `;
    document.body.appendChild(toastElem);

    const closeBtn = toastElem.querySelector('.coach-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', hideToast);
    }

    // Clicking toast opens sign-in if not signed in
    toastElem.addEventListener('click', (e) => {
      if (e.target.closest('.coach-close-btn')) return;
      if (typeof PlayerAuth !== 'undefined' && !PlayerAuth.isSignedIn()) {
        const signinModal = document.getElementById('signin-modal');
        if (signinModal) signinModal.classList.add('active');
      }
    });
  }

  function showRandomBanter(forceIndex = null, useSignin = false) {
    if (!toastElem) createToastElement();
    if (!toastElem) return;

    const list = useSignin ? SIGNIN_REMINDERS : GENERAL_BANTER;
    let idx = forceIndex !== null ? forceIndex : Math.floor(Math.random() * list.length);
    if (forceIndex === null && idx === lastIndex) {
      idx = (idx + 1) % list.length;
    }
    lastIndex = idx;

    const item = list[idx] || list[0];
    const msgElem = toastElem.querySelector('.coach-message');
    const iconElem = toastElem.querySelector('.coach-icon-bubble');

    if (msgElem) msgElem.textContent = item.text;
    if (iconElem) iconElem.textContent = item.icon;

    toastElem.classList.remove('hiding');
    toastElem.classList.add('active');

    // 1. Play authentic Egyptian musical sting & darbuka beat
    if (typeof SoundFX !== 'undefined' && typeof SoundFX.playEgyptianCoachTune === 'function') {
      try {
        SoundFX.playEgyptianCoachTune();
      } catch (err) {}
    }

    // 2. Trigger screen ambient lighting pulse
    triggerAmbientLighting();

    // Auto hide after 8.5 seconds
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      hideToast();
    }, 8500);
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EgyptianCoach;
}
