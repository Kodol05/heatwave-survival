import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';

export default class NarrationScene extends Phaser.Scene {
  constructor() {
    super('NarrationScene');
  }

  init(data) {
    this.fromScene = data.from;
    this.lines = data.lines || [''];
    this.menu = data.menu || null;
    this.callback = data.callback || (() => {});
    this.lineIndex = 0;
    this.menuShown = false;
  }

  create() {
    const { width, height } = GAME_CONFIG;
    const boxH = this.menu ? 200 : 170;
    const boxY = height - boxH;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.3).setOrigin(0);

    this.add.rectangle(0, boxY, width, boxH, 0x000000, 0.88).setOrigin(0)
      .setStrokeStyle(2, 0xffe066);

    const cropW = 258, cropH = 290;
    const portraitH = 120;
    const portraitScale = portraitH / cropH;
    const portraitW = cropW * portraitScale;
    const portraitCenterX = width - portraitW / 2 - 16;
    const portraitTopY = boxY + 12;

    const portrait = this.add.image(portraitCenterX, portraitTopY, 'mother');
    portrait.setCrop(0, 0, cropW, cropH);
    portrait.setOrigin(0.5, 0);
    portrait.setScale(portraitScale);

    this.add.text(portraitCenterX, portraitTopY + portraitH + 4, '어머니', {
      fontSize: '13px', color: '#ffe066', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    const textPadX = 28;
    const textMaxW = width - portraitW - 70;
    this.text = this.add.text(textPadX, boxY + 18, '', {
      fontSize: '17px', color: '#fff', wordWrap: { width: textMaxW }, lineSpacing: 6,
    });

    this.hint = this.add.text(textPadX, boxY + boxH - 22, '', {
      fontSize: '12px', color: '#aaa',
    });

    this.showCurrentLine();

    this.input.on('pointerup', () => {
      if (!this.menuShown) this.advance();
    });
    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.menuShown) this.advance();
    });
    this.input.keyboard.on('keydown-ENTER', () => {
      if (!this.menuShown) this.advance();
    });
  }

  showCurrentLine() {
    this.text.setText(this.lines[this.lineIndex]);
    const isLast = this.lineIndex >= this.lines.length - 1;
    if (!isLast) {
      this.hint.setText('▸ 클릭 / Space 로 다음');
    } else if (this.menu) {
      this.hint.setText('');
      this.buildMenu();
    } else {
      this.hint.setText('▸ 클릭 / Space 로 닫기');
    }
  }

  buildMenu() {
    this.menuShown = true;
    const boxY = GAME_CONFIG.height - 200;
    const startY = boxY + 60;
    const itemH = 34;
    const gap = 6;

    this.menu.forEach((label, idx) => {
      const y = startY + idx * (itemH + gap);
      const btn = this.add.rectangle(28, y, 420, itemH, 0xffffff, 0.08).setOrigin(0)
        .setStrokeStyle(1, 0xffffff, 0.3)
        .setInteractive({ useHandCursor: true });
      const txt = this.add.text(44, y + itemH / 2, label, {
        fontSize: '15px', color: '#ffe066',
      }).setOrigin(0, 0.5);
      btn.on('pointerover', () => {
        btn.setFillStyle(0xffe066, 0.2);
        txt.setColor('#ffffff');
      });
      btn.on('pointerout', () => {
        btn.setFillStyle(0xffffff, 0.08);
        txt.setColor('#ffe066');
      });
      btn.on('pointerup', () => this.close(idx));
    });
  }

  advance() {
    if (this.lineIndex < this.lines.length - 1) {
      this.lineIndex++;
      this.showCurrentLine();
    } else if (!this.menu) {
      this.close(null);
    }
  }

  close(choiceIdx) {
    const cb = this.callback;
    this.scene.resume(this.fromScene);
    this.scene.stop();
    cb(choiceIdx);
  }
}
