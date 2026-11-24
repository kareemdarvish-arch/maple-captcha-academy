/**
 * Egyptian Coach & Maple Banter Toast System
 * Displays hilarious Egyptian gaming coach messages periodically (every 15 minutes)
 * with an authentic light Egyptian musical sting, reminding players to stay focused,
 * practice their Korean typing, and sign in with Google so Kareem doesn't mock them.
 */

const EgyptianCoach = (() => {
  // Correct solve in practice trainer (kept for manual/milestone triggers)
  const TRAINER_SUCCESS_BANTER = [
    { text: "الله عليك يا فنان! هي دي السرعة ولا بلاش.. كاشف الكذب بيعيط منك دلوقتي! 🔥😎", icon: "👑" },
    { text: "عاش يا وحش! كريم بدأ يقلق على مكانه في المركز الأول 🏆🤣", icon: "⚔️" },
    { text: "أيوا كدا يا بطل، الكوري طلع أسهل من العربي أهو! صوابعك دهب 🍁⚡", icon: "🚀" },
    { text: "تسلم إيدك! الـ GM مسح الحظر وقاعد يسقفلك في المخفي 👏🎉", icon: "👮‍♂️" },
    { text: "جدع! خمسة في عين الحسود.. كمل كدا وهتبقى أسرع واحد في السيرفر ⚔️✨", icon: "🛡️" }
  ];

  // Mistake in practice trainer
  const TRAINER_ERROR_BANTER = [
    { text: "حاسب يا ابني! الحرف ده غلط وربنا هخصملك من المرتب زي ما اتفقنا! 💸🚨", icon: "💸" },
    { text: "ركز شوية وبلاش هبد! كاشف الكذب قرب يبعتك سجن غرفة الحقيقة (Truth Room) 👮‍♂️😂", icon: "🚨" },
    { text: "غلط يا غالي! عينك على حروف العلة.. ㅓ مش زي ㅏ و ㅗ مش زي ㅜ! 🧐", icon: "🧐" },
    { text: "كريم لو شاف الغلطة دي هيقعد يصيح ويعمل عليك ميم في الديسكورد حالا 🤣💀", icon: "📢" }
  ];

  // Correct solve in Standalone Exam
  const EXAM_SUCCESS_BANTER = [
    { text: "وحش الاختبار الرسمي! نقطة مضمونة وعينك على التوب وان في المتصدرين 🏆🔥", icon: "👑" },
    { text: "صاروخ أرض جو! الدقيقة بتجري وأنت خلصتها في ثانيتين ودُست Enter فوراً.. عاش! 🚀🍁", icon: "🚀" },
    { text: "عظمة على عظمة! كمل الاختبار كله كدا والمركز الأول في جيبك 👑⚔️", icon: "🎉" }
  ];

  // Mistake / Timeout in Standalone Exam
  const EXAM_ERROR_BANTER = [
    { text: "لاااا! ضيعت نقطة في الاختبار الرسمي! كدا كريم هيفضل شمتان فينا 😭🚨", icon: "😭" },
    { text: "الوقت بيجري والغلطة بفورة في الاختبار! ركز ودوس Enter قبل ما الدقيقة تخلص ⏱️😱", icon: "⏱️" },
    { text: "يا نهار أبيض! متستعجلش على الـ Enter قبل ما تتأكد من الحروف يا بطل! 🛑🤦‍♂️", icon: "🛑" }
  ];

  // Google Sign-in Reminders (Used if player is not signed in)
  const SIGNIN_REMINDERS = [
    { text: "بقالك ربع ساعة بتدرب من غير ما تسجل بجوجل! سجل يا عم واكتب اسمك عشان كريم يشوفك في التوب! 🏆🤣", icon: "📢" },
    { text: "سجل بحساب Google واكتب اسمك عشان تدريبك يتسجل، بدل ما كريم يقعد يصيح إنك متعلمتش الكيبورد الكوري! 😂🍁", icon: "📢" },
    { text: "كل كابتشا بتحلها بتضيع في الهوا عشان مش مسجل بجوجل.. سجل دلوقتي بدل ما كريم يقعد يروش عليك! 💸", icon: "🍄" },
    { text: "كريم قاعد مستنيك في لوحة المتصدرين.. سجل بجوجل واثبتله إنك بتعرف تكتب كوري أسرع منه! 🏆", icon: "⚔️" },
    { text: "الحق سجل بجوجل عشان عدد تدريباتك وإنجازاتك في الهانغل تتسجل رسمي في السيرفر! 📝", icon: "🍁" }
  ];

  // Periodic Funny Banter (Every ~15 minutes)
  const GENERAL_BANTER = [
    { text: "فاتت ربع ساعة تدريب يا وحش! قوم اشربلك بؤ شاي وريح عينك وركز عشان كريم ميشمتش فينا! ☕😂", icon: "☕" },
    { text: "ركز يا وحش بدل ما تجيب للأكونت حظر ونقعد نعيط جمبه! 🚨😂", icon: "👮‍♂️" },
    { text: "وربنا هخصملك من المرتب لو غلطت في الحرف ده تاني! 😂💸", icon: "🍄" },
    { text: "أصحى معايا وبلاش تسريح.. كاشف الكذب مابيهزرش وهيبعتك سجن غرفة الحقيقة! 👮‍♂️", icon: "🚨" },
    { text: "عينك على الحروف المتشابهة! ㅓ مش زي ㅏ و ㅗ مش زي ㅜ، ركز يابني!", icon: "🧐" },
    { text: "الجي ام (GM) واقف في ضهرك وعينه في شاشتك.. حاسب على نفسك! 🍁👀", icon: "🍁" },
    { text: "بلاش فتونة.. مفتاح الـ Shift هو اللي بيجيب الحروف المزدوجة، ركّز يا غالي! ⚔️", icon: "💡" },
    { text: "أوعى تكسفنا قدام كريم في لوحة المتصدرين.. كريم مقفل 520 تدريب و100%! 🏆🔥", icon: "👑" },
    { text: "صباعك على الـ Enter وقلبك حديد.. كاشف الكذب جاي في ثواني! ⚡", icon: "🎯" },
    { text: "عاش يا بطل! ربع ساعة بتمرن صوابعك.. لو كملت كدا الجي ام هيديك براءة وتصريح مرور رسمي! 🏆🔥", icon: "🔥" },
    { text: "نصيحة على الماشي: الحروف الساكنة بإيدك الشمال وحروف العلة باليمين.. بلاش عشوائية! ⌨️😎", icon: "💡" }
  ];

  let toastElem = null;
  let timerId = null;
  let lastText = '';

  // 15 Minutes Interval (ربع ساعة)
  const PERIODIC_INTERVAL_MS = 15 * 60 * 1000;

  function init() {
    createToastElement();

    // Periodic humorous banter every 15 minutes with festive Egyptian audio tune
    setInterval(() => {
      const needsSignin = typeof PlayerAuth !== 'undefined' && !PlayerAuth.isSignedIn();
      showPeriodicHumorousBanter(needsSignin && Math.random() < 0.65);
    }, PERIODIC_INTERVAL_MS);
  }

  function createToastElement() {
    if (document.getElementById('egyptian-coach-toast')) {
      toastElem = document.getElementById('egyptian-coach-toast');
      return;
    }
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

  function displayToast(item, type = 'default', playSound = false) {
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

    // Play Egyptian audio sting ONLY during the periodic 15-minute coach appearance
    if (playSound && typeof SoundFX !== 'undefined') {
      try {
        if (SoundFX.playEgyptianCoachTune) {
          SoundFX.playEgyptianCoachTune();
        }
      } catch (err) {}
    }

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

  // Periodic 15-Minute Humorous Banter Trigger with Egyptian Audio
  function showPeriodicHumorousBanter(useSignin = false) {
    const list = useSignin ? SIGNIN_REMINDERS : GENERAL_BANTER;
    const item = getRandomItem(list);
    displayToast(item, 'default', true);
  }

  // Success Banter (Silent / no audio interruption)
  function showSuccessBanter(isExam = false) {
    const list = isExam ? EXAM_SUCCESS_BANTER : TRAINER_SUCCESS_BANTER;
    const item = getRandomItem(list);
    displayToast(item, 'success', false);
  }

  // Error Banter (Silent / no audio interruption)
  function showErrorBanter(isExam = false) {
    const list = isExam ? EXAM_ERROR_BANTER : TRAINER_ERROR_BANTER;
    const item = getRandomItem(list);
    displayToast(item, 'error', false);
  }

  // Manual or Debug trigger
  function showRandomBanter(forceIndex = null, useSignin = false, playSound = false) {
    const list = useSignin ? SIGNIN_REMINDERS : GENERAL_BANTER;
    const item = (forceIndex !== null && list[forceIndex]) ? list[forceIndex] : getRandomItem(list);
    displayToast(item, 'default', playSound);
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
    showPeriodicHumorousBanter,
    showSuccessBanter,
    showErrorBanter,
    showRandomBanter,
    hideToast
  };
})();

if (typeof window !== 'undefined') {
  window.EgyptianCoach = EgyptianCoach;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EgyptianCoach;
}
