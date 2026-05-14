import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { FIRST_AID_CASES } from '../config/firstAidCases.js';
import { showNarration, hasShownNarration } from '../config/narration.js';

export default class FirstAidScene extends Phaser.Scene {
  constructor() {
    super('FirstAidScene');
  }

  create() {
    const { width, height } = GAME_CONFIG;
    this.add.rectangle(0, 0, width, height, 0xf8f4ea).setOrigin(0);
    this.add.text(width / 2, 16, '💻 응급처치 학습', {
      fontSize: '22px', color: '#222', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    this.caseIndex = 0;
    this.totalScore = 0;
    this.results = [];

    this.buildQuizUI();

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('PauseScene', { from: 'FirstAidScene' });
    });

    showNarration(this, 'firstAidTutorial', {
      onClose: () => this.startCase(),
    });
  }

  buildQuizUI() {
    const { width, height } = GAME_CONFIG;

    this.situationBox = this.add.rectangle(width / 2, 110, width - 80, 90, 0xffffff)
      .setStrokeStyle(2, 0x88aaff);
    this.situationText = this.add.text(width / 2, 110, '', {
      fontSize: '17px', color: '#222', align: 'center', wordWrap: { width: width - 120 },
    }).setOrigin(0.5);

    this.timerBarBg = this.add.rectangle(width / 2, 180, width - 100, 16, 0xdddddd);
    this.timerBar = this.add.rectangle(50, 180, width - 100, 12, 0x4fb3ff).setOrigin(0, 0.5);

    this.choiceButtons = [];
    const startY = 230;
    const btnH = 50;
    for (let i = 0; i < 4; i++) {
      const bg = this.add.rectangle(width / 2, startY + i * (btnH + 12), width - 120, btnH, 0xffffff)
        .setStrokeStyle(2, 0xaaaaaa).setInteractive({ useHandCursor: true });
      const txt = this.add.text(width / 2, startY + i * (btnH + 12), '', {
        fontSize: '15px', color: '#222', align: 'center', wordWrap: { width: width - 160 },
      }).setOrigin(0.5);
      bg.on('pointerover', () => { if (!this.locked) bg.setFillStyle(0xeaf2ff); });
      bg.on('pointerout', () => { if (!this.locked) bg.setFillStyle(0xffffff); });
      bg.on('pointerup', () => this.handleChoice(i));
      this.choiceButtons.push({ bg, txt });
    }

    this.feedbackText = this.add.text(width / 2, height - 60, '', {
      fontSize: '14px', color: '#222', align: 'center', wordWrap: { width: width - 80 },
    }).setOrigin(0.5);

    this.scoreText = this.add.text(width - 16, 18, '', {
      fontSize: '14px', color: '#222',
    }).setOrigin(1, 0);
    this.progressText = this.add.text(16, 18, '', {
      fontSize: '14px', color: '#222',
    }).setOrigin(0, 0);
  }

  startCase() {
    if (this.caseIndex >= FIRST_AID_CASES.length) {
      this.finish();
      return;
    }
    const c = FIRST_AID_CASES[this.caseIndex];
    this.situationText.setText(`상황 ${this.caseIndex + 1}/${FIRST_AID_CASES.length}\n${c.situation}`);
    this.feedbackText.setText('');
    this.progressText.setText(`문제 ${this.caseIndex + 1} / ${FIRST_AID_CASES.length}`);
    this.scoreText.setText(`점수: ${this.totalScore}`);

    const order = Phaser.Utils.Array.NumberArray(0, 3);
    Phaser.Utils.Array.Shuffle(order);
    this.choiceOrder = order;

    order.forEach((origIdx, btnIdx) => {
      const choice = c.choices[origIdx];
      const { bg, txt } = this.choiceButtons[btnIdx];
      bg.setFillStyle(0xffffff).setStrokeStyle(2, 0xaaaaaa);
      txt.setText(choice.text);
    });

    this.locked = false;
    this.caseStartTime = this.time.now;
    const totalMs = GAME_CONFIG.firstAid.totalTimeMs;
    this.timerBar.width = GAME_CONFIG.width - 100;

    this.timerTween?.stop();
    this.timerTween = this.tweens.add({
      targets: this.timerBar,
      width: 0,
      duration: totalMs,
      ease: 'Linear',
      onComplete: () => {
        if (!this.locked) this.handleTimeout();
      },
    });
  }

  handleChoice(btnIdx) {
    if (this.locked) return;
    this.locked = true;
    this.timerTween?.stop();

    const c = FIRST_AID_CASES[this.caseIndex];
    const origIdx = this.choiceOrder[btnIdx];
    const choice = c.choices[origIdx];
    const elapsed = this.time.now - this.caseStartTime;

    let judgment, score;
    if (choice.correct) {
      if (elapsed <= GAME_CONFIG.firstAid.perfectWindowMs) {
        judgment = 'Perfect';
        score = GAME_CONFIG.firstAid.perfectScore;
      } else {
        judgment = 'Good';
        score = GAME_CONFIG.firstAid.goodScore;
      }
      this.choiceButtons[btnIdx].bg.setFillStyle(0xb6f0c4);
    } else {
      judgment = 'Miss (오답)';
      score = GAME_CONFIG.firstAid.missPenalty;
      this.choiceButtons[btnIdx].bg.setFillStyle(0xffb6b6);
      this.choiceOrder.forEach((oi, bi) => {
        if (c.choices[oi].correct) {
          this.choiceButtons[bi].bg.setFillStyle(0xb6f0c4);
        }
      });
    }

    this.totalScore += score;
    this.results.push({ judgment, score });
    this.scoreText.setText(`점수: ${this.totalScore}`);
    this.feedbackText.setText(`${judgment} · ${score >= 0 ? '+' : ''}${score}\n${c.explain}`);

    const wasWrong = !choice.correct;
    this.time.delayedCall(1800, () => {
      if (wasWrong && !hasShownNarration('firstAidFirstWrong')) {
        showNarration(this, 'firstAidFirstWrong', {
          onClose: () => {
            this.caseIndex++;
            this.startCase();
          },
        });
      } else {
        this.caseIndex++;
        this.startCase();
      }
    });
  }

  handleTimeout() {
    this.locked = true;
    const c = FIRST_AID_CASES[this.caseIndex];
    this.choiceOrder.forEach((oi, bi) => {
      if (c.choices[oi].correct) {
        this.choiceButtons[bi].bg.setFillStyle(0xb6f0c4);
      }
    });
    this.results.push({ judgment: 'Miss (시간초과)', score: 0 });
    this.feedbackText.setText(`Miss · 0\n${c.explain}`);
    this.time.delayedCall(1800, () => {
      this.caseIndex++;
      this.startCase();
    });
  }

  finish() {
    const resultData = {
      gameType: 'firstAid',
      cleared: true,
      score: this.totalScore,
      results: this.results,
    };
    showNarration(this, 'firstAidEnd', {
      onClose: () => this.scene.start('ResultScene', resultData),
    });
  }
}
