import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  init(data) {
    this.from = data?.from || 'HomeScene';
    this.errandData = data?.errandData || null;
  }

  create() {
    const { width, height } = GAME_CONFIG;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0);

    const panelW = 320, panelH = 300;
    this.add.rectangle(width / 2, height / 2, panelW, panelH, 0xffffff)
      .setStrokeStyle(3, 0x444444);

    this.add.text(width / 2, height / 2 - 110, '⏸ 일시정지', {
      fontSize: '28px', color: '#222', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.makeButton(width / 2, height / 2 - 40, 220, 48, '계속하기', () => this.resumeGame());
    this.makeButton(width / 2, height / 2 + 20, 220, 48, '다시하기', () => this.restartGame());
    this.makeButton(width / 2, height / 2 + 80, 220, 48, '집으로', () => this.goHome());

    this.input.keyboard.once('keydown-ESC', () => this.resumeGame());
  }

  makeButton(x, y, w, h, label, onClick) {
    const bg = this.add.rectangle(x, y, w, h, 0x4f7cff)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, {
      fontSize: '18px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);
    bg.on('pointerover', () => bg.setFillStyle(0x6a92ff));
    bg.on('pointerout', () => bg.setFillStyle(0x4f7cff));
    bg.on('pointerup', onClick);
  }

  resumeGame() {
    this.scene.resume(this.from);
    this.scene.stop();
  }

  restartGame() {
    this.scene.stop(this.from);
    if (this.from === 'ErrandScene' && this.errandData) {
      this.scene.start('ErrandScene', this.errandData);
    } else {
      this.scene.start(this.from);
    }
  }

  goHome() {
    this.scene.stop(this.from);
    this.scene.start('HomeScene');
  }
}
