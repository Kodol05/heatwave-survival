import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { TERRAIN, BUILDING_TYPES, OBSTACLE_TYPES, generateMap } from '../config/terrain.js';
import { ITEMS, pickRandomItemKey } from '../config/items.js';
import { showNarration, hasShownNarration } from '../config/narration.js';

export default class ErrandScene extends Phaser.Scene {
  constructor() {
    super('ErrandScene');
  }

  init(data) {
    this.hour = data?.hour ?? 12;
    this.temperature = data?.temperature ?? 30;
  }

  create() {
    const { width, height } = GAME_CONFIG;
    const cfg = GAME_CONFIG;

    this.cameras.main.setBackgroundColor(this.skyColorForTemp(this.temperature));

    this.physics.world.setBounds(0, 0, cfg.errandGoalDistance + 1000, height);
    this.cameras.main.setBounds(0, 0, cfg.errandGoalDistance + 1000, height);

    const totalLen = cfg.errandGoalDistance + 800;
    const playTop = cfg.errandLanes.top;
    const playBot = cfg.errandLanes.bottom;
    const playH = playBot - playTop;

    const map = generateMap(totalLen, this.temperature);
    this.asphaltZones = map.asphaltZones;
    this.buildings = map.buildings;

    const roadH = GAME_CONFIG.height - playTop;
    this.add.rectangle(0, playTop, totalLen, roadH, 0xd9c69a).setOrigin(0);

    for (const z of this.asphaltZones) {
      this.add.tileSprite(z.x, playTop, z.w, roadH, `asphalt-tile-${z.variant ?? 0}`).setOrigin(0);
      this.add.rectangle(z.x, playTop, z.w, 4, 0xbbbbbb).setOrigin(0);
      this.add.rectangle(z.x, playTop, 4, roadH, 0xbbbbbb).setOrigin(0);
      this.add.rectangle(z.x + z.w - 4, playTop, 4, roadH, 0xbbbbbb).setOrigin(0);
    }

    for (const b of this.buildings) {
      this.drawBuilding(b.x, BUILDING_TYPES[b.typeIdx]);
      const t = BUILDING_TYPES[b.typeIdx];
      this.add.rectangle(b.x, playTop, t.width, t.shadowH, 0x000000, 0.38).setOrigin(0);
    }

    this.drawFinishLine();

    this.player = this.physics.add.sprite(80, (playTop + playBot) / 2, 'player');
    this.player.setScale(0.85);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 56);
    this.player.body.setOffset(14, 10);
    this.player.play('player-run');
    this.wasStunned = false;

    this.cameras.main.startFollow(this.player, false, 1, 1, -200, 0);

    this.heat = cfg.initialHeat;
    this.water = cfg.initialWater;
    this.collectedItems = [];
    this.gameEnded = false;

    this.createHud();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,S');

    this.input.keyboard.on('keydown-ESC', () => {
      if (this.gameEnded) return;
      this.scene.pause();
      this.scene.launch('PauseScene', {
        from: 'ErrandScene',
        errandData: { hour: this.hour, temperature: this.temperature },
      });
    });

    this.itemGroup = this.physics.add.group();
    this.physics.add.overlap(this.player, this.itemGroup, (p, item) => this.collectItem(item), null, this);

    this.lastItemX = 200;

    this.popups = [];

    this.obstacleGroup = this.physics.add.group();
    for (const ob of map.obstacles) {
      const type = OBSTACLE_TYPES[ob.typeIdx];
      const y = this.laneToY(ob.lane);
      const sprite = this.obstacleGroup.create(ob.x, y, `obstacle-${type.name}`);
      sprite.body.setAllowGravity(false);
      sprite.body.setImmovable(true);
      sprite.obstacleData = type;
    }
    this.physics.add.overlap(this.player, this.obstacleGroup, (p, o) => this.hitObstacle(o), null, this);

    this.stunUntil = 0;

    this.inventory = {};
    this.bagSlots = {};
    this.createBagUI();

    if (this.game.bgm && this.game.bgm.isPlaying) {
      this.game.bgm.pause();
    }
    if (!this.game.errandBgm) {
      this.game.errandBgm = this.sound.add('bgm-errand', { loop: true });
    }
    if (!this.game.errandBgm.isPlaying) {
      this.game.errandBgm.play();
    }

    this.events.once('shutdown', () => {
      if (this.game.errandBgm && this.game.errandBgm.isPlaying) {
        this.game.errandBgm.stop();
      }
      if (this.game.bgm && this.game.bgm.isPaused) {
        this.game.bgm.resume();
      }
    });

    showNarration(this, 'errandTutorial');
  }

  createBagUI() {
    const slotKeys = Object.keys(ITEMS);
    const slotW = 36, slotH = 36, gap = 6;
    const totalW = slotKeys.length * slotW + (slotKeys.length - 1) * gap;
    const startX = (GAME_CONFIG.width - totalW) / 2 + slotW / 2;
    const slotY = GAME_CONFIG.height - 22;
    const keyCodes = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];

    this.bagTooltip = this.add.text(0, 0, '', {
      fontSize: '13px', color: '#fff',
      backgroundColor: '#000d',
      padding: { x: 10, y: 8 },
      align: 'center',
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(30).setVisible(false);

    slotKeys.forEach((key, i) => {
      const x = startX + i * (slotW + gap);
      const bg = this.add.rectangle(x, slotY, slotW, slotH, 0x000000, 0.7)
        .setStrokeStyle(2, 0xffffff)
        .setScrollFactor(0).setDepth(20)
        .setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => {
        bg.setStrokeStyle(2, 0xffe066);
        this.showBagTooltip(key, x, slotY - slotH / 2 - 6);
      });
      bg.on('pointerout', () => {
        bg.setStrokeStyle(2, 0xffffff);
        this.bagTooltip.setVisible(false);
      });
      bg.on('pointerup', () => this.useItem(key));

      const icon = this.add.text(x, slotY, ITEMS[key].emoji, {
        fontSize: '20px',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(21).setAlpha(0.3);

      const countText = this.add.text(x + slotW / 2 - 3, slotY + slotH / 2 - 3, '', {
        fontSize: '11px', color: '#fff', fontStyle: 'bold',
      }).setOrigin(1, 1).setScrollFactor(0).setDepth(22);

      this.add.text(x - slotW / 2 + 3, slotY - slotH / 2 + 2, `${i + 1}`, {
        fontSize: '10px', color: '#aaffff',
      }).setOrigin(0, 0).setScrollFactor(0).setDepth(22);

      this.bagSlots[key] = { bg, icon, countText };

      if (keyCodes[i]) {
        this.input.keyboard.on(`keydown-${keyCodes[i]}`, (event) => {
          if (event.repeat) return;
          this.useItem(key);
        });
      }
    });
  }

  showBagTooltip(key, x, y) {
    const data = ITEMS[key];
    const count = this.inventory[key] || 0;
    const heatSign = data.heat >= 0 ? '+' : '';
    const waterSign = data.water >= 0 ? '+' : '';
    const content = `${data.emoji} ${data.name}  (가방: ${count}개)\n수분 ${waterSign}${data.water}  ·  더위 ${heatSign}${data.heat}\n${data.msg}`;
    this.bagTooltip.setText(content).setPosition(x, y).setVisible(true);
  }

  updateBagSlot(key) {
    const slot = this.bagSlots[key];
    if (!slot) return;
    const count = this.inventory[key] || 0;
    slot.countText.setText(count > 0 ? `×${count}` : '');
    slot.icon.setAlpha(count > 0 ? 1 : 0.3);
  }

  useItem(key) {
    const count = this.inventory[key] || 0;
    if (count <= 0 || this.gameEnded) return;
    this.inventory[key] = count - 1;
    this.updateBagSlot(key);

    const data = ITEMS[key];
    this.water = Phaser.Math.Clamp(this.water + data.water, 0, 100);
    this.heat = Phaser.Math.Clamp(this.heat + data.heat, 0, GAME_CONFIG.maxHeat);

    const isBad = data.heat > 0;
    const popup = this.add.text(this.player.x, this.player.y - 40,
      `${data.emoji} ${data.msg}`, {
        fontSize: '13px',
        color: isBad ? '#ff5544' : '#22ddaa',
        backgroundColor: '#000a',
        padding: { x: 6, y: 4 },
        align: 'center',
      }).setOrigin(0.5);
    this.tweens.add({
      targets: popup, y: popup.y - 30, alpha: 0, duration: 1400,
      onComplete: () => popup.destroy(),
    });
  }

  laneToY(lane) {
    const top = GAME_CONFIG.errandLanes.top;
    const bot = GAME_CONFIG.errandLanes.bottom;
    if (lane === 'top') return top + 50;
    if (lane === 'bot') return bot - 50;
    return (top + bot) / 2;
  }

  hitObstacle(sprite) {
    const data = sprite.obstacleData;
    if (!data) return;
    sprite.obstacleData = null;

    this.heat = Phaser.Math.Clamp(this.heat + data.heat, 0, GAME_CONFIG.maxHeat);
    this.water = Phaser.Math.Clamp(this.water + data.water, 0, 100);
    this.stunUntil = this.time.now + data.stun;

    this.cameras.main.shake(150, 0.005);

    const waterPart = data.water !== 0 ? ` ${data.water}💧` : '';
    const popup = this.add.text(sprite.x, sprite.y - 30,
      `${data.label}\n+${data.heat}🔥${waterPart}`, {
        fontSize: '13px', color: '#ff5544', backgroundColor: '#000c',
        padding: { x: 6, y: 4 }, align: 'center',
      }).setOrigin(0.5);
    this.tweens.add({
      targets: popup, y: popup.y - 30, alpha: 0, duration: 1200,
      onComplete: () => popup.destroy(),
    });

    sprite.destroy();
  }

  skyColorForTemp(t) {
    if (t >= 35) return 0xffc77a;
    if (t >= 32) return 0xffe19a;
    if (t >= 29) return 0xffe7ad;
    return 0x9ed4ee;
  }

  createHud() {
    const { width } = GAME_CONFIG;
    this.hud = this.add.container(0, 0).setScrollFactor(0);

    const panel = this.add.rectangle(0, 0, width, 56, 0x000000, 0.4).setOrigin(0);
    this.hud.add(panel);

    this.add.text(12, 8, `🕐 ${this.hour}시 · ${this.temperature}°C`, {
      fontSize: '16px', color: '#fff', fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(10);

    this.add.text(12, 30, '더위', { fontSize: '12px', color: '#fff' }).setScrollFactor(0).setDepth(10);
    this.heatBarBg = this.add.rectangle(50, 36, 180, 14, 0x222222).setOrigin(0, 0.5).setScrollFactor(0).setDepth(10);
    this.heatBar = this.add.rectangle(52, 36, 176, 10, 0xff5544).setOrigin(0, 0.5).setScrollFactor(0).setDepth(11);

    this.add.text(245, 30, '수분', { fontSize: '12px', color: '#fff' }).setScrollFactor(0).setDepth(10);
    this.waterBarBg = this.add.rectangle(285, 36, 180, 14, 0x222222).setOrigin(0, 0.5).setScrollFactor(0).setDepth(10);
    this.waterBar = this.add.rectangle(287, 36, 176, 10, 0x4fb3ff).setOrigin(0, 0.5).setScrollFactor(0).setDepth(11);

    this.distanceText = this.add.text(width - 12, 8, '', {
      fontSize: '14px', color: '#fff', align: 'right',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(10);

    this.terrainText = this.add.text(width - 12, 30, '', {
      fontSize: '13px', color: '#fff',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(10);
  }

  update(time, delta) {
    if (this.gameEnded) return;

    const cfg = GAME_CONFIG;
    const dt = delta / 1000;
    const stunned = time < this.stunUntil;
    if (stunned !== this.wasStunned) {
      if (stunned) this.player.anims.pause();
      else this.player.anims.resume();
      this.wasStunned = stunned;
    }

    if (stunned) {
      this.player.setVelocity(0, 0);
    } else {
      this.player.setVelocityX(cfg.scrollSpeed);

      const up = this.cursors.up.isDown || this.keys.W.isDown;
      const down = this.cursors.down.isDown || this.keys.S.isDown;
      let vy = 0;
      if (up) vy = -cfg.playerVerticalSpeed;
      else if (down) vy = cfg.playerVerticalSpeed;
      this.player.setVelocityY(vy);

      const halfH = this.player.displayHeight / 2;
      const minY = cfg.errandLanes.top + halfH;
      const maxY = cfg.errandLanes.bottom - halfH;
      if (this.player.y < minY) this.player.y = minY;
      if (this.player.y > maxY) this.player.y = maxY;
    }

    const currentTerrain = this.terrainAt(this.player.x, this.player.y);
    this.applyTerrainEffects(currentTerrain, dt);

    this.water -= cfg.waterDrainBase * dt * (1 + cfg.waterDrainHeatBonus * Math.max(0, this.heat - 30));

    this.heat = Phaser.Math.Clamp(this.heat, 0, cfg.maxHeat);
    this.water = Phaser.Math.Clamp(this.water, 0, 100);

    this.heatBar.width = (this.heat / cfg.maxHeat) * 176;
    this.waterBar.width = (this.water / 100) * 176;
    this.heatBar.fillColor = this.heat > cfg.heatWarningThreshold ? 0xff2222 : 0xff7755;
    this.waterBar.fillColor = this.water < cfg.waterWarningThreshold ? 0xff8866 : 0x4fb3ff;

    const dist = Math.max(0, this.player.x - 80);
    const pct = Math.min(100, (dist / cfg.errandGoalDistance) * 100);
    this.distanceText.setText(`거리 ${Math.floor(dist)} / ${cfg.errandGoalDistance} (${pct.toFixed(0)}%)`);
    this.terrainText.setText(`지금: ${TERRAIN[currentTerrain].name}`);

    this.maybeSpawnItem();

    if (this.player.x >= cfg.errandGoalDistance) {
      this.finish(true);
      return;
    }
    if (this.heat >= cfg.maxHeat) {
      this.finish(false, '더위에 쓰러졌어요!');
      return;
    }
    if (this.water <= cfg.minWater) {
      this.finish(false, '수분 부족! 탈수 상태예요!');
      return;
    }

    if (this.heat >= 80 && !hasShownNarration('heatWarning')) {
      showNarration(this, 'heatWarning');
    } else if (this.water <= 20 && !hasShownNarration('waterWarning')) {
      showNarration(this, 'waterWarning');
    }
  }

  terrainAt(worldX, worldY) {
    for (const z of this.asphaltZones) {
      if (worldX >= z.x && worldX < z.x + z.w) return 'asphalt';
    }
    const playTop = GAME_CONFIG.errandLanes.top;
    for (const b of this.buildings) {
      const t = BUILDING_TYPES[b.typeIdx];
      if (worldX >= b.x && worldX < b.x + t.width) {
        if (worldY >= playTop && worldY <= playTop + t.shadowH) return 'shade';
      }
    }
    return 'normal';
  }

  drawFinishLine() {
    const cfg = GAME_CONFIG;
    const playTop = cfg.errandLanes.top;
    const x = cfg.errandGoalDistance;
    const top = playTop;
    const height = cfg.height - top;

    const cellSize = 20;
    const cols = 3;
    const rows = Math.ceil(height / cellSize);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const color = (r + c) % 2 === 0 ? 0xffffff : 0x000000;
        this.add.rectangle(x + c * cellSize, top + r * cellSize, cellSize, cellSize, color).setOrigin(0);
      }
    }
  }

  drawBuilding(x, type) {
    const playTop = GAME_CONFIG.errandLanes.top;
    const bottomY = playTop;
    const topY = bottomY - type.height;

    this.add.rectangle(x, topY, type.width, type.height, type.body).setOrigin(0)
      .setStrokeStyle(2, 0x1a1a1a);
    this.add.rectangle(x, topY, type.width, 14, type.roof).setOrigin(0);

    const cols = Math.max(2, Math.floor(type.width / 50));
    const rows = Math.max(1, Math.floor((type.height - 30) / 30));
    const winW = 14, winH = 18, gap = 8;
    const gridW = cols * winW + (cols - 1) * gap;
    const gridH = rows * winH + (rows - 1) * gap;
    const startX = x + (type.width - gridW) / 2;
    const startY = topY + 22 + Math.max(0, (type.height - 30 - gridH) / 2);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.add.rectangle(startX + c * (winW + gap), startY + r * (winH + gap), winW, winH, type.accent)
          .setOrigin(0);
      }
    }
  }

  applyTerrainEffects(terrainKey, dt) {
    const cfg = GAME_CONFIG;
    const t = TERRAIN[terrainKey];
    let delta = t.heatDelta;
    if (t.baseHeatGainAtCool) {
      const tempBoost = 1 + Math.max(0, this.temperature - 26) * cfg.heatPerDegreeMultiplier;
      delta *= tempBoost;
    }
    this.heat += delta * dt;
  }

  maybeSpawnItem() {
    const cfg = GAME_CONFIG;
    const ahead = this.player.x + cfg.itemSpawnXAhead;
    if (ahead > this.lastItemX + 220 + Math.random() * 180) {
      const key = pickRandomItemKey();
      const lane = Math.random() < 0.5 ? cfg.errandLanes.top + 40 : cfg.errandLanes.bottom - 40;
      const yJitter = (Math.random() - 0.5) * 80;
      const itemY = lane + yJitter;
      const item = this.itemGroup.create(ahead, itemY, 'item-bg');
      item.itemKey = key;
      item.body.setAllowGravity(false);
      const emoji = this.add.text(ahead, itemY, ITEMS[key].emoji, {
        fontSize: '22px',
      }).setOrigin(0.5);
      item.emojiText = emoji;
      this.lastItemX = ahead;
    }
  }

  collectItem(itemSprite) {
    const key = itemSprite.itemKey;
    const data = ITEMS[key];
    this.inventory[key] = (this.inventory[key] || 0) + 1;
    this.collectedItems.push(key);
    this.updateBagSlot(key);

    if (data.heat > 0 && !hasShownNarration('hotItemFirstPickup')) {
      showNarration(this, 'hotItemFirstPickup');
    }

    const popup = this.add.text(itemSprite.x, itemSprite.y - 24,
      `+ ${data.emoji}`, {
        fontSize: '16px', color: '#fff', backgroundColor: '#000a',
        padding: { x: 6, y: 4 },
      }).setOrigin(0.5);
    this.tweens.add({
      targets: popup, y: popup.y - 30, alpha: 0, duration: 900,
      onComplete: () => popup.destroy(),
    });

    if (itemSprite.emojiText) itemSprite.emojiText.destroy();
    itemSprite.destroy();
  }

  finish(cleared, reason = '') {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.player.setVelocity(0);

    const cfg = GAME_CONFIG;
    let score = 0;
    if (cleared) {
      score = Math.round(this.water + (cfg.maxHeat - this.heat) + 500);
    } else {
      score = Math.round(this.water + (cfg.maxHeat - this.heat));
    }

    const resultData = {
      gameType: 'errand',
      cleared,
      reason,
      score,
      items: this.collectedItems,
      hour: this.hour,
      temperature: this.temperature,
      remainingHeat: Math.round(this.heat),
      remainingWater: Math.round(this.water),
    };

    let narrationKey = null;
    if (cleared) narrationKey = 'errandClear';
    else if (reason.includes('더위')) narrationKey = 'heatGameOver';
    else if (reason.includes('수분')) narrationKey = 'waterGameOver';

    this.time.delayedCall(400, () => {
      if (narrationKey) {
        showNarration(this, narrationKey, {
          onClose: () => this.scene.start('ResultScene', resultData),
        });
      } else {
        this.scene.start('ResultScene', resultData);
      }
    });
  }
}
