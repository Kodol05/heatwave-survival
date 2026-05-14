export const GAME_CONFIG = {
  width: 960,
  height: 540,

  initialHeat: 10,
  initialWater: 90,
  maxHeat: 100,
  minWater: 0,
  heatWarningThreshold: 70,
  waterWarningThreshold: 25,

  scrollSpeed: 220,
  playerVerticalSpeed: 260,
  errandGoalDistance: 6500,

  waterDrainBase: 3,
  heatChangeShade: -6,
  heatChangeNormal: 1.5,
  heatChangeAsphalt: 5,

  heatPerDegreeMultiplier: 0.06,
  waterDrainHeatBonus: 0.04,

  itemSpawnInterval: 1100,
  itemSpawnXAhead: 700,

  errandLanes: { top: 200, bottom: 520 },

  firstAid: {
    perfectWindowMs: 2000,
    totalTimeMs: 5000,
    perfectScore: 200,
    goodScore: 100,
    missPenalty: -50,
  },
};
