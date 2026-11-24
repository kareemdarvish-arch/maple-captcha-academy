/**
 * Internationalization (i18n) Engine
 * Full bilingual support for English and Arabic (العربية) with RTL/LTR layout switching.
 */

const I18n = (() => {
  const translations = {
    en: {
      appName: 'MapleCaptcha',
      appBadge: 'Academy',
      appSubtitle: 'Korean Lie Detector (거짓말탐지기) Simulator, Keyboard & Hangul Trainer',
      
      // Navigation Tabs
      tabTrainer: 'Practice Trainer',
      tabExamStandalone: 'Official Exam (10/15/20)',
      tabLeaderboard: 'Leaderboard 🏆',
      tabAcademy: 'Hangul Academy',
      tabLookalikes: 'Lookalike Traps',
      tabDrill: 'Letter Drills',
      tabGuide: 'Keyboard Setup Guide',
      tabSandbox: 'Custom Sandbox',

      // Player Profile & Sign-In
      btnSignIn: '👤 Sign In / Choose Name',
      btnSignOut: 'Sign Out ✕',
      signInModalTitle: 'Enter Player Name & Sign In for the Exam',
      signInGoogleBtn: 'Sign In with Google',
      signInCustomBtn: 'Save Name & Continue',
      labelPlayerName: 'In-Game Name (IGN):',
      chooseAvatar: 'Choose Character Avatar:',
      signInPromptBeforeExam: 'Sign in to record your score on the live Leaderboard!',

      // Visual Keyboard Guide (Photo Guide)
      visualKbTitle: 'Korean Keyboard Layout (Windows Dubeolsik)',
      visualKbPrompt: 'Type letters directly using your physical computer keyboard (Windows Keyboard). Keystrokes are automatically assembled into Korean characters, or switch to Korean IME in Windows.',
      legendLeftHand: 'Left Hand: Consonants (자음)',
      legendRightHand: 'Right Hand: Vowels (모음)',
      legendShift: 'Press Shift for Double Consonants (ㄲ, ㄸ, ㅃ, ㅆ, ㅉ, ㅒ, ㅖ)',
      examKbNoticeTitle: 'Notice during Exam:',
      examKbNoticeDesc: 'Type answers directly from your computer keyboard (Windows Keyboard). Timer is 1 full minute (60s) per question. Press Enter or click Submit to confirm your answer!',
      floatingKbPrompt: '💡 Keyboard Notice: Type directly using your physical Windows keyboard!',
      btnOpenFloatingKb: '⌨️ Physical Windows Keyboard Active',

      // Standalone Exam Tab
      examIntroTitle: 'Official Lie Detector Exam Session',
      examIntroDesc: 'Take an authentic in-game timed exam of 10, 15, or 20 captchas with 1 full minute (60s) per question. Press Enter to confirm each answer. You will receive an official grade (S, A, B, C, F), an error breakdown of what you did wrong, and rank on the live Leaderboard!',
      btnStartExamOfficial: '🚀 Begin Official Exam Now',

      // Leaderboard
      leaderboardTitle: '🏆 Lie Detector Leaderboard & Hall of Fame',
      leaderboardDesc: 'Top MapleStory players with highest accuracy and fastest solve speeds in 10, 15, and 20 captcha exams.',
      filterAll: 'All Exams',
      filter20: '20 Captchas',
      filter15: '15 Captchas',
      filter10: '10 Captchas',

      // Sound
      soundOn: '🔊 Sound On',
      soundOff: '🔇 Sound Off',

      // Controls
      labelMode: 'Mode:',
      labelSyllables: 'Syllables:',
      labelNoise: 'Noise:',
      labelScene: 'Scene:',

      modePractice: 'Endless Practice (No Timer)',
      modeTest: 'Timed Exam (30s & Strikes)',
      modeSpeedrun: 'Speedrun (10-Streak Race)',

      setBalanced: 'Balanced In-Game Mix',
      setAuthentic: 'Authentic Maple Words',
      setAdaptive: '🧠 Smart Adaptive (Your Weak Letters)',
      setBatchim: 'Difficult Batchim (겹받침)',
      setVowels: 'Compound Vowels (이중모음)',
      setLookalikes: 'Lookalike Traps (ㅓ/ㅏ, ㅗ/ㅜ)',
      setAll: 'All 11,172 Hangul Syllables',

      noiseEasy: 'Easy (Light Noise)',
      noiseNormal: 'Medium',
      noiseHard: 'Hard (Game Accurate)',
      noiseInsane: 'Insane (Nightmare)',

      sceneSky: 'Sky & Rock (Screenshot 4)',
      sceneCloud: 'Cloud Balcony (Screenshot 1)',
      scenePortal: 'Ellinia Portal (Screenshot 2)',
      sceneDungeon: 'Dark Dungeon (Screenshot 3)',
      sceneClean: 'Clean Dark (Focus Mode)',

      btnLens: '🔍 Lens',
      btnHint: '💡 Hint',
      btnNew: '🔄 New (Skip)',
      btnKeyboardGuideQuick: '⌨️ Keyboard Guide',
      btnClear: 'Clear',
      btnSubmit: 'Submit ↵',
      btnFloatingKb: '🪟 Float Keyboard',
      btnDockKb: '⬇️ Dock Keyboard',
      btnPronounce: '🔊 Listen',

      // Stats
      statStreak: 'Streak:',
      statBest: 'Best Streak:',
      statSolved: 'Solved:',
      statAccuracy: 'Accuracy:',
      statStrikes: 'Strikes:',
      timeLeft: 'Time Remaining:',

      // Hints & Footers
      canvasHoverHint: 'Type characters using your keyboard and press Enter to confirm ↵',
      engineBadge: 'KMS Lie Detector Engine',
      hintHeader: '💡 Stroke Breakdown & QWERTY Keystrokes',
      hintSubnote: 'Click any letter card to inspect parts & hear pronunciation',

      // Virtual Keyboard
      kbTitle: 'Interactive Dubeolsik (두벌식) Keyboard',
      kbSubnote: 'Type on your English keyboard (auto-converted to Hangul!) or click keys below.',
      leftHand: 'Left Hand: Consonants (자음)',
      rightHand: 'Right Hand: Vowels (모음)',
      shiftTip: 'Shift for Double Letters (ㄲ, ㄸ, ㅃ, ㅆ, ㅉ, ㅒ, ㅖ)',

      // Academy Tab
      academyTitle: 'Hangul Structure 101 for Gamers',
      academyDesc: 'Korean is an alphabet assembled into blocks. Every block consists of an Initial Consonant (Left Hand) + Medial Vowel (Right Hand) + optional Final Batchim (Left Hand).',
      blockTwoPart: 'Two-Part Block (Initial + Vowel)',
      blockThreePart: 'Three-Part Block (Initial + Vowel + Batchim)',
      blockCompound: 'Compound Batchim Block',

      deconTitle: '🔬 Interactive Syllable Deconstructor & Speech',
      deconDesc: 'Type ANY Korean syllable or letter to see its stroke breakdown, English keys, and hear native pronunciation:',
      deconBtn: 'Deconstruct',
      deconPlaceholder: 'e.g. 빛, 닭, 엊, 낄, 화',

      allLetters: 'All Letters',
      consonants: 'Consonants (자음)',
      vowels: 'Vowels (모음)',
      compoundVowels: 'Compound Vowels',
      batchim: 'Tricky Batchim (받침)',

      // Lookalike Traps Tab
      lookalikeTitle: '👁️ "Lookalike Traps" Spotter Guide',
      lookalikeDesc: 'Under heavy pixel noise lines and confetti dots in MapleStory, certain characters look virtually identical. Memorize these key geometric differences to never fail a lie detector again!',
      keyClue: 'Key Clue',
      mapleSamples: 'Maple Samples:',
      keysNeeded: 'Keys:',

      // Drill Tab
      drillTitle: '⚡ Speed Letter Recognition Drill',
      drillDesc: 'Train your brain to instantly identify noisy Korean letters and tap their QWERTY keys with muscle memory.',
      drillPrompt: 'Identify this letter & press its QWERTY key:',
      drillSkip: 'Skip',

      // Keyboard Setup Guide Tab
      guideTitle: '🪟 Korean Keyboard Setup & Floating Screen Guide',
      guideDesc: 'How to install the Korean IME in Windows and how to make the on-screen keyboard float over your game window.',
      guideStep1Title: 'Step 1: Install Korean Language in Windows 10/11',
      guideStep1Desc: '1. Open Windows Settings (Press Win + I).\n2. Go to "Time & Language" → "Language & Region".\n3. Click "Add a language" and search for "Korean (한국어)".\n4. Install the Basic Typing package.',
      guideStep2Title: 'Step 2: Switching Between English/Arabic & Korean',
      guideStep2Desc: '• Press Win + Space or Left Alt + Shift to toggle between your languages.\n• When Korean is active, press the Right Alt key (한/영) to switch between English typing and Hangul typing (or click the "A" icon in the taskbar so it turns into "가").',
      guideStep3Title: 'Step 3: Make the Keyboard Float On-Screen',
      guideStep3Desc: '• Press Win + Ctrl + O to launch the Windows On-Screen Keyboard (OSK).\n• You can drag it, resize it, and position it directly over or next to your MapleStory game window!\n• Alternatively, click "🪟 Float Keyboard" on this website to test using a floating keyboard right now.',

      // Sandbox Tab
      sandboxTitle: '🎨 Custom Captcha Generator & Image Exporter',
      sandboxDesc: 'Generate authentic MapleStory captchas with your own words, test guild members, or export PNG images.',
      sandboxInputLabel: 'Custom Korean Text (Up to 8 chars):',
      sandboxTiltLabel: 'Banner Tilt Angle:',
      sandboxNoiseLabel: 'Noise Intensity:',
      sandboxBgLabel: 'Background Scene:',
      sandboxBtnRender: 'Render',
      sandboxBtnRandom: 'Random',
      sandboxBtnExport: '💾 Export Image as PNG',

      // Truth Room Modal
      truthRoomBadge: '🚨 LIE DETECTOR FAILED',
      truthRoomTitle: 'Teleported to the Truth Room! (진실의 방)',
      truthRoomMsg: '"You failed to enter the Lie Detector text within the time limit or accumulated 3 strikes! In MapleStory, this moves your character to the Truth Room prison."',
      truthRoomAdvice: 'Trainer Advice:',
      truthRoomTip1: 'Use the Hangul Academy tab to master tricky letters.',
      truthRoomTip2: 'Consonants are typed with your Left Hand, Vowels with your Right Hand.',
      truthRoomTip3: 'Use 💡 Character Hint to inspect stroke composition and keys.',
      truthRoomRetry: 'Try Again (재도전)',

      // Smart Diagnostics
      diagCorrect: '✓ Excellent! Solved in {time}s! (Streak: {streak})',
      diagTimeout: '⏱ Time is up! Target was: {target}',
      diagWrong: '✗ Incorrect. Typed: "{typed}", Expected: "{target}"',
      diagLookalikeVowel: '💡 Smart Tip: You confused ㅓ and ㅏ! Remember: "ㅏ" (key: k) points right/outward, while "ㅓ" (key: j) points left/inward.',
      diagLookalikeO: '💡 Smart Tip: You confused ㅗ and ㅜ! Remember: "ㅗ" (key: h) sticks up, while "ㅜ" (key: n) hangs down.',
      diagLookalikeJ: '💡 Smart Tip: You confused ㅈ and ㅊ! Remember: "ㅊ" (key: c) has an extra dot/hat on top.',
      diagLookalikeB: '💡 Smart Tip: You confused ㅁ and ㅂ! Remember: "ㅂ" (key: q) has two open horns on top.',
      diagLookalikeD: '💡 Smart Tip: You confused ㄷ, ㅌ, or ㄹ! Check the horizontal bar counts (ㄷ=2, ㅌ=3, ㄹ=spiral).',
      diagMissingBatchim: '💡 Smart Tip: You missed the bottom batchim final consonant! Remember: batchims are typed at the end of the syllable.',

      // Exam Mode & Multi-Question Results
      modeExam: 'Official Exam (10, 15, or 20 Captchas)',
      labelExamLength: 'Exam Questions:',
      exam10: '10 Captchas',
      exam15: '15 Captchas',
      exam20: '20 Captchas',
      examProgress: 'Exam Progress: Question {current} of {total}',
      examScoreSoFar: 'Score: {correct} / {total}',
      examResultsTitle: 'Exam Results & Performance Report',
      examGradeS: '🌟 S Grade - Grandmaster Lie Detector!',
      examGradeA: '🎖️ A Grade - Lie Detector Veteran!',
      examGradeB: '⚔️ B Grade - Solid Maple Adventurer!',
      examGradeC: '⚠️ C Grade - Training Needed',
      examGradeF: '🚨 F Grade - Sent to Truth Room Prison!',
      examSummaryTotal: 'Total Score:',
      examSummaryAvgTime: 'Average Solve Speed:',
      examSummaryTotalTime: 'Total Time:',
      examWhatYouDidWrongTitle: '🔍 Detailed Error Analysis: What You Did Wrong',
      examAllCorrectMsg: '🎉 Flawless Victory! You solved every single captcha with 100% accuracy! Zero mistakes made!',
      examQuestionNum: 'Question #{num}',
      examExpected: 'Expected:',
      examYouTyped: 'You typed:',
      examReason: 'What went wrong:',
      examKeyTip: 'Correct keys to press:',
      examTimedOutBadge: '⏱ Timed Out (60s exceeded)',
      examRetakeBtn: '🔄 Retake Full Exam',
      examRetryErrorsBtn: '🎯 Retry Mistakes Only ({count})',
      examStudyWeakBtn: '📚 Review Weak Letters in Academy',

      footerText: 'MapleCaptcha Academy • Designed for gamers learning Korean Dubeolsik typing & MapleStory Lie Detector captchas.'
    },

    ar: {
      appName: 'مابل كابتشا',
      appBadge: 'أكاديمية',
      appSubtitle: 'محاكي كاشف الكذب (거짓말탐지기) بمابل ستوري، تدريب لوحة المفاتيح وإتقان الهانغل الكوري',

      // Navigation Tabs
      tabTrainer: 'مدرب الكابتشا',
      tabExamStandalone: 'الاختبار الرسمي (10/15/20) 📝',
      tabLeaderboard: 'لوحة المتصدرين 🏆',
      tabAcademy: 'أكاديمية الهانغل',
      tabLookalikes: 'فخاخ الحروف المتشابهة',
      tabDrill: 'تدريب السرعة',
      tabGuide: 'دليل الكيبورد الكوري',
      tabSandbox: 'المختبر والتصدير',

      // Player Profile & Sign-In
      btnSignIn: '👤 ادخل اسمك / تسجيل الدخول',
      btnSignOut: 'خروج ✕',
      signInModalTitle: 'اختر اسمك وسجل لدخول الاختبار الرسمي',
      signInGoogleBtn: 'الدخول بحساب Google',
      signInCustomBtn: 'حفظ الاسم والبدء',
      labelPlayerName: 'اسم اللاعب باللعبة (IGN):',
      chooseAvatar: 'اختر شكل الشخصية:',
      signInPromptBeforeExam: 'سجل اسمك ليتم حفظ نتيجتك في لوحة المتصدرين وقائمة الشرف!',

      // Visual Keyboard Guide (Photo Guide)
      visualKbTitle: 'مخطط لوحة المفاتيح الكورية (Windows Dubeolsik Keyboard)',
      visualKbPrompt: 'اكتب الحروف مباشرة باستخدام لوحة مفاتيح حاسوبك (Windows Physical Keyboard). سيقوم النظام بتجميع الحروف تلقائياً عند الكتابة بمفاتيح QWERTY الإنجليزية أو تفعيل اللغة الكورية.',
      legendLeftHand: 'اليد اليسرى: الحروف الساكنة (자음)',
      legendRightHand: 'اليد اليمنى: حروف العلة (모음)',
      legendShift: 'اضغط Shift للحروف المزدوجة (ㄲ, ㄸ, ㅃ, ㅆ, ㅉ, ㅒ, ㅖ)',
      examKbNoticeTitle: 'تنبيه وتعليمات الاختبار:',
      examKbNoticeDesc: 'اكتب الإجابات مباشرة من كيبورد حاسوبك (Windows Keyboard). الوقت دقيقة كاملة (60 ثانية) لكل كابتشا، ولازم تدوس Enter أو زر التأكيد ↵ لاعتماد الإجابة! لن يتم الانتقال تلقائياً.',
      floatingKbPrompt: '💡 تنبيه الكيبورد: اكتب مباشرة باستخدام لوحة مفاتيح حاسوبك (Windows Keyboard)!',
      btnOpenFloatingKb: '⌨️ كيبورد الويندوز مفعل',

      // Standalone Exam Tab
      examIntroTitle: 'جلسة الاختبار الرسمي لكاشف الكذب (Lie Detector)',
      examIntroDesc: 'ادخل اختباراً حقيقياً مكوناً من 10 أو 15 أو 20 كابتشا بمؤقت دقيقة كاملة (60 ثانية) لكل كابتشا. اكتب الحروف من الكيبورد واضغط Enter للتأكيد بعد الانتهاء. ستحصل في النهاية على تقييم رسمي (S أو A أو B أو C أو F)، وتحليل تفصيلي لما قمت به خطأ، وسيتم تسجيل نتيجتك في لوحة المتصدرين!',
      btnStartExamOfficial: '🚀 ابدأ الاختبار الرسمي الآن',

      // Leaderboard
      leaderboardTitle: '🏆 لوحة المتصدرين وقائمة شرف كاشف الكذب',
      leaderboardDesc: 'أفضل لاعبي مابل ستوري بأعلى دقة وأسرع وقت حل في اختبارات الـ 10 و 15 و 20 كابتشا.',
      filterAll: 'جميع الاختبارات',
      filter20: 'اختبار 20 كابتشا',
      filter15: 'اختبار 15 كابتشا',
      filter10: 'اختبار 10 كابتشا',

      // Sound
      soundOn: '🔊 الصوت مفعل',
      soundOff: '🔇 كتم الصوت',

      // Controls
      labelMode: 'النمط:',
      labelSyllables: 'مجموعة الحروف:',
      labelNoise: 'مستوى التشويش:',
      labelScene: 'الخلفية:',

      modePractice: 'تدريب لا نهائي (بدون وقت)',
      modeTest: 'اختبار موقوت (30 ثانية وإنذارات)',
      modeSpeedrun: 'سباق السرعة (10 كابتشا متتالية)',

      setBalanced: 'مزيج اللعبة المتوازن',
      setAuthentic: 'كلمات مابل ستوري الأصلية',
      setAdaptive: '🧠 تدريب ذكي (نقاط ضعفك)',
      setBatchim: 'باتشيم مركب معقد (겹받침)',
      setVowels: 'حروف علة مركبة (이중모음)',
      setLookalikes: 'فخاخ الحروف المتشابهة (ㅓ/ㅏ, ㅗ/ㅜ)',
      setAll: 'جميع مقاطع الهانغل (11,172 حرف)',

      noiseEasy: 'سهل (تشويش خفيف)',
      noiseNormal: 'متوسط',
      noiseHard: 'صعب (مطابق للعبة تماماً)',
      noiseInsane: 'كابوس (صعوبة قصوى)',

      sceneSky: 'السماء والصخور (لقطة 4)',
      sceneCloud: 'شرفة الغيوم (لقطة 1)',
      scenePortal: 'بوابة إلينيا (لقطة 2)',
      sceneDungeon: 'الزنزانة الزرقاء (لقطة 3)',
      sceneClean: 'داكن نقي (وضع التركيز)',

      btnLens: '🔍 عدسة مكبرة',
      btnHint: '💡 تلميح',
      btnNew: '🔄 كابتشا جديدة',
      btnKeyboardGuideQuick: '⌨️ دليل إظهار الكيبورد',
      btnClear: 'مسح',
      btnSubmit: 'تأكيد ↵',
      btnFloatingKb: '🪟 كيبورد عائم',
      btnDockKb: '⬇️ تثبيت الكيبورد',
      btnPronounce: '🔊 استمع للنطق',

      // Stats
      statStreak: 'سلسلة النجاح:',
      statBest: 'أفضل سلسلة:',
      statSolved: 'تم حلها:',
      statAccuracy: 'نسبة الدقة:',
      statStrikes: 'الإنذارات:',
      timeLeft: 'الوقت المتبقي:',

      // Hints & Footers
      canvasHoverHint: 'اكتب الحروف من لوحة مفاتيحك واضغط Enter للتأكيد ↵',
      engineBadge: 'محرك كاشف الكذب الرسمي KMS',
      hintHeader: '💡 تفكيك الحروف ومفاتيح QWERTY الإنجليزية',
      hintSubnote: 'اضغط على أي بطاقة حرف لفحص أجزائه والاستماع إلى نطقه الكوري الأصلي',

      // Virtual Keyboard
      kbTitle: 'لوحة المفاتيح الكورية التفاعلية (두벌식 Dubeolsik)',
      kbSubnote: 'اكتب مباشرة من كيبورد حاسوبك بالإنجليزية (سيتم تجميعه تلقائياً كوري!) أو انقر المفاتيح أدناه.',
      leftHand: 'اليد اليسرى: الحروف الساكنة (자음)',
      rightHand: 'اليد اليمنى: حروف العلة (모음)',
      shiftTip: 'اضغط Shift للحروف المزدوجة (ㄲ, ㄸ, ㅃ, ㅆ, ㅉ, ㅒ, ㅖ)',

      // Academy Tab
      academyTitle: 'أساسيات لغة الهانغل 101 للاعبين',
      academyDesc: 'اللغة الكورية هي لغة أبجدية تُجمع في كتل ومقاطع. يتكون كل مقطع من: حرف ساكن أولي (باليد اليسرى) + حرف علة وسطي (باليد اليمنى) + باتشيم ختامي اختياري (باليد اليسرى).',
      blockTwoPart: 'مقطع ثنائي (ساكن + حرف علة)',
      blockThreePart: 'مقطع ثلاثي (ساكن + علة + باتشيم)',
      blockCompound: 'مقطع بباتشيم مزدوج معقد',

      deconTitle: '🔬 جهاز التفكيك التفاعلي والنطق الصوتي',
      deconDesc: 'اكتب أي مقطع أو حرف كوري لترى تفكيكه بدقة، والمفاتيح الإنجليزية المطلوبة لنطقه:',
      deconBtn: 'فكك الحرف',
      deconPlaceholder: 'مثال: 빛, 닭, 엊, 낄, 화',

      allLetters: 'جميع الحروف',
      consonants: 'الحروف الساكنة (자음)',
      vowels: 'حروف العلة (모음)',
      compoundVowels: 'حروف العلة المركبة',
      batchim: 'الباتشيم المعقد (받침)',

      // Lookalike Traps Tab
      lookalikeTitle: '👁️ دليل كشف "فخاخ الحروف المتشابهة"',
      lookalikeDesc: 'تحت خطوط التشويش الكثيفة ونقاط الألوان في لعبة مابل ستوري، تبدو بعض الحروف متطابقة تماماً لغير الكوريين. احفظ هذه الفروق الهندسية البسيطة ولن ترسب في كاشف الكذب أبداً!',
      keyClue: 'سر التمييز',
      mapleSamples: 'أمثلة من مابل:',
      keysNeeded: 'المفاتيح:',

      // Drill Tab
      drillTitle: '⚡ تدريب سرعة رد الفعل للحروف الفردية',
      drillDesc: 'درّب عقلك على التعرف الفوري على الحروف الكورية المشوشة وضغط مفتاحها بسرعة وبذاكرة عضلية خالصة.',
      drillPrompt: 'تعرف على هذا الحرف واضغط مفتاحه على الكيبورد:',
      drillSkip: 'تخطي',

      // Keyboard Setup Guide Tab
      guideTitle: '🪟 دليل تثبيت الكيبورد الكوري وجعله عائماً على شاشتك',
      guideDesc: 'شرح مفصل لكيفية تثبيت لوحة المفاتيح الكورية على Windows 10/11 وكيفية جعل لوحة المفاتيح تطفو فوق شاشة اللعبة.',
      guideStep1Title: 'الخطوة 1: تثبيت اللغة الكورية في ويندوز 10/11',
      guideStep1Desc: '1. افتح إعدادات ويندوز (اضغط على Win + I).\n2. توجه إلى "الوقت واللغة (Time & Language)" ثم "اللغة والمنطقة (Language & Region)".\n3. انقر على "إضافة لغة (Add a language)" وابحث عن "الكورية (한국어)".\n4. ثبّت حزمة الكتابة الأساسية (Basic Typing).',
      guideStep2Title: 'الخطوة 2: التبديل بين العربية/الإنجليزية والكورية',
      guideStep2Desc: '• اضغط على Win + Space أو Left Alt + Shift للتبديل بين لغاتك المثبتة.\n• عند اختيار اللغة الكورية، اضغط على زر Right Alt (زر 한/영 في الكيبورد الكوري) للتبديل بين كتابة الإنجليزية والكتابة الكورية (أو انقر على حرف A بجوار الساعة ليتحول إلى 가).',
      guideStep3Title: 'الخطوة 3: جعل لوحة المفاتيح تطفو فوق شاشة اللعبة',
      guideStep3Desc: '• اضغط على Win + Ctrl + O لفتح لوحة المفاتيح المعروضة على الشاشة (On-Screen Keyboard).\n• يمكنك سحبها وتغيير حجمها ووضعها في أي مكان فوق أو بجوار نافذة لعبة مابل ستوري أثناء اللعب!\n• كما يمكنك أيضاً النقر على زر "🪟 كيبورد عائم" هنا في الموقع لتجربة الكيبورد العائم القابل للسحب فوراً!',

      // Sandbox Tab
      sandboxTitle: '🎨 مختبر الكابتشا وتصدير الصور المخصصة',
      sandboxDesc: 'أنشئ كابتشا مابل ستوري حقيقية بأي نص أو كلمات تريدها، واختبر أعضاء نقابتك (Guild) أو صدّر الصورة كـ PNG.',
      sandboxInputLabel: 'النص الكوري المخصص (حتى 8 أحرف):',
      sandboxTiltLabel: 'زاوية ميلان اللافتة:',
      sandboxNoiseLabel: 'كثافة التشويش:',
      sandboxBgLabel: 'مشهد الخلفية:',
      sandboxBtnRender: 'رسم الكابتشا',
      sandboxBtnRandom: 'نص عشوائي',
      sandboxBtnExport: '💾 تصدير الكابتشا كصورة PNG',

      // Truth Room Modal
      truthRoomBadge: '🚨 فشل كاشف الكذب!',
      truthRoomTitle: 'تم نقلك إلى "غرفة الحقيقة" وسجن اللعبة! (진실의 방)',
      truthRoomMsg: '"لقد فشلت في إدخال نص كاشف الكذب في الوقت المحدد أو جمعت 3 إنذارات خاطئة! في مابل ستوري، ينقل هذا المشرف الأمني شخصيتك إلى سجن غرفة الحقيقة."',
      truthRoomAdvice: 'نصائح المدرب لاجتياز الاختبار:',
      truthRoomTip1: 'استخدم تبويب "أكاديمية الهانغل" لحفظ الحروف المعقدة.',
      truthRoomTip2: 'تذكر: الحروف الساكنة تُكتب بيدك اليسرى، وحروف العلة بيدك اليمنى.',
      truthRoomTip3: 'استخدم 💡 تلميح الحروف لفحص تركيبة الحروف والمفاتيح المقابلة.',
      truthRoomRetry: 'إعادة المحاولة (재도전)',

      // Smart Diagnostics
      diagCorrect: '✓ رائع جداً! تم الحل في {time} ثانية! (سلسلة النجاح: {streak})',
      diagTimeout: '⏱ انتهى الوقت! الكلمة المستهدفة كانت: {target}',
      diagWrong: '✗ غير صحيح. كتبت: "{typed}"، والمطلوب: "{target}"',
      diagLookalikeVowel: '💡 تشخيص ذكي: لقد خلطت بين ㅓ و ㅏ! تذكر: الحرف "ㅏ" (مفتاح k) نتؤه يتجه لليمين/الخارج، بينما "ㅓ" (مفتاح j) يتجه لليسار/الداخل.',
      diagLookalikeO: '💡 تشخيص ذكي: لقد خلطت بين ㅗ و ㅜ! تذكر: الحرف "ㅗ" (مفتاح h) ساقه تتجه للأعلى، بينما "ㅜ" (مفتاح n) ساقه تتدلى للأسفل.',
      diagLookalikeJ: '💡 تشخيص ذكي: لقد خلطت بين ㅈ و ㅊ! تذكر: الحرف "ㅊ" (مفتاح c) تعلوه قبعة أو نقطة إضافية في الأعلى.',
      diagLookalikeB: '💡 تشخيص ذكي: لقد خلطت بين ㅁ و ㅂ! تذكر: الحرف "ㅂ" (مفتاح q) له قرنان مفتوحان في الأعلى، بينما "ㅁ" مربع مغلق.',
      diagLookalikeD: '💡 تشخيص ذكي: لقد خلطت بين ㄷ و ㅌ أو ㄹ! انتبه لعدد الخطوط الأفقية (ㄷ=2، ㅌ=3، ㄹ=حلزوني).',
      diagMissingBatchim: '💡 تشخيص ذكي: لقد نسيت حرف الباتشيم السفلي! تذكر: الباتشيم يُكتب دائماً في نهاية المقطع.',

      // Exam Mode & Multi-Question Results
      modeExam: 'اختبار رسمي متكامل (10 أو 15 أو 20 كابتشا)',
      labelExamLength: 'عدد أسئلة الاختبار:',
      exam10: '10 كابتشا',
      exam15: '15 كابتشا',
      exam20: '20 كابتشا',
      examProgress: 'تقدم الاختبار: السؤال {current} من {total}',
      examScoreSoFar: 'النتيجة: {correct} / {total}',
      examResultsTitle: 'تقرير نتائج الاختبار وتحليل الأداء التفصيلي',
      examGradeS: '🌟 التقييم S - ماستر كاشف الكذب الأسطوري!',
      examGradeA: '🎖️ التقييم A - خبير متمرس في كاشف الكذب!',
      examGradeB: '⚔️ التقييم B - مغامر مابل مجتهد!',
      examGradeC: '⚠️ التقييم C - بحاجة إلى مزيد من التدريب',
      examGradeF: '🚨 التقييم F - تم النقل لسجن غرفة الحقيقة!',
      examSummaryTotal: 'النتيجة الإجمالية:',
      examSummaryAvgTime: 'متوسط سرعة الحل:',
      examSummaryTotalTime: 'الوقت الإجمالي:',
      examWhatYouDidWrongTitle: '🔍 مراجعة الأخطاء التفصيلية: ما قمت به خطأ وكيفية تصحيحه',
      examAllCorrectMsg: '🎉 إنجاز أسطوري باهر! لقد قمت بحل جميع الكابتشا بنسبة 100% دون أي خطأ!',
      examQuestionNum: 'السؤال رقم #{num}',
      examExpected: 'المطلوب الأصلي:',
      examYouTyped: 'ما كتبته:',
      examReason: 'تشخيص سبب الخطأ:',
      examKeyTip: 'المفاتيح الصحيحة للضغط:',
      examTimedOutBadge: '⏱ انتهى الوقت (تجاوزت دقيقة كاملة)',
      examRetakeBtn: '🔄 إعادة الاختبار كاملاً',
      examRetryErrorsBtn: '🎯 إعادة الأسئلة الخاطئة فقط ({count})',
      examStudyWeakBtn: '📚 مراجعة الحروف الضعيفة بالأكاديمية',

      footerText: 'أكاديمية مابل كابتشا • مصممة للاعبين لتعلم الكتابة الكورية Dubeolsik واحتراف كاشف الكذب في مابل ستوري.'
    }
  };

  let currentLang = localStorage.getItem('maple_captcha_lang') || 'ar';

  function getLang() {
    return currentLang;
  }

  function setLang(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('maple_captcha_lang', lang);

    // Update document direction
    const isRTL = lang === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.body.classList.toggle('rtl-mode', isRTL);

    const sel = document.getElementById('select-language');
    if (sel && sel.value !== lang) sel.value = lang;

    // Apply translations
    applyTranslations();

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang, isRTL } }));
  }

  function t(key, vars = {}) {
    let str = translations[currentLang]?.[key] || translations['en']?.[key] || key;
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return str;
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const text = t(key);
      if (text) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = text;
        } else {
          el.innerHTML = text;
        }
      }
    });

    // Update select dropdown option texts
    document.querySelectorAll('[data-i18n-option]').forEach(opt => {
      const key = opt.dataset.i18nOption;
      opt.textContent = t(key);
    });

    // Update titles and aria-labels
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = t(el.dataset.i18nTitle);
    });
  }

  return {
    getLang,
    setLang,
    t,
    applyTranslations
  };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18n;
}
