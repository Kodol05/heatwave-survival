export const ITEMS = {
  water:       { name: '물',       water: +20, heat: -5,  emoji: '💧', color: 0x66ccff, msg: '가장 좋은 선택!' },
  iceWater:    { name: '얼음물',   water: +15, heat: -15, emoji: '🧊', color: 0x99ddff, msg: '더위 잡기 최고!' },
  sportsDrink: { name: '이온음료', water: +30, heat: -5,  emoji: '🥤', color: 0xff9933, msg: '땀 흘렸을 때 최고' },
  watermelon:  { name: '수박',     water: +20, heat: -5,  emoji: '🍉', color: 0xff5577, msg: '제철 과일!' },
  hotChoco:    { name: '핫초코',   water: +10, heat: +10, emoji: '☕', color: 0x885522, msg: '여름엔 따뜻한 거 피하기' },
  ramen:       { name: '라면',     water: +5,  heat: +20, emoji: '🍜', color: 0xcc4422, msg: '더위에 뜨거운 음식 위험!' },
  fan:         { name: '부채',     water: 0,   heat: -10, emoji: '🪭', color: 0xff66aa, msg: '즉시 시원!' },
};

export const ITEM_KEYS = Object.keys(ITEMS);

export const ITEM_WEIGHTS = {
  water: 4,
  iceWater: 2,
  sportsDrink: 2,
  watermelon: 2,
  hotChoco: 2,
  ramen: 2,
  fan: 2,
};

export function pickRandomItemKey(rng = Math.random) {
  const entries = Object.entries(ITEM_WEIGHTS);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [key, w] of entries) {
    r -= w;
    if (r <= 0) return key;
  }
  return entries[0][0];
}
