import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { showNarration } from '../config/narration.js';

export default class HomeScene extends Phaser.Scene {
  constructor() {
    super('HomeScene');
  }

  init(data) {
    this.lastResult = data || null;
  }

  create() {
    const { width, height } = GAME_CONFIG;

    this.add.image(width / 2, height / 2, 'home-bg');
    this.add.rectangle(0, 0, width, height, 0xffffff, 0.18).setOrigin(0);

    this.add.text(width / 2, 24, '🏠 우리 집', {
      fontSize: '24px', color: '#3a2a1a', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    this.mother = this.physics.add.staticSprite(220, 360, 'mother');
    this.mother.setScale(0.5);
    this.mother.setInteractive({ useHandCursor: true });

    this.hintText = this.add.text(width / 2, height - 40,
      '어머니를 클릭해서 대화하세요', {
        fontSize: '15px', color: '#fff', backgroundColor: '#0008', padding: { x: 8, y: 4 },
      }).setOrigin(0.5);

    this.promptText = this.add.text(0, 0, '', {
      fontSize: '16px', color: '#fff', backgroundColor: '#000a', padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setVisible(false);

    this.mother.on('pointerover', () => {
      this.mother.setTint(0xffffaa);
      this.promptText.setText('[클릭] 어머니와 대화')
        .setPosition(this.mother.x, this.mother.y - 130).setVisible(true);
    });
    this.mother.on('pointerout', () => {
      this.mother.clearTint();
      this.promptText.setVisible(false);
    });
    this.mother.on('pointerup', () => this.openMotherMenu());

    if (this.lastResult && this.lastResult.score !== undefined) {
      const msg = this.lastResult.cleared
        ? `이전 결과: 클리어! 점수 ${this.lastResult.score}`
        : `이전 결과: 실패... 점수 ${this.lastResult.score}`;
      const banner = this.add.text(width / 2, 70, msg, {
        fontSize: '18px', color: '#fff',
        backgroundColor: this.lastResult.cleared ? '#22aa55cc' : '#cc4444cc',
        padding: { x: 12, y: 6 },
      }).setOrigin(0.5);
      this.time.delayedCall(3500, () => banner.destroy());
    }

    showNarration(this, 'intro');
  }

  openMotherMenu() {
    showNarration(this, 'motherMenu', {
      onClose: (choice) => {
        if (choice === 0) this.scene.start('TimeSelectScene');
        else if (choice === 1) this.scene.start('FirstAidScene');
      },
    });
  }
}
