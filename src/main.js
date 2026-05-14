import Phaser from 'phaser';
import { GAME_CONFIG } from './config/gameConfig.js';

import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import HomeScene from './scenes/HomeScene.js';
import TimeSelectScene from './scenes/TimeSelectScene.js';
import ErrandScene from './scenes/ErrandScene.js';
import FirstAidScene from './scenes/FirstAidScene.js';
import ResultScene from './scenes/ResultScene.js';
import PauseScene from './scenes/PauseScene.js';
import NarrationScene from './scenes/NarrationScene.js';

const TEXT_RESOLUTION = Math.min(Math.max(window.devicePixelRatio || 1, 2), 3);
const origTextFactory = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function (x, y, text, style) {
  const merged = { resolution: TEXT_RESOLUTION, ...(style || {}) };
  if (merged.padding == null) merged.padding = { x: 0, y: 3 };
  return origTextFactory.call(this, x, y, text, merged);
};

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
  },
  backgroundColor: '#87ceeb',
  pixelArt: false,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    TitleScene,
    HomeScene,
    TimeSelectScene,
    ErrandScene,
    FirstAidScene,
    ResultScene,
    PauseScene,
    NarrationScene,
  ],
};

new Phaser.Game(config);
