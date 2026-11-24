# 🍁 MapleCaptcha Academy (메이플 거짓말탐지기 트레이너)

A comprehensive training simulator and learning academy designed to help players master **MapleStory Korean Lie Detector captchas**, learn the **Hangul Korean alphabet**, and build lightning-fast typing muscle memory on the **Dubeolsik (2-Set) Korean keyboard**.

---

## 🚀 Quick Start

You can run this web application in any modern web browser:

1. **Direct Double-Click**:
   - Double-click `index.html` to open it in Chrome, Edge, Firefox, or any browser.
2. **Local Web Server**:
   - Open PowerShell or Terminal in this folder:
     ```bash
     python -m http.server 8080
     ```
   - Open your browser to: `http://localhost:8080`

---

## ✨ Features & Capabilities

### 1. 🎯 Authentic Procedural Lie Detector Generator
- **Pixel-Accurate Visual Recreation**:
  - Tilted banner with configurable slant angle (-12° to +12°).
  - Authentic retro Korean bitmap font rendering.
  - Multi-colored characters matching KMS in-game colors (Purple/Magenta, Royal Blue, Crimson Red, Terracotta Brown, Dark Navy Slate).
  - Dense multicolored confetti dots (salt & pepper noise).
  - Colored horizontal scratch lines cutting across character strokes.
  - Authentic game backgrounds:
    - *Sky & Rock* (Cobalt blue sky, sun rays, cliff)
    - *Cloud Balcony* (Fluffy pink/lavender sunset clouds, rocky ledge)
    - *Ellinia Portal* (Magical teleport rings, magician slimes)
    - *Dark Dungeon* (Moody deep blue)
    - *Clean Dark* (Distraction-free high contrast focus mode)
- **Interactive 3x Magnifier Lens**:
  - Click **🔍 Lens** and hover over the canvas to zoom in 3x on obscured character strokes.

### 2. ⌨️ Interactive 2-Set (두벌식) Korean Keyboard
- **No Korean Windows IME Required**:
  - English QWERTY keys are automatically converted to Korean syllables via a built-in Hangul Automaton engine (e.g. typing `r` + `k` + `s` produces `간`, and typing `k` splits batchim to form `가나`).
  - Native Korean IME input and pasting are also supported.
- **Hand Division Visual Guidance**:
  - **Left Hand** = Consonants (자음) with cool blue styling.
  - **Right Hand** = Vowels (모음) with warm orange styling.
- **Dynamic Shift Handling**:
  - Real-time highlight for double letters: `ㄲ (Shift+R)`, `ㄸ (Shift+E)`, `ㅃ (Shift+Q)`, `ㅆ (Shift+T)`, `ㅉ (Shift+W)`, `ㅒ (Shift+O)`, `ㅖ (Shift+P)`.
- **Physical Keyboard Sync**:
  - Keys physically pressed on your keyboard glow and animate in real-time.

### 3. 📚 Hangul Academy & Syllable Deconstructor
- **Hangul 101 Crash Course**:
  - Explains the block construction of Korean syllables: Initial Consonant (초성) + Medial Vowel (중성) + Optional Batchim (종성).
- **Interactive Syllable Deconstructor**:
  - Type any Korean character (e.g. `빛`, `닭`, `젋`, `엊`, `화`) to inspect its 3 parts, phonetic sound, and exact QWERTY keystrokes in sequence.
- **Complete Alphabet Reference**:
  - Filterable directory covering every letter: 19 Initial Consonants, 21 Vowels, Compound Vowels (`ㅘ, ㅙ, ㅚ, ㅝ, ㅞ, ㅟ, ㅢ`), and 11 Double Batchims (`ㄳ, ㄵ, ㄶ, ㄺ, ㄻ, ㄼ, ㄽ, ㄾ, ㄿ, ㅀ, ㅄ`).
  - Clicking any letter card highlights its key on the virtual keyboard!

### 4. 👁️ "Lookalike Traps" Visual Spotter Guide
A gamer-focused guide breaking down the subtle geometric differences of characters that look identical under heavy noise:
- `ㅓ` vs `ㅏ` (Inward spur pointing left vs outward spur pointing right)
- `ㅗ` vs `ㅜ` (Stem sticking up above bar vs hanging down below bar)
- `ㅐ` vs `ㅔ` (Outer notch vs inner notch)
- `ㅈ` vs `ㅊ` (Flat top bar vs top dot/hat on ㅊ)
- `ㅁ` vs `ㅂ` (Closed box vs upright open horns on ㅂ)
- `ㄷ` vs `ㅌ` vs `ㄹ` (2 horizontal bars vs 3 bars vs S-spiral)
- `ㅇ` vs `ㅎ` (Circle vs circle with hat)

### 5. ⚡ Speed Letter Drills
- Rapid recognition training with noisy mini-cards to build instinctual reaction time and muscle memory.
- Streak and score tracking.

### 6. 🎮 Game Modes & In-Game Simulation
- **Endless Practice (무한 연습)**:
  - No time limit, real-time green/red character match feedback, instant **💡 Hint** drawer.
- **Timed Exam (실전 시험)**:
  - 30-second ticking countdown with urgent red warning under 5 seconds.
  - Strike tracker (✕ ✕ ✕).
  - 3 strikes triggers the **Truth Room (진실의 방)** penalty popup screen!
- **Speedrun (10-Streak Race)**:
  - Race through 10 captchas with total time and accuracy scoring.

### 7. 🎨 Custom Sandbox & Image Exporter
- Type any custom Korean words (e.g. character names, guild names, or tricky combinations).
- Tweak tilt angle, noise intensity, and background scene.
- One-click **💾 Export Image as PNG** to share test images with guildmates.

---

## 📁 File Structure

```
d:\capcha test\
├── index.html           # Main application webpage
├── css/
│   └── style.css        # Retro MMORPG styling & responsive layout
├── js/
│   ├── hangul.js        # Hangul unicode engine, decomposition & Dubeolsik automaton
│   ├── generator.js     # Procedural canvas captcha generator & magnifier lens
│   ├── keyboard.js      # Interactive 2-Set virtual keyboard & physical key sync
│   ├── learning.js      # Academy reference, lookalike traps, and speed drills
│   ├── game.js          # Practice, timed test, speedrun, stats & truth room modal
│   ├── audio.js         # Zero-dependency Web Audio synthesized 8-bit sound effects
│   └── app.js           # UI initialization, tab routing, and event handling
└── README.md            # Documentation and user guide
```
