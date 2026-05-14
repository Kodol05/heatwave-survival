export const TEMPERATURE_TABLE = {
  8:  { temp: 26, difficulty: '매우 쉬움', desc: '아침의 시원한 시간이에요.', color: '#7ec8e3' },
  9:  { temp: 26, difficulty: '매우 쉬움', desc: '아침의 시원한 시간이에요.', color: '#7ec8e3' },
  10: { temp: 30, difficulty: '쉬움',     desc: '슬슬 더워지기 시작해요.',   color: '#ffe066' },
  11: { temp: 30, difficulty: '쉬움',     desc: '슬슬 더워지기 시작해요.',   color: '#ffe066' },
  12: { temp: 34, difficulty: '보통',     desc: '점심시간, 햇빛이 강해요.',  color: '#ffa94d' },
  13: { temp: 34, difficulty: '보통',     desc: '점심시간, 햇빛이 강해요.',  color: '#ffa94d' },
  14: { temp: 36, difficulty: '어려움',   desc: '폭염 절정! 외출은 위험해요.', color: '#ff6b6b' },
  15: { temp: 36, difficulty: '어려움',   desc: '폭염 절정! 외출은 위험해요.', color: '#ff6b6b' },
  16: { temp: 33, difficulty: '보통',     desc: '아직 덥지만 조금 나아져요.', color: '#ffa94d' },
  17: { temp: 33, difficulty: '보통',     desc: '아직 덥지만 조금 나아져요.', color: '#ffa94d' },
  18: { temp: 29, difficulty: '쉬움',     desc: '해가 기울고 시원해져요.',   color: '#ffe066' },
  19: { temp: 29, difficulty: '쉬움',     desc: '해가 기울고 시원해져요.',   color: '#ffe066' },
  20: { temp: 26, difficulty: '매우 쉬움', desc: '저녁 시간, 가장 시원해요.', color: '#7ec8e3' },
};

export const TIME_HOURS = Object.keys(TEMPERATURE_TABLE).map(Number).sort((a, b) => a - b);
