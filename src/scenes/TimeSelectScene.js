import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { TEMPERATURE_TABLE, TIME_HOURS } from '../config/temperature.js';
import { showNarration } from '../config/narration.js';

const DIFFICULTY_COLORS = {
  '매우 쉬움': '#7ec8e3',
  '쉬움':     '#ffe066',
  '보통':     '#ffa94d',
  '어려움':   '#ff6b6b',
};

export default class TimeSelectScene extends Phaser.Scene {
  constructor() {
    super('TimeSelectScene');
  }

  create() {
    const { width, height } = GAME_CONFIG;
    this.add.rectangle(0, 0, width, height, 0x2a3a5a).setOrigin(0);

    this.add.text(width / 2, 18, '🕐 언제 출발할까?', {
      fontSize: '26px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    this.drawMotherBubble();

    const cx = width / 2;
    const cy = 310;
    const radius = 175;
    const buttonR = 28;

    this.add.circle(cx, cy, radius + 24, 0xffffff, 0).setStrokeStyle(2, 0x4d5d7d);
    this.add.circle(cx, cy, radius - 36, 0xffffff, 0).setStrokeStyle(1, 0x3a4a6a);

    this.centerHour = this.add.text(cx, cy - 32, '', {
      fontSize: '30px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.centerDiff = this.add.text(cx, cy + 2, '', {
      fontSize: '18px', color: '#ffe066', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.centerDesc = this.add.text(cx, cy + 30, '', {
      fontSize: '12px', color: '#cde', align: 'center',
      wordWrap: { width: (radius - 36) * 2 - 20 },
    }).setOrigin(0.5);
    this.centerHint = this.add.text(cx, cy + 70, '', {
      fontSize: '11px', color: '#88a',
    }).setOrigin(0.5);

    this.showDefaultInfo();

    const hours = TIME_HOURS;
    const N = hours.length;

    hours.forEach((hour, i) => {
      const angleDeg = -90 + (i / N) * 360;
      const angleRad = angleDeg * Math.PI / 180;
      const x = cx + radius * Math.cos(angleRad);
      const y = cy + radius * Math.sin(angleRad);

      const info = TEMPERATURE_TABLE[hour];
      const fillColor = Phaser.Display.Color.HexStringToColor(info.color).color;

      const btn = this.add.circle(x, y, buttonR, fillColor, 1)
        .setStrokeStyle(2, 0xffffff)
        .setInteractive({ useHandCursor: true });

      const label = this.add.text(x, y, `${hour}시`, {
        fontSize: '14px', color: '#222', fontStyle: 'bold',
      }).setOrigin(0.5);

      btn.on('pointerover', () => {
        btn.setStrokeStyle(4, 0xffe066);
        btn.setScale(1.12);
        label.setScale(1.12);
        this.showHourInfo(hour);
      });
      btn.on('pointerout', () => {
        btn.setStrokeStyle(2, 0xffffff);
        btn.setScale(1.0);
        label.setScale(1.0);
        this.showDefaultInfo();
      });
      btn.on('pointerup', () => {
        const startErrand = () => this.scene.start('ErrandScene', { hour, temperature: info.temp });
        if (hour === 14 || hour === 15) {
          showNarration(this, 'hotHourWarning', { onClose: startErrand });
        } else {
          startErrand();
        }
      });
    });

    const backBg = this.add.rectangle(60, height - 26, 100, 30, 0x000000, 0.7)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });
    this.add.text(60, height - 26, '← 집으로', {
      fontSize: '13px', color: '#fff',
    }).setOrigin(0.5);
    backBg.on('pointerover', () => backBg.setFillStyle(0x3a4a6a, 0.9));
    backBg.on('pointerout', () => backBg.setFillStyle(0x000000, 0.7));
    backBg.on('pointerup', () => this.scene.start('HomeScene'));

    showNarration(this, 'timeSelectIntro');
  }

  showHourInfo(hour) {
    const info = TEMPERATURE_TABLE[hour];
    this.centerHour.setText(`${hour}시 · ${info.temp}°C`);
    this.centerDiff.setText(info.difficulty);
    this.centerDiff.setColor(DIFFICULTY_COLORS[info.difficulty] || '#ffe066');
    this.centerDesc.setText(info.desc);
    this.centerHint.setText('▶ 클릭해서 출발하기');
  }

  showDefaultInfo() {
    this.centerHour.setText('시간 선택');
    this.centerDiff.setText('');
    this.centerDesc.setText('시계의 시간 위에 마우스를 올려보세요');
    this.centerHint.setText('');
  }

  drawMotherBubble() {
    const bubbleX = 20;
    const bubbleY = 82;
    const bubbleW = 250;
    const bubbleH = 118;
    const r = 14;
    const tailLeftX  = bubbleX + bubbleW - 42;
    const tailRightX = bubbleX + bubbleW - 22;
    const tailTipX   = bubbleX + bubbleW - 12;
    const tailTipY   = bubbleY + bubbleH + 22;

    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.96);
    g.lineStyle(3, 0xff66aa, 1);
    g.beginPath();
    g.moveTo(bubbleX + r, bubbleY);
    g.lineTo(bubbleX + bubbleW - r, bubbleY);
    g.arc(bubbleX + bubbleW - r, bubbleY + r, r, -Math.PI / 2, 0, false);
    g.lineTo(bubbleX + bubbleW, bubbleY + bubbleH - r);
    g.arc(bubbleX + bubbleW - r, bubbleY + bubbleH - r, r, 0, Math.PI / 2, false);
    g.lineTo(tailRightX, bubbleY + bubbleH);
    g.lineTo(tailTipX, tailTipY);
    g.lineTo(tailLeftX, bubbleY + bubbleH);
    g.lineTo(bubbleX + r, bubbleY + bubbleH);
    g.arc(bubbleX + r, bubbleY + bubbleH - r, r, Math.PI / 2, Math.PI, false);
    g.lineTo(bubbleX, bubbleY + r);
    g.arc(bubbleX + r, bubbleY + r, r, Math.PI, Math.PI * 1.5, false);
    g.closePath();
    g.fillPath();
    g.strokePath();

    this.add.circle(bubbleX + 26, bubbleY + 28, 16, 0xff66aa).setStrokeStyle(2, 0xffffff);
    this.add.text(bubbleX + 26, bubbleY + 26, '👩', { fontSize: '20px' }).setOrigin(0.5);

    this.add.text(bubbleX + 52, bubbleY + 18, '어머니', {
      fontSize: '14px', color: '#aa3366', fontStyle: 'bold',
    }).setOrigin(0, 0);

    this.add.text(bubbleX + 18, bubbleY + 58,
      '"마트 좀 다녀와줘.\n너무 더울 때는 피해서 가렴!"', {
        fontSize: '13px', color: '#222', lineSpacing: 4,
      }).setOrigin(0, 0);
  }
}
