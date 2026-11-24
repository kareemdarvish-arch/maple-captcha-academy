/**
 * Procedural MapleStory Lie Detector Captcha Generator
 * 100% Game-Identical Reproduction of KMS / MapleStory Lie Detector Captchas.
 * Features exact banner proportions, tall raw bitmap characters, localized scanline glitch dashes,
 * authentic color palettes, and heavy confetti noise matching reference screenshots.
 */

class MapleCaptchaGenerator {
  constructor(canvasId, options = {}) {
    this.canvas = typeof canvasId === 'string' ? document.getElementById(canvasId) : canvasId;
    this.ctx = this.canvas.getContext('2d');

    // Default configuration matching in-game proportions (4.5 : 1 aspect ratio)
    this.config = Object.assign({
      width: 520,
      height: 115,
      charCount: 6,
      tiltAngle: -4.5,           // Authentic slant angle from screenshots
      background: 'sky_rock',    // 'sky_rock', 'ellinia_portal', 'cloud_balcony', 'dark_dungeon', 'clean'
      noisePreset: 'normal',     // 'easy', 'normal', 'hard', 'insane'
      fontFamily: "'Gulim', 'Dotum', 'Galmuri11', 'NeoDunggeunmo', 'Malgun Gothic', monospace",
      fontSize: 72               // Characters fill ~85% of banner height
    }, options);

    // Exact color sampling from the user's reference screenshots
    this.retroColors = [
      '#cf467d', // Bright Pink / Magenta (Screenshot 1: "일", "동")
      '#2748c0', // Deep Royal Blue (Screenshot 1: "귀", "와", Screenshot 2: "살", "낄")
      '#cd4532', // Terracotta / Rust Red (Screenshot 1: "이", "듬", Screenshot 3: "소", "추")
      '#77436b', // Plum / Dark Violet (Screenshot 2: "빛", "엊", "얹")
      '#b822bb', // Vivid Magenta (Screenshot 5: "도", "아", "ㅋ")
      '#873b26', // Earthy Brown (Screenshot 5: "징", "지")
      '#273b4d'  // Slate Navy (Screenshot 3: "화")
    ];

    // Colored noise streaks cutting through the text (Screenshot 1-6)
    this.noiseLineColors = [
      '#3db054', // Vivid Green (most prominent in game)
      '#00bcd4', // Cyan
      '#e91e63', // Magenta
      '#1e88e5', // Royal Blue
      '#ff9800'  // Orange
    ];

    // Current state
    this.currentText = '';
    this.currentData = null;
    this.charPositions = [];

    // Magnifier state
    this.magnifierActive = false;
    this.mousePos = { x: 0, y: 0 };

    this.initCanvas();
    this.initMagnifierEvents();
  }

  initCanvas() {
    this.canvas.width = this.config.width;
    this.canvas.height = this.config.height;
    this.canvas.style.imageRendering = 'pixelated';
    this.ctx.imageSmoothingEnabled = false;
  }

  setConfig(newOptions) {
    this.config = Object.assign(this.config, newOptions);
    this.initCanvas();
  }

  generate(customText = null, category = 'balanced') {
    const text = customText || Hangul.generateCaptchaText({
      length: this.config.charCount,
      category: category,
      includeJamo: true
    });

    this.currentText = text;
    this.currentData = {
      text,
      timestamp: Date.now(),
      deconstructed: text.split('').map(c => Hangul.decompose(c))
    };

    this.render();
    return this.currentData;
  }

  render() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Layer 1: Game Environment Background (behind banner)
    this.drawBackground(ctx, width, height);

    // Layer 2: Transform canvas for tilted banner
    const bannerW = Math.floor(width * 0.94);
    const bannerH = 92;
    const centerX = width / 2;
    const centerY = height / 2;
    const rad = (this.config.tiltAngle * Math.PI) / 180;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rad);

    const bx = -bannerW / 2;
    const by = -bannerH / 2;

    // Layer 3: Paper Banner Surface
    this.drawBanner(ctx, bx, by, bannerW, bannerH);

    // Layer 4: Tall Korean Characters (raw pixel strokes)
    this.drawCharacters(ctx, bx, by, bannerW, bannerH);

    // Layer 5: Localized Scanline Glitch Dashes & Scratches (NO continuous ruled lines!)
    this.drawNoiseLines(ctx, bx, by, bannerW, bannerH);

    // Layer 6: Heavy Confetti Pixel Noise Dots
    this.drawNoiseDots(ctx, bx, by, bannerW, bannerH);

    ctx.restore(); // Restore banner rotation

    // Layer 7: Foreground scene props (Rocks, slimes, wizard hats overlaying bottom edge)
    this.drawForegroundProps(ctx, width, height);

    // Layer 8: Optional Magnifier Lens
    if (this.magnifierActive) {
      this.renderMagnifier(ctx);
    }

    ctx.restore();
  }

  drawBackground(ctx, w, h) {
    const bg = this.config.background;

    if (bg === 'clean') {
      ctx.fillStyle = '#161922';
      ctx.fillRect(0, 0, w, h);
      return;
    }

    if (bg === 'sky_rock') {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#1c3fa8');
      grad.addColorStop(1, '#274bcc');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(15, h);
        ctx.lineTo(w * (0.05 + i * 0.22), 0);
        ctx.lineTo(w * (0.12 + i * 0.22), 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    } else if (bg === 'ellinia_portal') {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#28479e');
      grad.addColorStop(0.6, '#3863b0');
      grad.addColorStop(1, '#244e2f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.strokeStyle = 'rgba(205, 185, 248, 0.4)';
      ctx.lineWidth = 2.5;
      for (let r = 15; r <= 65; r += 16) {
        ctx.beginPath();
        ctx.arc(130, 50, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    } else if (bg === 'cloud_balcony') {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#6d5483');
      grad.addColorStop(0.5, '#bfa7cf');
      grad.addColorStop(1, '#ddcbe5');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(60, h - 10, 40, 0, Math.PI * 2);
      ctx.arc(130, h - 5, 35, 0, Math.PI * 2);
      ctx.arc(w - 70, 15, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (bg === 'dark_dungeon') {
      ctx.fillStyle = '#1e3394';
      ctx.fillRect(0, 0, w, h);
    }
  }

  drawForegroundProps(ctx, w, h) {
    const bg = this.config.background;

    if (bg === 'sky_rock') {
      ctx.save();
      ctx.fillStyle = '#7a5a46';
      ctx.beginPath();
      ctx.moveTo(90, h);
      ctx.lineTo(105, h - 22);
      ctx.lineTo(145, h - 28);
      ctx.lineTo(195, h - 20);
      ctx.lineTo(235, h - 25);
      ctx.lineTo(250, h);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#9e7960';
      ctx.fillRect(115, h - 22, 28, 4);
      ctx.fillRect(170, h - 19, 24, 3);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(285, h - 6, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (bg === 'ellinia_portal') {
      ctx.save();
      const hats = [25, 125, 380];
      hats.forEach(hx => {
        ctx.fillStyle = '#738e73';
        ctx.beginPath();
        ctx.moveTo(hx, h);
        ctx.lineTo(hx + 18, h - 34);
        ctx.lineTo(hx + 36, h);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffd54f';
        ctx.fillRect(hx + 15, h - 18, 6, 6);
      });
      ctx.restore();
    } else if (bg === 'cloud_balcony') {
      ctx.save();
      ctx.fillStyle = '#654434';
      ctx.beginPath();
      ctx.moveTo(250, 0);
      ctx.lineTo(265, 18);
      ctx.lineTo(335, 15);
      ctx.lineTo(355, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (bg === 'dark_dungeon') {
      ctx.save();
      ctx.fillStyle = '#9c8172';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h - 35);
      ctx.lineTo(35, h - 24);
      ctx.lineTo(60, h);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  drawBanner(ctx, bx, by, bw, bh) {
    ctx.save();

    const paperGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
    paperGrad.addColorStop(0, '#d2d1e2');
    paperGrad.addColorStop(0.5, '#c9c9de');
    paperGrad.addColorStop(1, '#bebfd6');

    ctx.fillStyle = paperGrad;
    ctx.fillRect(bx, by, bw, bh);

    ctx.strokeStyle = '#9a9cb8';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(bx + 1, by + 1);
    ctx.lineTo(bx + bw - 1, by + 1);
    ctx.stroke();

    ctx.restore();
  }

  drawCharacters(ctx, bx, by, bw, bh) {
    const chars = this.currentText.split('');
    const count = chars.length;
    if (count === 0) return;

    this.charPositions = [];
    const usableW = bw - 16;
    const slotWidth = usableW / count;
    const startX = bx + 8;

    ctx.save();
    ctx.font = `bold ${this.config.fontSize}px ${this.config.fontFamily}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    chars.forEach((char, idx) => {
      const color = this.retroColors[idx % this.retroColors.length];

      const jitterX = Math.round((Math.random() - 0.5) * 3);
      const jitterY = Math.round((Math.random() - 0.5) * 3);
      const cx = Math.floor(startX + slotWidth * idx + slotWidth / 2 + jitterX);
      const cy = Math.floor(by + bh / 2 + jitterY);

      this.charPositions.push({
        char,
        index: idx,
        x: cx,
        y: cy,
        color
      });

      ctx.fillStyle = color;

      // Authentic thick solid bitmap weight
      ctx.fillText(char, cx, cy);
      ctx.fillText(char, cx + 1, cy);
      ctx.fillText(char, cx - 1, cy);
      ctx.fillText(char, cx, cy + 1);
      ctx.fillText(char, cx, cy - 1);
    });

    ctx.restore();
  }

  /**
   * Draw Authentic KMS Scanline Glitch Dashes & Pixel Scratches (NO continuous ruled lines!)
   */
  drawNoiseLines(ctx, bx, by, bw, bh) {
    const preset = this.config.noisePreset;
    let dashCount = 28;
    let streakCount = 6;
    if (preset === 'easy') { dashCount = 10; streakCount = 2; }
    else if (preset === 'normal') { dashCount = 28; streakCount = 6; }
    else if (preset === 'hard') { dashCount = 50; streakCount = 12; }
    else if (preset === 'insane') { dashCount = 80; streakCount = 20; }

    ctx.save();

    // 1. Localized horizontal scanline dashes (length 8px to 30px)
    for (let i = 0; i < dashCount; i++) {
      const color = this.noiseLineColors[i % this.noiseLineColors.length];
      ctx.fillStyle = color;

      const px = Math.floor(bx + 10 + Math.random() * (bw - 45));
      const py = Math.floor(by + 12 + Math.random() * (bh - 24));
      const len = Math.floor(8 + Math.random() * 22);

      // Draw 1px pixel dash
      ctx.fillRect(px, py, len, 1);

      // 35% chance for a 1px staggered continuation
      if (Math.random() < 0.35) {
        ctx.fillRect(px + len + 2, py + (Math.random() < 0.5 ? 1 : -1), Math.floor(5 + Math.random() * 10), 1);
      }
    }

    // 2. Medium scratch streaks (length 35px to 70px) with stepped pixel jitter
    for (let i = 0; i < streakCount; i++) {
      const color = this.noiseLineColors[(i + 2) % this.noiseLineColors.length];
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;

      let startX = Math.floor(bx + 15 + Math.random() * (bw - 90));
      let startY = Math.floor(by + 16 + Math.random() * (bh - 32));
      const totalLen = Math.floor(35 + Math.random() * 35);

      ctx.beginPath();
      ctx.moveTo(startX, startY);

      let currX = startX;
      let currY = startY;

      while (currX < startX + totalLen && currX < bx + bw - 10) {
        const seg = Math.floor(6 + Math.random() * 12);
        currX += seg;
        if (Math.random() < 0.4) {
          currY += (Math.random() < 0.5 ? 1 : -1);
        }
        ctx.lineTo(currX, currY);
      }

      ctx.stroke();
    }

    // 3. Diagonal 45-degree micro-scratches (3 to 5 px)
    for (let i = 0; i < 12; i++) {
      const color = this.noiseLineColors[i % this.noiseLineColors.length];
      ctx.fillStyle = color;
      const sx = Math.floor(bx + 15 + Math.random() * (bw - 30));
      const sy = Math.floor(by + 15 + Math.random() * (bh - 30));
      for (let d = 0; d < 4; d++) {
        ctx.fillRect(sx + d, sy + d, 1, 1);
      }
    }

    ctx.restore();
  }

  drawNoiseDots(ctx, bx, by, bw, bh) {
    const preset = this.config.noisePreset;
    let dotCount = 1800;
    if (preset === 'easy') dotCount = 400;
    else if (preset === 'normal') dotCount = 1800;
    else if (preset === 'hard') dotCount = 3000;
    else if (preset === 'insane') dotCount = 4500;

    const dotColors = [
      '#e53935', '#43a047', '#1e88e5', '#fdd835',
      '#d81b60', '#00bcd4', '#8e24aa', '#ffffff', '#37474f'
    ];

    ctx.save();

    for (let i = 0; i < dotCount; i++) {
      const px = Math.floor(bx + 2 + Math.random() * (bw - 4));
      const py = Math.floor(by + 2 + Math.random() * (bh - 4));
      const size = Math.random() < 0.12 ? 2 : 1;
      const color = dotColors[Math.floor(Math.random() * dotColors.length)];

      ctx.fillStyle = color;
      ctx.fillRect(px, py, size, size);
    }

    ctx.restore();
  }

  initMagnifierEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      this.mousePos = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };

      if (this.magnifierActive) {
        this.render();
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      if (this.magnifierActive) {
        this.render();
      }
    });
  }

  setMagnifierActive(active) {
    this.magnifierActive = !!active;
    this.render();
  }

  toggleMagnifier() {
    this.setMagnifierActive(!this.magnifierActive);
    return this.magnifierActive;
  }

  renderMagnifier(ctx) {
    const mx = this.mousePos.x;
    const my = this.mousePos.y;
    const lensRadius = 45;
    const zoom = 2.8;

    if (mx <= 0 || mx >= this.canvas.width || my <= 0 || my >= this.canvas.height) {
      return;
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(mx, my, lensRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.save();
    ctx.clip();

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      this.canvas,
      mx - lensRadius / zoom, my - lensRadius / zoom, (lensRadius * 2) / zoom, (lensRadius * 2) / zoom,
      mx - lensRadius, my - lensRadius, lensRadius * 2, lensRadius * 2
    );

    ctx.restore();

    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(mx, my, lensRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  exportPNG(filename = 'maplestory_captcha.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapleCaptchaGenerator;
}
