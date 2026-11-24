/**
 * Egyptian Coach & Maple Banter Toast System
 * Displays hilarious Egyptian gaming coach messages on correct solves, mistakes,
 * exam steps, and periodic Google sign-in reminders.
 */

const EgyptianCoach = (() => {
  // Correct solve in practice trainer
  const TRAINER_SUCCESS_BANTER = [
    { text: "الله عليك يا فنان! هي دي السرعة ولا بلاش.. كاشف الكذب بيعيط منك دلوقتي! 🔥😎", icon: "👑" },
    { text: "عاش يا وحش! كريم بدأ يقلق على مكانه في المركز الأول 🏆🤣", icon: "⚔️" },
    { text: "أيوا كدا يا بطل، الكوري طلع أسهل من العربي أهو! صوابعك دهب 🍁⚡", icon: "🚀" },
    { text: "تسلم إيدك! الـ GM مسح الحظر وقاعد يسقفلك في المخفي 👏🎉", icon: "👮‍♂️" },
    { text: "جدع! خمسة في عين الحسود.. كمل كدا وهتبقى أسرع واحد في السيرفر ⚔️✨", icon: "🛡️" },
    { text: "إيه الحلاوة دي؟ صوابعك بتجري على الكيبورد كأنك مولود في سيول! 🍜🚀", icon: "⚡" },
    { text: "الله أكبر عليك! استمر كدا والمكافأة الجاية هنلغي الخصم من المرتب 😂💸", icon: "🍄" },
    { text: "ولا غلطة! مابل ستوري كلها بتنحني لسرعتك يا غالي 🍁👑", icon: "🔥" }
  ];

  // Mistake in practice trainer
  const TRAINER_ERROR_BANTER = [
    { text: "حاسب يا ابني! الحرف ده غلط وربنا هخصملك من المرتب زي ما اتفقنا! 💸🚨", icon: "💸" },
    { text: "ركز شوية وبلاش هبد! كاشف الكذب قرب يبعتك سجن غرفة الحقيقة (Truth Room) 👮‍♂️😂", icon: "🚨" },
    { text: "غلط يا غالي! عينك على حروف العلة.. ㅓ مش زي ㅏ و ㅗ مش زي ㅜ! 🧐", icon: "🧐" },
    { text: "كريم لو شاف الغلطة دي هيقعد يصيح ويعمل عليك ميم في الديسكورد حالا 🤣💀", icon: "📢" },
    { text: "يا ساتر! بتضغط Shift ليه ع الفاضي؟ ركز في الحرف الأساسي يا وحش! ⚔️", icon: "💡" },
    { text: "اهدى وخد نفس عميق.. ركز في الحرف الأول والتاني وبلاش استعجال! ⏳🍁", icon: "🛑" },
    { text: "إيه ده يا كابتن؟ داخل تعصر كيبورد ولا بتحل كابتشا؟ ركز في الحروف! 🤦‍♂️😂", icon: "🍄" },
    { text: "مش مركز خالص! اشربلك بؤ شاي كدا واصحى معايا بدل ما تجيب حظر ☕🚨", icon: "☕" }
  ];

  // Correct solve in Standalone Exam
  const EXAM_SUCCESS_BANTER = [
    { text: "وحش الاختبار الرسمي! نقطة مضمونة وعينك على التوب وان في المتصدرين 🏆🔥", icon: "👑" },
    { text: "إجابة صحيحة في قلب الجون! كريم بيشرب مية بسكر من الخوف دلوقتي 🤣⚡", icon: "⚔️" },
    { text: "صاروخ أرض جو! 30 ثانية بتجري وأنت بتحلها في ثانيتين بس.. عاش! 🚀🍁", icon: "🚀" },
    { text: "الله ينور عليك! كاشف الكذب اتصدم ومش عارف يلاعبك إزاي 🛡️😎", icon: "🛡️" },
    { text: "عظمة على عظمة! كمل الاختبار كله كدا والمركز الأول في جيبك 👑⚔️", icon: "🎉" }
  ];

  // Mistake / Timeout in Standalone Exam
  const EXAM_ERROR_BANTER = [
    { text: "لاااا! ضيعت نقطة في الاختبار الرسمي! كدا كريم هيفضل شمتان فينا 😭🚨", icon: "😭" },
    { text: "الوقت بيجري والغلطة بفورة في الاختبار! ركز قبل ما الـ 30 ثانية تخلص ⏱️😱", icon: "⏱️" },
    { text: "غلطة في الاختبار الرسمي؟! لو جبت سترايك تاني الجي ام هيدخلك السجن! 👮‍♂️💸", icon: "🚨" },
    { text: "يا نهار أبيض! متستعجلش على الـ Enter قبل ما تتأكد من الحروف يا بطل! 🛑🤦‍♂️", icon: "🛑" },
    { text: "كريم قاعد بيسجل درجات الاختبار.. متخليهوش يصيح عليك في الديسكورد! 🤣🍁", icon: "📢" }
  ];

  const SIGNIN_REMINDERS = [
    { text: "سجل بحساب Google واكتب اسمك عشان تدريبك يتسجل، بدل ما كريم يقعد يصيح إنك متعلمتش الكيبورد الكوري ومبتعرفش تحل! 😂🍁", icon: "📢" },
    { text: "كل كابتشا بتحلها بتضيع في الهوا عشان مش مسجل بجوجل.. سجل دلوقتي بدل ما كريم يقعد يروش عليك! 💸", icon: "🍄" },
    { text: "كريم قاعد مستنيك في لوحة المتصدرين.. سجل بجوجل واثبتله إنك بتعرف تكتب كوري أسرع منه! 🏆", icon: "⚔️" },
    { text: "الحق سجل بجوجل عشان عدد تدريباتك وإنجازاتك في الهانغل تتسجل رسمي في السيرفر! 📝", icon: "🍁" }
  ];

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

  let toastElem = null;
  let ambientLightingElem = null;
  let timerId = null;
  let lastText = '';

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

    // Periodically show reminders every 45 seconds if idle
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

  function triggerAmbientLighting(type = 'default') {
    if (!ambientLightingElem) createAmbientLightingElement();
    if (!ambientLightingElem) return;

    // Reset classes
    ambientLightingElem.className = 'coach-ambient-lighting';
    document.body.classList.remove('coach-screen-flash', 'coach-flash-success', 'coach-flash-error');

    void ambientLightingElem.offsetWidth; // force DOM reflow
    void document.body.offsetWidth;

    ambientLightingElem.classList.add('active');
    document.body.classList.add('coach-screen-flash');

    if (type === 'success') {
      ambientLightingElem.classList.add('lighting-success');
      document.body.classList.add('coach-flash-success');
    } else if (type === 'error') {
      ambientLightingElem.classList.add('lighting-error');
      document.body.classList.add('coach-flash-error');
    }

    setTimeout(() => {
      if (ambientLightingElem) ambientLightingElem.className = 'coach-ambient-lighting';
      document.body.classList.remove('coach-screen-flash', 'coach-flash-success', 'coach-flash-error');
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

  function displayToast(item, type = 'default') {
    if (!toastElem) createToastElement();
    if (!toastElem) return;

    lastText = item.text;
    const msgElem = toastElem.querySelector('.coach-message');
    const iconElem = toastElem.querySelector('.coach-icon-bubble');

    if (msgElem) msgElem.textContent = item.text;
    if (iconElem) iconElem.textContent = item.icon;

    toastElem.classList.remove('hiding', 'toast-success', 'toast-error');
    if (type === 'success') toastElem.classList.add('toast-success');
    else if (type === 'error') toastElem.classList.add('toast-error');

    toastElem.classList.add('active');

    // 1. Play appropriate Egyptian audio sting
    if (typeof SoundFX !== 'undefined') {
      try {
        if (type === 'error' && SoundFX.playEgyptianCoachErrorTune) {
          SoundFX.playEgyptianCoachErrorTune();
        } else if (SoundFX.playEgyptianCoachTune) {
          SoundFX.playEgyptianCoachTune();
        }
      } catch (err) {}
    }

    // 2. Trigger screen ambient lighting pulse matching event type
    triggerAmbientLighting(type);

    // Auto hide after 8 seconds
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      hideToast();
    }, 8000);
  }

  function getRandomItem(list) {
    const filtered = list.filter(it => it.text !== lastText);
    const pool = filtered.length > 0 ? filtered : list;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Triggered when player solves correctly in Trainer or Exam
  function showSuccessBanter(isExam = false) {
    const list = isExam ? EXAM_SUCCESS_BANTER : TRAINER_SUCCESS_BANTER;
    const item = getRandomItem(list);
    displayToast(item, 'success');
  }

  // Triggered when player makes a mistake in Trainer or Exam
  function showErrorBanter(isExam = false) {
    const list = isExam ? EXAM_ERROR_BANTER : TRAINER_ERROR_BANTER;
    const item = getRandomItem(list);
    displayToast(item, 'error');
  }

  // Periodic and manual banter triggers
  function showRandomBanter(forceIndex = null, useSignin = false) {
    const list = useSignin ? SIGNIN_REMINDERS : GENERAL_BANTER;
    const item = (forceIndex !== null && list[forceIndex]) ? list[forceIndex] : getRandomItem(list);
    displayToast(item, 'default');
  }

  function hideToast() {
    if (!toastElem) return;
    toastElem.classList.add('hiding');
    setTimeout(() => {
      toastElem.classList.remove('active', 'hiding', 'toast-success', 'toast-error');
    }, 350);
  }

  return {
    init,
    showSuccessBanter,
    showErrorBanter,
    showRandomBanter,
    hideToast
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EgyptianCoach;
}
