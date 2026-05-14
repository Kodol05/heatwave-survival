export const TERRAIN = {
  shade:    { name: '그늘',     color: 0x445566, heatDelta: -6, baseHeatGainAtCool: false, label: '그늘' },
  normal:   { name: '일반 길',  color: 0xddccaa, heatDelta: 1.5, baseHeatGainAtCool: true,  label: '길' },
  asphalt:  { name: '아스팔트', color: 0x333333, heatDelta: 5,   baseHeatGainAtCool: true,  label: '아스팔트' },
};

export const TERRAIN_KEYS = Object.keys(TERRAIN);

export const OBSTACLE_TYPES = [
  { name: 'cone',    width: 24, heat:  8, water:  0, stun: 280, label: '🚧 꼬깔콘' },
  { name: 'manhole', width: 40, heat: 15, water: -8, stun: 400, label: '⚠ 하수구' },
];

export const BUILDING_TYPES = [
  { name: 'house',     width: 120, height: 100, body: 0xc06030, roof: 0x803020, accent: 0xffd8a0, shadowH: 150 },
  { name: 'shop',      width: 160, height:  90, body: 0xddc070, roof: 0x4a3a2a, accent: 0xffffff, shadowH: 140 },
  { name: 'apartment', width: 240, height: 140, body: 0x8a8a8a, roof: 0x5a5a5a, accent: 0xffe28a, shadowH: 190 },
  { name: 'tower',     width: 200, height: 150, body: 0x5a7090, roof: 0x304060, accent: 0xaaddff, shadowH: 210 },
];

function asphaltCountForTemp(t, worldLen) {
  const per5k = t <= 26 ? 1 : t <= 30 ? 2 : t <= 33 ? 4 : 6;
  return Math.max(1, Math.round(per5k * worldLen / 5000));
}

function buildingCountForTemp(t, worldLen) {
  const per5k = t <= 26 ? 12 : t <= 30 ? 10 : t <= 33 ? 8 : 6;
  return Math.max(2, Math.round(per5k * worldLen / 5000));
}

function pickAsphaltLen(t, rng) {
  if (t <= 26) return 150 + rng() * 150;
  if (t <= 30) return 200 + rng() * 250;
  if (t <= 33) return 250 + rng() * 300;
  return 300 + rng() * 350;
}

export function generateMap(worldLen, temperature, rng = Math.random) {
  const startSafe = 400;
  const endSafe = 800;
  const usableEnd = worldLen - endSafe;

  const occupied = [];
  const overlaps = (x, w, gap) => {
    for (const z of occupied) {
      if (!(x + w + gap <= z.x || z.x + z.w + gap <= x)) return true;
    }
    return false;
  };

  const asphaltZones = [];
  const asphaltTarget = asphaltCountForTemp(temperature, worldLen);
  let attempts = 0;
  while (asphaltZones.length < asphaltTarget && attempts < 300) {
    attempts++;
    const w = pickAsphaltLen(temperature, rng);
    const x = startSafe + rng() * Math.max(1, usableEnd - startSafe - w);
    if (!overlaps(x, w, 80)) {
      asphaltZones.push({ x, w, variant: 0 });
      occupied.push({ x, w });
    }
  }

  const buildings = [];
  const buildingTarget = buildingCountForTemp(temperature, worldLen);
  attempts = 0;
  while (buildings.length < buildingTarget && attempts < 400) {
    attempts++;
    const typeIdx = Math.floor(rng() * BUILDING_TYPES.length);
    const type = BUILDING_TYPES[typeIdx];
    const x = startSafe + rng() * Math.max(1, usableEnd - startSafe - type.width);
    if (!overlaps(x, type.width, 60)) {
      buildings.push({ x, typeIdx });
      occupied.push({ x, w: type.width });
    }
  }

  const obstacles = [];
  const obstacleTarget = Math.max(3, Math.round(5 * worldLen / 5000));
  attempts = 0;
  while (obstacles.length < obstacleTarget && attempts < 300) {
    attempts++;
    const typeIdx = rng() < 0.6 ? 0 : 1;
    const type = OBSTACLE_TYPES[typeIdx];
    const x = startSafe + rng() * Math.max(1, usableEnd - startSafe - type.width);
    let tooClose = false;
    for (const ob of obstacles) {
      if (Math.abs(ob.x - x) < 120) { tooClose = true; break; }
    }
    if (tooClose) continue;
    const laneRng = rng();
    const lane = laneRng < 0.34 ? 'top' : laneRng < 0.67 ? 'mid' : 'bot';
    obstacles.push({ x, lane, typeIdx });
  }

  return { asphaltZones, buildings, obstacles };
}
