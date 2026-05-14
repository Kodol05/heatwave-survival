import Phaser from 'phaser';
import { makeAllPlaceholders } from '../utils/textures.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.spritesheet('player', '/assets/player_run.png', {
      frameWidth: 68, frameHeight: 68,
    });
    this.load.image('home-bg', '/assets/home_bg.jpg');
    this.load.image('title-bg', '/assets/title_bg.jpg');
    this.load.image('mother', '/assets/mother.png');
    this.load.audio('bgm', '/assets/bgm.mp3');
    this.load.audio('bgm-errand', '/assets/errand_bgm.mp3');
    makeAllPlaceholders(this);
  }

  create() {
    this.anims.create({
      key: 'player-run',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
      frameRate: 12,
      repeat: -1,
    });
    this.sound.volume = 0.15;
    this.scene.start('TitleScene');
  }
}
