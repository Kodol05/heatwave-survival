import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { ITEMS } from '../config/items.js';

export default class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
  }

  init(data) {
    this.data = data || {};
  }

  create() {
    const { width, height } = GAME_CONFIG;
    const d = this.data;

    this.add.rectangle(0, 0, width, height, 0x1f2a44).setOrigin(0);

    const headColor = d.cleared ? '#a6f0c4' : '#ffb6b6';
    const headText = d.gameType === 'errand'
      ? (d.cleared ? '🎉 심부름 성공!' : '💦 게임 오버')
      : '📋 응급처치 결과';

    this.add.text(width / 2, 50, headText, {
      fontSize: '32px', color: headColor, fontStyle: 'bold',
    }).setOrigin(0.5);

    if (d.reason) {
      this.add.text(width / 2, 95, d.reason, {
        fontSize: '16px', color: '#fff',
      }).setOrigin(0.5);
    }

    this.add.text(width / 2, 140, `점수: ${d.score ?? 0}`, {
      fontSize: '28px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);

    if (d.gameType === 'errand') {
      this.renderErrandDetails(d);
    } else if (d.gameType === 'firstAid') {
      this.renderFirstAidDetails(d);
    }

    const btnY = height - 60;
    this.makeButton(width / 2 - 110, btnY, 200, 44, '🏠 집으로', () => {
      this.scene.start('HomeScene', { score: d.score, cleared: d.cleared });
    });
    if (d.gameType === 'errand') {
      this.makeButton(width / 2 + 110, btnY, 200, 44, '🔁 다시 시도', () => {
        this.scene.start('TimeSelectScene');
      });
    } else {
      this.makeButton(width / 2 + 110, btnY, 200, 44, '🔁 다시 풀기', () => {
        this.scene.start('FirstAidScene');
      });
    }
  }

  renderErrandDetails(d) {
    const { width } = GAME_CONFIG;
    this.add.text(width / 2, 190,
      `${d.hour}시 · ${d.temperature}°C · 남은 더위 여유 ${100 - (d.remainingHeat ?? 0)} · 남은 수분 ${d.remainingWater ?? 0}`, {
        fontSize: '14px', color: '#cde',
      }).setOrigin(0.5);

    const items = d.items || [];
    this.add.text(width / 2, 230, `획득한 아이템 (${items.length}개)`, {
      fontSize: '16px', color: '#fff',
    }).setOrigin(0.5);

    if (items.length === 0) {
      this.add.text(width / 2, 260, '— 없음 —', {
        fontSize: '14px', color: '#888',
      }).setOrigin(0.5);
      return;
    }

    const counts = {};
    items.forEach(k => { counts[k] = (counts[k] || 0) + 1; });

    const entries = Object.entries(counts);
    const perRow = 4;
    const gx = 180, gy = 50;
    const startX = width / 2 - ((Math.min(perRow, entries.length) - 1) * gx) / 2;
    entries.forEach(([key, count], i) => {
      const col = i % perRow, row = Math.floor(i / perRow);
      const x = startX + col * gx;
      const y = 270 + row * gy;
      const info = ITEMS[key];
      this.add.text(x, y, `${info.emoji} ${info.name} × ${count}`, {
        fontSize: '15px', color: '#fff',
      }).setOrigin(0.5);
    });
  }

  renderFirstAidDetails(d) {
    const { width } = GAME_CONFIG;
    const results = d.results || [];
    this.add.text(width / 2, 200, '문제별 결과', {
      fontSize: '16px', color: '#fff',
    }).setOrigin(0.5);

    results.forEach((r, i) => {
      const color = r.judgment.startsWith('Perfect') ? '#a6f0c4'
        : r.judgment.startsWith('Good') ? '#ffe066' : '#ffb6b6';
      this.add.text(width / 2, 230 + i * 26, `${i + 1}. ${r.judgment}  (${r.score >= 0 ? '+' : ''}${r.score})`, {
        fontSize: '15px', color,
      }).setOrigin(0.5);
    });
  }

  makeButton(x, y, w, h, label, onClick) {
    const bg = this.add.rectangle(x, y, w, h, 0x4f7cff).setStrokeStyle(2, 0xffffff);
    bg.setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, {
      fontSize: '16px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);
    bg.on('pointerover', () => bg.setFillStyle(0x6a92ff));
    bg.on('pointerout', () => bg.setFillStyle(0x4f7cff));
    bg.on('pointerup', onClick);
  }
}
