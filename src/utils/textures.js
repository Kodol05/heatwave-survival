import { ITEMS } from '../config/items.js';
import { TERRAIN } from '../config/terrain.js';

const ASPHALT_VARIANTS = [
  {
    base: 0x2e2e2e, light: 0x404040, dark: 0x1c1c1c,
    highlight: 0x555555, darkPebble: 0x232323,
    lightCount: 60, darkCount: 30, highlightCount: 10, darkPebbleCount: 8,
    crack: 0x1a1a1a, crackCount: 3, crackLen: 10,
  },
  {
    base: 0x2a2a2a, light: 0x3c3c3c, dark: 0x1c1c1c,
    highlight: 0x4a4a4a, darkPebble: 0x202020,
    lightCount: 40, darkCount: 25, highlightCount: 8, darkPebbleCount: 10,
    crack: 0x0e0e0e, crackCount: 8, crackLen: 16,
  },
  {
    base: 0x3a3a3a, light: 0x4a4a4a, dark: 0x2a2a2a,
    highlight: 0x585858, darkPebble: 0x303030,
    lightCount: 80, darkCount: 15, highlightCount: 14, darkPebbleCount: 6,
    crack: 0x222222, crackCount: 1, crackLen: 6,
  },
  {
    base: 0x2a2a2a, light: 0x3a3a3a, dark: 0x1a1a1a,
    highlight: 0x505050, darkPebble: 0x222222,
    lightCount: 50, darkCount: 25, highlightCount: 10, darkPebbleCount: 8,
    crack: 0x161616, crackCount: 2, crackLen: 8,
    patches: 4, patchColor: 0x404040,
  },
];

export function makeRect(scene, key, w, h, color) {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  g.fillStyle(color, 1);
  g.fillRect(0, 0, w, h);
  g.lineStyle(2, 0x000000, 0.3);
  g.strokeRect(1, 1, w - 2, h - 2);
  g.generateTexture(key, w, h);
  g.destroy();
}

export function makeCircle(scene, key, radius, color) {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  g.fillStyle(color, 1);
  g.fillCircle(radius, radius, radius);
  g.lineStyle(2, 0x000000, 0.3);
  g.strokeCircle(radius, radius, radius - 1);
  g.generateTexture(key, radius * 2, radius * 2);
  g.destroy();
}

export function makeAllPlaceholders(scene) {
  makeRect(scene, 'computer', 48, 40, 0x444444);

  for (const key of Object.keys(ITEMS)) {
    makeCircle(scene, `item-${key}`, 16, ITEMS[key].color);
  }

  for (const key of Object.keys(TERRAIN)) {
    makeRect(scene, `terrain-${key}`, 80, 140, TERRAIN[key].color);
  }

  makeRect(scene, 'goal', 16, 280, 0x22cc55);

  if (!scene.textures.exists('item-bg')) {
    const size = 36;
    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.7);
    g.fillRect(0, 0, size, size);
    g.lineStyle(2, 0xffffff, 1);
    g.strokeRect(1, 1, size - 2, size - 2);
    g.generateTexture('item-bg', size, size);
    g.destroy();
  }

  ASPHALT_VARIANTS.forEach((cfg, i) => {
    const key = `asphalt-tile-${i}`;
    if (scene.textures.exists(key)) return;
    const size = 64;
    const g = scene.add.graphics();
    g.fillStyle(cfg.base, 1);
    g.fillRect(0, 0, size, size);
    g.fillStyle(cfg.light, 1);
    for (let j = 0; j < cfg.lightCount; j++) g.fillRect(Math.random() * size, Math.random() * size, 1, 1);
    g.fillStyle(cfg.dark, 1);
    for (let j = 0; j < cfg.darkCount; j++) g.fillRect(Math.random() * size, Math.random() * size, 1, 1);
    g.fillStyle(cfg.highlight, 1);
    for (let j = 0; j < cfg.highlightCount; j++) g.fillRect(Math.random() * size, Math.random() * size, 2, 2);
    g.fillStyle(cfg.darkPebble, 1);
    for (let j = 0; j < cfg.darkPebbleCount; j++) g.fillRect(Math.random() * size, Math.random() * size, 2, 2);
    if (cfg.patches) {
      g.fillStyle(cfg.patchColor, 1);
      for (let j = 0; j < cfg.patches; j++) {
        const pw = 8 + Math.random() * 8;
        const ph = 8 + Math.random() * 8;
        g.fillRect(Math.random() * (size - pw), Math.random() * (size - ph), pw, ph);
      }
    }
    g.fillStyle(cfg.crack, 1);
    for (let j = 0; j < cfg.crackCount; j++) {
      const cx = Math.random() * size;
      const cy = Math.random() * size;
      const len = 6 + Math.random() * (cfg.crackLen || 10);
      const angle = Math.random() * Math.PI;
      for (let t = 0; t < len; t++) {
        g.fillRect(cx + Math.cos(angle) * t, cy + Math.sin(angle) * t, 1, 1);
      }
    }
    g.generateTexture(key, size, size);
    g.destroy();
  });
  if (!scene.textures.exists('obstacle-cone')) {
    const w = 24, h = 30;
    const g = scene.add.graphics();
    g.fillStyle(0xff8800, 1);
    g.fillTriangle(w / 2, 2, 2, h - 6, w - 2, h - 6);
    g.fillStyle(0xffffff, 1);
    g.fillRect(4, h - 14, w - 8, 3);
    g.fillStyle(0x222222, 1);
    g.fillRect(0, h - 5, w, 5);
    g.generateTexture('obstacle-cone', w, h);
    g.destroy();
  }
  if (!scene.textures.exists('obstacle-manhole')) {
    const size = 40;
    const r = size / 2;
    const g = scene.add.graphics();
    g.fillStyle(0x888888, 1);
    g.fillCircle(r, r, r);
    g.fillStyle(0x333333, 1);
    g.fillCircle(r, r, r - 3);
    g.fillStyle(0x000000, 1);
    g.fillCircle(r, r, r - 7);
    g.generateTexture('obstacle-manhole', size, size);
    g.destroy();
  }
}
