/**
 * Procedural MapleStory Lie Detector Captcha Generator
 * Generates pixel-accurate captchas on HTML5 Canvas with tilted banners,
 * multi-color retro Hangul characters, scratch lines, and confetti noise.
 */

class MapleCaptchaGenerator {
  constructor(canvasId, options = {}) {
    this.canvas = typeof canvasId === 'string' ? document.getElementById(canvasId) : canvasId;
    this.ctx = this.canvas.getContext('2d');

    // Default configuration
    this.config = Object.assign({
      width: 720,
      height: 210,
      charCount: 6,
      tiltAngle: -4.5,            // Degrees tilt of the banner
      background: 'sky_rock',     // 'sky_rock', 'cloud_balcony', 'ellinia_portal', 'dark_dungeon', 'clean'
      noisePreset: 'normal',      // 'easy', 'normal', 'hard', 'insane'
      fontFamily: "'Galmuri11', 'Galmuri9', 'NeoDunggeunmo', 'Malgun Gothic', 'Dotum', 'Gulim', monospace",
      fontSize: 54,
      enablePixelGrid: false
    }, options);

    // Authentic retro palette observed in MapleStory lie detector
    this.retroColors = [
      '#ba23ba', // Purple / Magenta (Screenshot 1 & 4)
      '#2645be', // Royal / Cobalt Blue (Screenshot 2, 3, 4)
      '#d73b28', // Brick / Crimson Red (Screenshot 1, 2, 4)
      '#8c3822', // Terracotta / Russet Brown (Screenshot 1, 2)
      '#273a4d', // Dark Navy / Slate (Screenshot 2, 3)
      '#8b227c', // Deep Plum Violet (Screenshot 3)
      '#1a768c'  // Deep Teal / Cyan
    ];

    // Noise line colors (green, magenta, cyan, blue, orange)
    this.noiseLineColors = [
      '#2ea843', '#bd247c', '#1e88e5', '#f57c00', '#00acc1', '#8e24aa'
    ];

    // Current captcha state
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
    this.ctx.imageSmoothingEnabled = false; // Nearest-neighbor pixelated rendering
  }

  /**
   * Set configuration options
   */
  setConfig(newOptions) {
    this.config = Object.assign(this.config, newOptions);
    this.initCanvas();
  }

  /**
   * Generate and render a new captcha
   */
  generate(customText = null, category = 'balanced') {
    // Generate text if not provided
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

  /**
   * Render the entire captcha onto canvas
   */
  render() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Layer 1: Draw Scene Background
    this.drawBackground(ctx, width, height);

    // Layer 2: Transform canvas for tilted banner
    const bannerW = Math.min(width - 50, 630);
    const bannerH = 136;
    const centerX = width / 2;
    const centerY = height / 2;
    const rad = (this.config.tiltAngle * Math.PI) / 180;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rad);

    // Layer 3: Draw Paper Banner Surface & Border
    this.drawBanner(ctx, -bannerW / 2, -bannerH / 2, bannerW, bannerH);

    // Layer 4: Render Hangul Characters
    this.drawCharacters(ctx, -bannerW / 2, -bannerH / 2, bannerW, bannerH);

    // Layer 5: Scratch lines across the banner
    this.drawNoiseLines(ctx, -bannerW / 2, -bannerH / 2, bannerW, bannerH);

    // Layer 6: Confetti / Salt-and-pepper noise dots
    this.drawNoiseDots(ctx, -bannerW / 2, -bannerH / 2, bannerW, bannerH);

    ctx.restore(); // Restore banner rotation

    // Layer 7: Foreground scene props (e.g. rock crag overlay in Screenshot 3 & 4)
    this.drawForegroundProps(ctx, width, height);

    // Layer 8: Optional Magnifier
    if (this.magnifierActive) {
      this.renderMagnifier(ctx);
    }

    ctx.restore();
  }

  /**
   * Draw the environment scenery behind the banner
   */
  drawBackground(ctx, w, h) {
    const bg = this.config.background;

    if (bg === 'clean') {
      ctx.fillStyle = '#161922';
      ctx.fillRect(0, 0, w, h);
      return;
    }

    if (bg === 'sky_rock') {
      // Cobalt sky gradient with sunlight rays (Screenshot 4)
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#1c3fa8');
      grad.addColorStop(1, '#2550cb');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Sun rays at bottom-left
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(30, h);
        ctx.lineTo(w * (0.1 + i * 0.18), 0);
        ctx.lineTo(w * (0.15 + i * 0.18), 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Distant pixel clouds
      this.drawPixelCloud(ctx, 40, 20, 140, 30);
      this.drawPixelCloud(ctx, w - 180, 15, 120, 25);
    } else if (bg === 'cloud_balcony') {
      // Lavender sunset clouds (Screenshot 1)
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#75638c');
      grad.addColorStop(0.5, '#c5b4d4');
      grad.addColorStop(1, '#e3d2ea');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Fluffy clouds
      this.drawFluffyCloud(ctx, 0, 0, w, 60);
      this.drawFluffyCloud(ctx, 0, h - 50, w, 50);
    } else if (bg === 'ellinia_portal') {
      // Deep sky with magic portal rings & slimes (Screenshot 2)
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#2b4b9b');
      grad.addColorStop(0.6, '#4972b5');
      grad.addColorStop(1, '#2f5b3a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Magic concentric portal circles on left
      ctx.save();
      ctx.strokeStyle = 'rgba(195, 170, 245, 0.35)';
      ctx.lineWidth = 3;
      for (let r = 20; r <= 80; r += 20) {
        ctx.beginPath();
        ctx.arc(180, 80, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    } else if (bg === 'dark_dungeon') {
      // Screenshot 3 style solid deep indigo blue
      ctx.fillStyle = '#1f3496';
      ctx.fillRect(0, 0, w, h);
    }
  }

  drawPixelCloud(ctx, x, y, cw, ch) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(x + 10, y, cw - 20, ch);
    ctx.fillRect(x, y + 6, cw, ch - 12);
    ctx.restore();
  }

  drawFluffyCloud(ctx, x, y, cw, ch) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x + cw * 0.3, y + ch * 0.5, cw * 0.3, ch * 0.6, 0, 0, Math.PI * 2);
    ctx.ellipse(x + cw * 0.7, y + ch * 0.5, cw * 0.35, ch * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draw the rock crags and trees in foreground
   */
  drawForegroundProps(ctx, w, h) {
    const bg = this.config.background;

    if (bg === 'sky_rock') {
      // Brown crag at bottom center / left
      ctx.save();
      ctx.fillStyle = '#7a5a46';
      ctx.beginPath();
      ctx.moveTo(110, h);
      ctx.lineTo(130, h - 35);
      ctx.lineTo(190, h - 42);
      ctx.lineTo(250, h - 32);
      ctx.lineTo(290, h - 40);
      ctx.lineTo(310, h);
      ctx.closePath();
      ctx.fill();

      // Rock highlights
      ctx.fillStyle = '#9e7960';
      ctx.fillRect(140, h - 34, 40, 6);
      ctx.fillRect(230, h - 30, 30, 5);

      // White snail / mushroom puff at bottom
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(360, h - 10, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (bg === 'cloud_balcony') {
      // Brown cliff crags at top
      ctx.save();
      ctx.fillStyle = '#6d4b3b';
      ctx.beginPath();
      ctx.moveTo(330, 0);
      ctx.lineTo(350, 28);
      ctx.lineTo(440, 24);
      ctx.lineTo(470, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (bg === 'ellinia_portal') {
      // Magician hats / green characters at bottom (Screenshot 2)
      ctx.save();
      const hatPositions = [30, 160, 480];
      hatPositions.forEach(hx => {
        // Green pointy hat
        ctx.fillStyle = '#789478';
        ctx.beginPath();
        ctx.moveTo(hx, h);
        ctx.lineTo(hx + 25, h - 45);
        ctx.lineTo(hx + 50, h);
        ctx.closePath();
        ctx.fill();

        // Yellow star insignia
        ctx.fillStyle = '#ffd54f';
        ctx.fillRect(hx + 22, h - 25, 7, 7);
      });
      ctx.restore();
    } else if (bg === 'dark_dungeon') {
      // Rock crag at bottom left
      ctx.save();
      ctx.fillStyle = '#9c8172';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h - 50);
      ctx.lineTo(45, h - 35);
      ctx.lineTo(75, h);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Draw the tilted paper banner
   */
  drawBanner(ctx, bx, by, bw, bh) {
    // Subtle paper drop shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(bx + 4, by + 4, bw, bh);

    // Paper banner gradient (Lavender-gray paper)
    const paperGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
    paperGrad.addColorStop(0, '#d8d7e8');
    paperGrad.addColorStop(0.5, '#cecfe4');
    paperGrad.addColorStop(1, '#c2c4dd');

    ctx.fillStyle = paperGrad;
    ctx.fillRect(bx, by, bw, bh);

    // Subtle paper edge border
    ctx.strokeStyle = '#9ca0bb';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, bw, bh);

    // Inner paper grain / fold line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.moveTo(bx + 2, by + 2);
    ctx.lineTo(bx + bw - 2, by + 2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw the 6 Hangul characters
   */
  drawCharacters(ctx, bx, by, bw, bh) {
    const chars = this.currentText.split('');
    const count = chars.length;
    if (count === 0) return;

    this.charPositions = [];
    const usableWidth = bw - 40;
    const slotWidth = usableWidth / count;

    ctx.save();
    ctx.font = `bold ${this.config.fontSize}px ${this.config.fontFamily}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    chars.forEach((char, idx) => {
      // Pick color: randomized from retro palette with variety
      const color = this.retroColors[idx % this.retroColors.length];

      // Character center coordinates with subtle authentic jitter
      const jitterX = (Math.random() - 0.5) * 4;
      const jitterY = (Math.random() - 0.5) * 6;
      const cx = bx + 20 + slotWidth * idx + slotWidth / 2 + jitterX;
      const cy = by + bh / 2 + jitterY;

      // Save bounding box for magnifier and hints
      this.charPositions.push({
        char,
        index: idx,
        x: cx,
        y: cy,
        color
      });

      // Render character with solid 2px bitmap weight
      ctx.fillStyle = color;

      // Draw with 1px pixel offset to simulate thick 2-3px bitmap strokes (as seen in screenshots)
      ctx.fillText(char, cx, cy);
      ctx.fillText(char, cx + 1, cy);
      ctx.fillText(char, cx, cy + 1);
      ctx.fillText(char, cx + 1, cy + 1);
    });

    ctx.restore();
  }

  /**
   * Draw scratch lines across the text
   */
  drawNoiseLines(ctx, bx, by, bw, bh) {
    const preset = this.config.noisePreset;
    let lineCount = 4;
    if (preset === 'easy') lineCount = 1;
    else if (preset === 'normal') lineCount = 4;
    else if (preset === 'hard') lineCount = 7;
    else if (preset === 'insane') lineCount = 11;

    ctx.save();

    for (let i = 0; i < lineCount; i++) {
      const color = this.noiseLineColors[i % this.noiseLineColors.length];
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.random() < 0.3 ? 2 : 1;

      // Horizontal line running through the banner with slight stepped jitter
      const startY = by + 20 + (bh - 40) * (i / (lineCount - 1 || 1)) + (Math.random() - 0.5) * 16;
      let currX = bx + 5;
      let currY = startY;

      ctx.beginPath();
      ctx.moveTo(currX, currY);

      while (currX < bx + bw - 5) {
        const segLen = 15 + Math.random() * 35;
        currX += segLen;
        currY += (Math.random() - 0.5) * 3;
        ctx.lineTo(currX, currY);
      }

      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Draw confetti / salt-and-pepper dots
   */
  drawNoiseDots(ctx, bx, by, bw, bh) {
    const preset = this.config.noisePreset;
    let dotCount = 800;
    if (preset === 'easy') dotCount = 150;
    else if (preset === 'normal') dotCount = 850;
    else if (preset === 'hard') dotCount = 1500;
    else if (preset === 'insane') dotCount = 2400;

    const dotColors = [
      '#e53935', // red
      '#43a047', // green
      '#1e88e5', // blue
      '#fdd835', // yellow
      '#d81b60', // pink
      '#00acc1', // cyan
      '#8e24aa', // purple
      '#ffffff', // white
      '#37474f'  // dark slate
    ];

    ctx.save();

    for (let i = 0; i < dotCount; i++) {
      const px = bx + 4 + Math.random() * (bw - 8);
      const py = by + 4 + Math.random() * (bh - 8);
      const size = Math.random() < 0.15 ? 2 : 1;
      const color = dotColors[Math.floor(Math.random() * dotColors.length)];

      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(px), Math.floor(py), size, size);
    }

    ctx.restore();
  }

  /**
   * Magnifier Lens Events
   */
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

  /**
   * Render the 3x Magnifier Lens over the canvas
   */
  renderMagnifier(ctx) {
    const mx = this.mousePos.x;
    const my = this.mousePos.y;
    const lensRadius = 60;
    const zoom = 3;

    if (mx <= 0 || mx >= this.canvas.width || my <= 0 || my >= this.canvas.height) {
      return;
    }

    ctx.save();

    // Create circular clip path
    ctx.beginPath();
    ctx.arc(mx, my, lensRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.save();
    ctx.clip();

    // Draw zoomed canvas content
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      this.canvas,
      mx - lensRadius / zoom, my - lensRadius / zoom, (lensRadius * 2) / zoom, (lensRadius * 2) / zoom,
      mx - lensRadius, my - lensRadius, lensRadius * 2, lensRadius * 2
    );

    // Optional pixel grid overlay in lens
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    for (let x = mx - lensRadius; x <= mx + lensRadius; x += zoom * 2) {
      ctx.beginPath();
      ctx.moveTo(x, my - lensRadius);
      ctx.lineTo(x, my + lensRadius);
      ctx.stroke();
    }

    ctx.restore();

    // Lens golden/steel bezel
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(mx, my, lensRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Center crosshair
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mx - 8, my);
    ctx.lineTo(mx + 8, my);
    ctx.moveTo(mx, my - 8);
    ctx.lineTo(mx, my + 8);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Export the current canvas as a downloadable PNG image
   */
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
