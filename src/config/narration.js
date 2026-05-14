export const NARRATION = {
  intro: {
    type: 'once',
    lines: [
      '어머나, 우리 아이! 오늘은 정말 더운 날이야.',
      '엄마를 클릭해서 말 걸어보렴.',
    ],
  },
  motherMenu: {
    type: 'always',
    lines: ['무슨 일이니?'],
    menu: ['🛒 심부름 다녀올게요', '🚑 응급처치 배우기', '🚪 종료'],
  },
  timeSelectIntro: {
    type: 'once',
    lines: [
      '오늘은 정말 더운 날이라 시간을 잘 골라야 해.',
      '한낮(14~15시)에는 폭염 절정이라 정말 위험하단다.',
    ],
  },
  hotHourWarning: {
    type: 'once',
    lines: ['정말 그 시간에 갈 거니? 그늘로 자주 다니고 물을 꼭 챙기렴.'],
  },
  errandTutorial: {
    type: 'once',
    lines: [
      '위아래로 움직이면서 앞으로 나아가렴.',
      '💧 시원한 음식과 음료는 도움이 되고, ☕ 뜨거운 음식은 더위에 좋지 않아!',
      '🌳 그늘에서는 더위가 식고, 🔥 아스팔트는 더 뜨거우니 조심해!',
    ],
  },
  hotItemFirstPickup: {
    type: 'once',
    lines: ['어... 따뜻한 음식이라 더위가 더 올랐어. 여름엔 시원한 게 좋아!'],
  },
  heatWarning: {
    type: 'once',
    lines: ['⚠ 체온이 너무 높아! 그늘로 가서 시원한 걸 먹자!'],
  },
  waterWarning: {
    type: 'once',
    lines: ['⚠ 목이 많이 마르네. 물이나 이온음료를 찾아!'],
  },
  heatGameOver: {
    type: 'always',
    lines: [
      '헉, 더위에 쓰러질 뻔했어...',
      '다음엔 그늘로 자주 다니고, 더 시원한 시간에 출발해보자.',
    ],
  },
  waterGameOver: {
    type: 'always',
    lines: [
      '물을 못 챙겨서 탈수가 왔어...',
      '여름엔 물을 자주, 충분히 마셔야 해!',
    ],
  },
  errandClear: {
    type: 'always',
    lines: ['심부름 잘 다녀왔어! 정말 대단하구나.'],
  },
  firstAidTutorial: {
    type: 'once',
    lines: [
      '여름엔 더위 때문에 쓰러지는 사람이 많아.',
      '상황을 보고 빠르게 올바른 행동을 골라야 해. 빠를수록 점수가 높단다.',
    ],
  },
  firstAidFirstWrong: {
    type: 'once',
    lines: ['그건 위험할 수도 있어. 다시 잘 생각해보자.'],
  },
  firstAidEnd: {
    type: 'always',
    lines: ['오늘 배운 걸 잊지 말고 실제 상황에서도 침착하게 행동하렴.'],
  },
};

const shown = new Set();

export function hasShownNarration(key) {
  return shown.has(key);
}

export function showNarration(scene, key, options = {}) {
  const msg = NARRATION[key];
  if (!msg) {
    options.onClose?.(null);
    return;
  }
  if (msg.type === 'once' && shown.has(key)) {
    options.onClose?.(null);
    return;
  }
  if (msg.type === 'once') shown.add(key);
  scene.scene.pause();
  scene.scene.launch('NarrationScene', {
    from: scene.scene.key,
    lines: msg.lines,
    menu: msg.menu || null,
    callback: options.onClose || (() => {}),
  });
}
