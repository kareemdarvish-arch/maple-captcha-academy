/**
 * Procedural MapleStory Lie Detector Captcha Generator
 * High-legibility 2x Bitmap-Quantized KMS Reproduction of MapleStory Lie Detector Captchas.
 * Uses a 0.5x virtual glyph canvas upscaled 2x with alpha quantization for crisp stepped KMS pixel edges,
 * generous batchim (bottom consonant) spacing & clarity, balanced split noise, and authentic color clusters.
 */

class MapleCaptchaGenerator {
  constructor(canvasId, options = {}) {
    this.canvas = typeof canvasId === 'string' ? document.getElementById(canvasId) : canvasId;
    this.ctx = this.canvas.getContext('2d');

    // Default configuration matching KMS Lie Detector proportions (4 : 1 aspect ratio)
    this.config = Object.assign({
      width: 600,
      height: 150,
      charCount: 6,
      tiltAngle: -3.0,           // Authentic subtle slant matching KMS screenshots without edge clipping
      background: 'sky_rock',    // 'sky_rock', 'ellinia_portal', 'cloud_balcony', 'dark_dungeon', 'clean'
      noisePreset: 'hard',       // Default matching authentic KMS game noise (صعب - مطابق للعبة)
      fontFamily: "'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', 'Dotum', sans-serif",
      fontWeight: 700,
      alphaThreshold: 112        // Crisp KMS bitmap pixel edge threshold without blurred anti-aliasing
    }, options);

    // Exact color sampling from the user's KMS reference screenshots
    this.retroColors = [
      '#d6447e', // 0: Vivid Rose Pink (Screenshot: "인", "동")
      '#1c45bd', // 1: Royal Blue (Screenshot: "귀", "와", "비", "리", "살", "낄")
      '#cf3824', // 2: Coral Red (Screenshot: "이", "듬", "소", "수", "종")
      '#773570', // 3: Plum Violet (Screenshot: "빛", "없", "어")
      '#b520a3', // 4: Electric Magenta (Screenshot: "토", "아", "크")
      '#7a3622', // 5: Earthy Rust Brown (Screenshot: "절", "지", "데", "시")
      '#1a2638'  // 6: Slate Navy Charcoal (Screenshot: "회")
    ];

    // Colored noise streaks cutting through the banner (KMS Screenshots 1-6)
    this.noiseLineColors = [
      '#2eb85c', // Vivid Maple Green
      '#00acc1', // Vibrant Cyan
      '#d81b60', // Magenta Pink
      '#1e88e5', // Royal Blue
      '#8e24aa'  // Violet Purple
    ];

    // Non-white KMS confetti ink colors (never pure white so strokes/batchims aren't eaten out)
    this.noiseDotColors = [
      '#d32f2f', '#388e3c', '#1976d2', '#7b1fa2',
      '#0097a7', '#c2185b', '#455a64', '#e64a19'
    ];

    // Current state
    this.currentText = '';
    this.currentData = null;
    this.charPositions = [];

    // Reusable offscreen buffer for 2x crisp pixel quantization
    this.glyphCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    this.glyphCtx = this.glyphCanvas ? this.glyphCanvas.getContext('2d', { willReadFrequently: true }) : null;

    this.initCanvas();

    // Ensure Noto Sans KR bold weight loads cleanly and re-render immediately when ready
    if (typeof document !== 'undefined' && document.fonts) {
      Promise.all([
        document.fonts.ready,
        document.fonts.load(`${this.config.fontWeight} 36px "Noto Sans KR"`).catch(() => {})
      ]).then(() => {
        if (this.currentText) this.render();
      });
    }
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

  getNoiseParams() {
    const preset = this.config.noisePreset;
    if (preset === 'easy') {
      return {
        bgDots: 180, bgAlpha: 0.35, bgLines: 0, bgDashes: 6,
        fgDots: 90, fgDotsAlpha: 0.25,
        fgLines: 1, fgDashes: 4, fgLineAlpha: 0.35
      };
    }
    if (preset === 'normal') {
      return {
        bgDots: 520, bgAlpha: 0.48, bgLines: 2, bgDashes: 14,
        fgDots: 260, fgDotsAlpha: 0.44,
        fgLines: 4, fgDashes: 12, fgLineAlpha: 0.52
      };
    }
    if (preset === 'insane') {
      return {
        bgDots: 1400, bgAlpha: 0.65, bgLines: 4, bgDashes: 28,
        fgDots: 850, fgDotsAlpha: 0.66,
        fgLines: 9, fgDashes: 28, fgLineAlpha: 0.74
      };
    }
    // 'hard' (Default: Authentic KMS Game-Accurate / مطابق للعبة تماماً)
    return {
      bgDots: 950, bgAlpha: 0.54, bgLines: 3, bgDashes: 20,
      fgDots: 520, fgDotsAlpha: 0.56,
      fgLines: 6, fgDashes: 20, fgLineAlpha: 0.66
    };
  }

  render() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);

    // Layer 1: Game Environment Background (behind banner)
    this.drawBackground(ctx, width, height);

    // Layer 2: Transform canvas for tilted frosted paper banner (0.90 x 0.74 gives crisp frame on all corners)
    const bannerW = Math.floor(width * 0.90);
    const bannerH = Math.floor(height * 0.74);
    const centerX = width / 2;
    const centerY = height / 2;
    const rad = (this.config.tiltAngle * Math.PI) / 180;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rad);

    const bx = -bannerW / 2;
    const by = -bannerH / 2;
    const noise = this.getNoiseParams();

    // Layer 3: Paper Banner Surface
    this.drawBanner(ctx, bx, by, bannerW, bannerH);

    // Layer 4: Background Speckle & Dash Texture (behind characters so batchims stay legible)
    this.drawNoiseDots(ctx, bx, by, bannerW, bannerH, noise.bgDots, noise.bgAlpha);
    this.drawNoiseLines(ctx, bx, by, bannerW, bannerH, noise.bgLines, noise.bgDashes, noise.bgAlpha);

    // Layer 5: High-Clarity 2x Bitmap-Quantized Korean Characters (clear upper + large bottom batchim)
    this.drawCharacters(ctx, bx, by, bannerW, bannerH);

    // Layer 6: Foreground Authentic KMS Scanlines & Subtle Confetti Dots
    this.drawNoiseLines(ctx, bx, by, bannerW, bannerH, noise.fgLines, noise.fgDashes, noise.fgLineAlpha);
    this.drawNoiseDots(ctx, bx, by, bannerW, bannerH, noise.fgDots, noise.fgDotsAlpha);

    ctx.restore(); // Restore banner rotation
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

  drawBanner(ctx, bx, by, bw, bh) {
    ctx.save();

    // High-contrast frosted white-lavender KMS paper strip (keeps bottom batchim sharp over all scenes)
    const paperGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
    paperGrad.addColorStop(0, 'rgba(220, 226, 248, 0.90)');
    paperGrad.addColorStop(0.5, 'rgba(208, 216, 242, 0.88)');
    paperGrad.addColorStop(1, 'rgba(194, 204, 236, 0.86)');

    ctx.fillStyle = paperGrad;
    ctx.fillRect(bx, by, bw, bh);

    // Subtle crisp paper border
    ctx.strokeStyle = 'rgba(145, 155, 185, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.moveTo(bx + 1, by + 1);
    ctx.lineTo(bx + bw - 1, by + 1);
    ctx.stroke();

    ctx.restore();
  }

  getChosenColorPattern() {
    if (this.currentText === '도아점ㅋ공지' || this.currentText === '토아절크종지') {
      return [4, 4, 5, 4, 2, 5]; // Magenta, Magenta, Rust, Magenta, Red, Rust
    }
    if (this.currentText === '배송수데리회' || this.currentText === '비소수데리회') {
      return [1, 2, 2, 5, 1, 6]; // Blue, Red, Red, Rust, Blue, Slate Navy
    }
    if (this.currentText.startsWith('빛없어')) {
      return [3, 3, 3, 1, 1, 2]; // Plum, Plum, Plum, Blue, Blue, Red
    }
    if (this.currentText.includes('인귀')) {
      return [0, 1, 1, 2, 0, 2]; // Pink, Blue, Blue, Red, Pink, Red
    }
    const clusterPatterns = [
      [4, 4, 5, 4, 2, 5],
      [1, 2, 2, 5, 1, 6],
      [3, 3, 3, 1, 1, 2],
      [0, 1, 1, 2, 0, 2]
    ];
    return clusterPatterns[Math.floor(Math.random() * clusterPatterns.length)];
  }

  drawCharacters(ctx, bx, by, bw, bh) {
    const chars = this.currentText.split('');
    const count = chars.length;
    if (count === 0) return;

    this.charPositions = [];
    const chosenPattern = this.getChosenColorPattern();

    // Render onto 0.72x virtual glyph canvas, threshold alpha, then upscale ~1.39x for crisp KMS bitmap pixels
    // Gives 50% higher resolution inside batchim (bottom consonants) so stacked strokes stay crystal clear
    if (this.glyphCanvas && this.glyphCtx) {
      const scaleRatio = 0.72;
      const vw = Math.max(80, Math.floor(bw * scaleRatio));
      const vh = Math.max(30, Math.floor(bh * scaleRatio));
      this.glyphCanvas.width = vw;
      this.glyphCanvas.height = vh;

      const gctx = this.glyphCtx;
      gctx.clearRect(0, 0, vw, vh);

      const vFontSize = Math.round(vh * 0.65); // ~52px virtual => ~72px display glyph height
      gctx.font = `${this.config.fontWeight} ${vFontSize}px ${this.config.fontFamily}`;
      gctx.textBaseline = 'middle';
      gctx.textAlign = 'center';

      const padX = 14;
      const slotW = (vw - padX * 2) / count;
      const displayPadX = padX / scaleRatio;
      const displaySlotW = (bw - displayPadX * 2) / count;

      chars.forEach((char, idx) => {
        const colorIndex = chosenPattern[idx % chosenPattern.length];
        const color = this.retroColors[colorIndex % this.retroColors.length];

        const jitterX = (Math.random() - 0.5) * 2.0;
        const jitterY = (Math.random() - 0.5) * 2.2;
        const microRot = ((Math.random() - 0.5) * 4.2 * Math.PI) / 180;

        const vcx = padX + slotW * idx + slotW / 2 + jitterX;
        const vcy = vh / 2 + 1 + jitterY;

        this.charPositions.push({
          char,
          index: idx,
          x: Math.floor(bx + displayPadX + displaySlotW * idx + displaySlotW / 2),
          y: Math.floor(by + bh / 2),
          color
        });

        gctx.save();
        gctx.fillStyle = color;
        gctx.translate(vcx, vcy);
        gctx.rotate(microRot);
        // Balanced KMS proportion (0.95 horizontal keeps batchim open & legible, 1.06 tall)
        gctx.scale(0.95, 1.06);
        gctx.fillText(char, 0, 0);
        gctx.restore();
      });

      // Quantize alpha channel: crisp KMS bitmap edges with ZERO grey anti-alias blur
      const imgData = gctx.getImageData(0, 0, vw, vh);
      const data = imgData.data;
      const threshold = this.config.alphaThreshold;
      for (let i = 0; i < data.length; i += 4) {
        data[i + 3] = data[i + 3] >= threshold ? 255 : 0;
      }
      gctx.putImageData(imgData, 0, 0);

      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(this.glyphCanvas, bx, by, bw, bh);
      ctx.restore();
      return;
    }

    // Fallback direct draw (non-DOM environments)
    const usableW = bw - 24;
    const slotWidth = usableW / count;
    const startX = bx + 12;
    ctx.save();
    ctx.font = `${this.config.fontWeight} ${Math.round(bh * 0.65)}px ${this.config.fontFamily}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    chars.forEach((char, idx) => {
      const color = this.retroColors[chosenPattern[idx % chosenPattern.length] % this.retroColors.length];
      ctx.fillStyle = color;
      ctx.fillText(char, startX + slotWidth * idx + slotWidth / 2, by + bh / 2 + 1);
    });
    ctx.restore();
  }

  /**
   * Draw Organic Crisscrossing KMS Scratches & Localized Pixel Glitch Dashes
   * Avoids uniform horizontal bars across the bottom batchim row.
   */
  drawNoiseLines(ctx, bx, by, bw, bh, lineCount, dashCount, alpha = 0.66) {
    if (lineCount <= 0 && dashCount <= 0) return;

    ctx.save();
    ctx.globalAlpha = alpha;

    // 1. Slanted crisscrossing stepped pixel scratches
    for (let p = 0; p < lineCount; p++) {
      ctx.strokeStyle = this.noiseLineColors[p % this.noiseLineColors.length];
      ctx.lineWidth = 1.3;

      const x0 = bx + 10 + Math.random() * (bw * 0.62);
      const y0 = by + 12 + Math.random() * (bh - 24);
      const len = 75 + Math.random() * 165;
      const angle = ((Math.random() - 0.5) * 20 * Math.PI) / 180;
      const steps = 6;

      ctx.beginPath();
      ctx.moveTo(Math.round(x0), Math.round(y0));
      for (let s = 1; s <= steps; s++) {
        const cx = x0 + (len * s / steps) * Math.cos(angle);
        const cy = y0 + (len * s / steps) * Math.sin(angle) + (Math.random() - 0.5) * 3;
        ctx.lineTo(Math.min(bx + bw - 6, Math.round(cx)), Math.max(by + 4, Math.min(by + bh - 4, Math.round(cy))));
      }
      ctx.stroke();
    }

    // 2. Broken horizontal pixel glitch dashes
    for (let i = 0; i < dashCount; i++) {
      ctx.fillStyle = this.noiseLineColors[(i + 1) % this.noiseLineColors.length];
      const px = Math.floor(bx + 10 + Math.random() * (bw - 36));
      const py = Math.floor(by + 10 + Math.random() * (bh - 20));
      const len = Math.floor(8 + Math.random() * 18);
      ctx.fillRect(px, py, len, 1.4);
    }

    ctx.restore();
  }

  drawNoiseDots(ctx, bx, by, bw, bh, dotCount, alpha = 0.58) {
    if (dotCount <= 0) return;

    ctx.save();
    ctx.globalAlpha = alpha;

    for (let i = 0; i < dotCount; i++) {
      const px = Math.floor(bx + 2 + Math.random() * (bw - 4));
      const py = Math.floor(by + 2 + Math.random() * (bh - 4));
      ctx.fillStyle = this.noiseDotColors[i % this.noiseDotColors.length];
      ctx.fillRect(px, py, 2, 2);
    }

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
