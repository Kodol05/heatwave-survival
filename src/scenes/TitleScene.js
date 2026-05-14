import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    const { width, height } = GAME_CONFIG;

    if (!this.game.bgm) {
      this.game.bgm = this.sound.add('bgm', { loop: true, volume: 1 });
      this.game.bgm.play();
    }

    this.add.image(width / 2, height / 2, 'title-bg');
    this.add.rectangle(0, 0, width, height, 0x000000, 0.35).setOrigin(0);

    this.add.text(width / 2, 110, '☀  폭염 서바이벌  ☀', {
      fontSize: '52px', color: '#fff', fontStyle: 'bold',
      stroke: '#3a1a00', strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(width / 2, 160, '여름철 더위에서 살아남자!', {
      fontSize: '16px', color: '#ffe066',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.createMenuButton(width / 2, 260, '▶ 게임 시작', () => this.scene.start('HomeScene'));
    this.createMenuButton(width / 2, 325, '⚙ 설정', () => this.openSettings());
    this.createMenuButton(width / 2, 390, '🚪 종료', () => this.openQuit());

    this.add.text(width / 2, height - 24, 'Space / Enter 키로도 게임을 시작할 수 있어요', {
      fontSize: '13px', color: '#fff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    this.startKeySpace = this.input.keyboard.addKey('SPACE');
    this.startKeyEnter = this.input.keyboard.addKey('ENTER');
    this.startKeySpace.on('down', () => {
      if (!this.modalOpen) this.scene.start('HomeScene');
    });
    this.startKeyEnter.on('down', () => {
      if (!this.modalOpen) this.scene.start('HomeScene');
    });

    this.modalOpen = false;
  }

  createMenuButton(x, y, label, onClick) {
    const btn = this.add.rectangle(x, y, 260, 52, 0xffffff, 0.95)
      .setStrokeStyle(3, 0x3a1a00)
      .setInteractive({ useHandCursor: true });
    const txt = this.add.text(x, y, label, {
      fontSize: '22px', color: '#3a1a00', fontStyle: 'bold',
    }).setOrigin(0.5);
    btn.on('pointerover', () => {
      btn.setFillStyle(0xfff2cc, 0.95);
      btn.setScale(1.04);
      txt.setScale(1.04);
    });
    btn.on('pointerout', () => {
      btn.setFillStyle(0xffffff, 0.95);
      btn.setScale(1.0);
      txt.setScale(1.0);
    });
    btn.on('pointerup', () => {
      if (!this.modalOpen) onClick();
    });
    return { btn, txt };
  }

  openSettings() {
    if (this.modalOpen) return;
    this.modalOpen = true;
    const { width, height } = GAME_CONFIG;

    const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.65).setOrigin(0)
      .setDepth(100).setInteractive();

    const boxW = 520, boxH = 280;
    const boxX = (width - boxW) / 2;
    const boxY = (height - boxH) / 2;

    const box = this.add.rectangle(boxX, boxY, boxW, boxH, 0xfff8e7).setOrigin(0)
      .setStrokeStyle(3, 0x3a1a00).setDepth(101);

    const title = this.add.text(width / 2, boxY + 30, '⚙ 설정', {
      fontSize: '26px', color: '#3a1a00', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(102);

    const label = this.add.text(boxX + 30, boxY + 84, '🔊 음악 볼륨', {
      fontSize: '17px', color: '#3a1a00', fontStyle: 'bold',
    }).setDepth(102);

    const trackX = boxX + 40;
    const trackY = boxY + 144;
    const trackW = boxW - 80;
    const trackH = 10;

    const track = this.add.rectangle(trackX, trackY, trackW, trackH, 0xddd0b0).setOrigin(0)
      .setStrokeStyle(1, 0x3a1a00).setDepth(102);

    let currentVol = this.sound.volume;
    const fill = this.add.rectangle(trackX, trackY, trackW * currentVol, trackH, 0x4f7cff)
      .setOrigin(0).setDepth(103);

    const handleX = trackX + trackW * currentVol;
    const handle = this.add.circle(handleX, trackY + trackH / 2, 14, 0xffe066)
      .setStrokeStyle(2, 0x3a1a00)
      .setInteractive({ useHandCursor: true, draggable: true })
      .setDepth(104);

    const volText = this.add.text(width / 2, boxY + 178, `${Math.round(currentVol * 100)}%`, {
      fontSize: '20px', color: '#3a1a00', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(102);

    this.input.setDraggable(handle);
    handle.on('drag', (pointer, dragX) => {
      const newX = Phaser.Math.Clamp(dragX, trackX, trackX + trackW);
      handle.x = newX;
      const vol = (newX - trackX) / trackW;
      fill.width = trackW * vol;
      this.sound.volume = vol;
      volText.setText(`${Math.round(vol * 100)}%`);
    });

    const closeBtn = this.add.rectangle(width / 2, boxY + boxH - 40, 160, 40, 0x4f7cff)
      .setStrokeStyle(2, 0x3a1a00)
      .setInteractive({ useHandCursor: true }).setDepth(102);
    const closeTxt = this.add.text(width / 2, boxY + boxH - 40, '닫기', {
      fontSize: '17px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(103);
    closeBtn.on('pointerover', () => closeBtn.setFillStyle(0x6a92ff));
    closeBtn.on('pointerout', () => closeBtn.setFillStyle(0x4f7cff));

    const closeModal = () => {
      [bg, box, title, label, track, fill, handle, volText, closeBtn, closeTxt].forEach(o => o.destroy());
      this.modalOpen = false;
    };
    closeBtn.on('pointerup', closeModal);
  }

  openQuit() {
    if (this.modalOpen) return;
    this.modalOpen = true;
    const { width, height } = GAME_CONFIG;

    const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0)
      .setDepth(100).setInteractive();

    const farewellTitle = this.add.text(width / 2, height / 2 - 60, '잘 가렴, 또 만나자! 👋', {
      fontSize: '36px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(101);

    const subText = this.add.text(width / 2, height / 2 - 10, '창을 닫거나 다시 시작할 수 있어요.', {
      fontSize: '16px', color: '#ccc',
    }).setOrigin(0.5).setDepth(101);

    const restartBtn = this.add.rectangle(width / 2 - 110, height / 2 + 70, 200, 48, 0x4f7cff)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true }).setDepth(101);
    const restartTxt = this.add.text(width / 2 - 110, height / 2 + 70, '🔄 다시 시작', {
      fontSize: '17px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(102);
    restartBtn.on('pointerover', () => restartBtn.setFillStyle(0x6a92ff));
    restartBtn.on('pointerout', () => restartBtn.setFillStyle(0x4f7cff));
    restartBtn.on('pointerup', () => window.location.reload());

    const backBtn = this.add.rectangle(width / 2 + 110, height / 2 + 70, 200, 48, 0x555555)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true }).setDepth(101);
    const backTxt = this.add.text(width / 2 + 110, height / 2 + 70, '← 뒤로', {
      fontSize: '17px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(102);
    backBtn.on('pointerover', () => backBtn.setFillStyle(0x777777));
    backBtn.on('pointerout', () => backBtn.setFillStyle(0x555555));

    const closeModal = () => {
      [bg, farewellTitle, subText, restartBtn, restartTxt, backBtn, backTxt].forEach(o => o.destroy());
      this.modalOpen = false;
    };
    backBtn.on('pointerup', closeModal);
  }
}
