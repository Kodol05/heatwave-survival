# 코드 구조

## 1. 전체 폴더 구조

```
heatwave-game/
├── index.html              # 진입점
├── README.md               # 프로젝트 설명
│
├── src/
│   ├── main.js             # Phaser 게임 인스턴스 초기화
│   │
│   ├── scenes/             # 모든 씬
│   │   ├── BootScene.js    # 에셋 로딩
│   │   ├── HomeScene.js    # 집 (허브)
│   │   ├── TimeSelectScene.js  # 시간 선택
│   │   ├── ErrandScene.js  # 심부름 게임
│   │   ├── FirstAidScene.js    # 응급처치 게임
│   │   └── ResultScene.js  # 결과 화면
│   │
│   ├── config/             # 게임 데이터 (수치, 설정)
│   │   ├── temperature.js  # 시간대별 온도 테이블
│   │   ├── items.js        # 아이템 7종 데이터
│   │   ├── terrain.js      # 지형 효과 데이터
│   │   ├── firstAidCases.js    # 응급처치 5개 상황
│   │   └── gameConfig.js   # 게이지 기본값, 속도 등 전역 설정
│   │
│   ├── objects/            # 게임 오브젝트 클래스
│   │   ├── Player.js
│   │   ├── Mother.js
│   │   ├── Computer.js
│   │   ├── Item.js
│   │   └── Gauge.js
│   │
│   └── utils/              # 헬퍼 함수
│       ├── assetLoader.js  # placeholder/실제 그래픽 관리
│       └── helpers.js
│
├── assets/                 # 그래픽/사운드 (교체 가능)
│   ├── images/
│   │   ├── placeholder/    # 임시 그래픽 (단색 사각형 등)
│   │   └── final/          # 최종 그래픽 (만들어지면 여기로)
│   └── sounds/
│
└── docs/                   # 기획 문서
    ├── 01_GAME_DESIGN.md
    ├── 02_BUILD_FLOW.md
    └── 03_CODE_STRUCTURE.md
```

---

## 2. index.html 기본 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>폭염 서바이벌</title>
  <style>
    body { margin: 0; background: #000; }
    #game { display: block; margin: 0 auto; }
  </style>
</head>
<body>
  <div id="game"></div>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>

  <!-- config -->
  <script src="src/config/gameConfig.js"></script>
  <script src="src/config/temperature.js"></script>
  <script src="src/config/items.js"></script>
  <script src="src/config/terrain.js"></script>
  <script src="src/config/firstAidCases.js"></script>

  <!-- objects -->
  <script src="src/objects/Player.js"></script>
  <!-- ... 나머지 오브젝트 -->

  <!-- scenes -->
  <script src="src/scenes/BootScene.js"></script>
  <script src="src/scenes/HomeScene.js"></script>
  <!-- ... 나머지 씬 -->

  <!-- 마지막에 main.js -->
  <script src="src/main.js"></script>
</body>
</html>
```

> **참고**: 모듈 시스템 없이 절차적으로 짤 거라 `<script>` 태그 순서가 중요해요.  
> config → objects → scenes → main 순으로 로드해야 해요.

---

## 3. main.js (게임 진입점)

```javascript
const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  parent: 'game',
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },  // 중력 없음
      debug: false
    }
  },
  scene: [
    BootScene,
    HomeScene,
    TimeSelectScene,
    ErrandScene,
    FirstAidScene,
    ResultScene
  ]
};

const game = new Phaser.Game(config);
```

---

## 4. 씬 기본 패턴

모든 씬은 이 구조를 따라요.

```javascript
class HomeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HomeScene' });
  }

  init(data) {
    // 다른 씬에서 넘어온 데이터 받기
    this.previousScore = data.score || null;
  }

  preload() {
    // 이 씬에서만 쓰는 에셋 로드 (대부분 BootScene에서 처리)
  }

  create() {
    // 화면 구성, 오브젝트 생성
  }

  update(time, delta) {
    // 매 프레임 호출 (게임 로직)
  }
}
```

### 씬 간 전환

```javascript
// 데이터 전달하며 이동
this.scene.start('ErrandScene', { hour: 14, temperature: 36 });

// 결과 화면에서 집으로 돌아가기
this.scene.start('HomeScene', { score: 1200, items: ['water', 'watermelon'] });
```

---

## 5. config 파일 예시

### temperature.js (시간대별 온도)

```javascript
const TEMPERATURE_TABLE = {
  8:  { temp: 26, difficulty: '매우 쉬움', desc: '아침의 시원한 시간이에요.' },
  9:  { temp: 26, difficulty: '매우 쉬움', desc: '아침의 시원한 시간이에요.' },
  10: { temp: 30, difficulty: '쉬움',     desc: '슬슬 더워지기 시작해요.' },
  11: { temp: 30, difficulty: '쉬움',     desc: '슬슬 더워지기 시작해요.' },
  12: { temp: 34, difficulty: '보통',     desc: '점심시간, 햇빛이 강해요.' },
  13: { temp: 34, difficulty: '보통',     desc: '점심시간, 햇빛이 강해요.' },
  14: { temp: 36, difficulty: '어려움',   desc: '폭염 절정! 외출은 위험해요.' },
  15: { temp: 36, difficulty: '어려움',   desc: '폭염 절정! 외출은 위험해요.' },
  16: { temp: 33, difficulty: '보통',     desc: '아직 덥지만 조금 나아져요.' },
  17: { temp: 33, difficulty: '보통',     desc: '아직 덥지만 조금 나아져요.' },
  18: { temp: 29, difficulty: '쉬움',     desc: '해가 기울고 시원해져요.' },
  19: { temp: 29, difficulty: '쉬움',     desc: '해가 기울고 시원해져요.' },
  20: { temp: 26, difficulty: '매우 쉬움', desc: '저녁 시간, 가장 시원해요.' }
};
```

### items.js (아이템 7종)

```javascript
const ITEMS = {
  water:      { name: '물',       water: +20, heat: -5,  emoji: '💧' },
  iceWater:   { name: '얼음물',   water: +15, heat: -15, emoji: '🧊' },
  sportsDrink:{ name: '이온음료', water: +30, heat: -5,  emoji: '🥤' },
  watermelon: { name: '수박',     water: +20, heat: -5,  emoji: '🥒' },
  hotChoco:   { name: '핫초코',   water: +10, heat: +10, emoji: '☕' },
  ramen:      { name: '라면',     water: +5,  heat: +20, emoji: '🍜' },
  fan:        { name: '부채',     water: 0,   heat: -10, emoji: '🪭' }
};
```

### gameConfig.js (전역 설정)

```javascript
const GAME_CONFIG = {
  // 게이지 초기값
  initialHeat: 10,
  initialWater: 90,

  // 위험 수치
  maxHeat: 100,
  minWater: 0,

  // 게임 속도
  scrollSpeed: 200,  // 자동 전진 속도

  // 게이지 변화량 (초당)
  waterDrainBase: 3,        // 수분 기본 감소량
  heatChangeShade: -5,      // 그늘 회복량
  heatChangeNormal: 2,      // 일반 길 더위 상승
  heatChangeAsphalt: 6,     // 아스팔트 더위 상승

  // 온도가 1도 올라갈 때 일반/아스팔트 더위 상승 가속률
  heatPerDegreeMultiplier: 0.05
};
```

> 이런 식으로 **수치는 전부 config에 모아두면** 나중에 밸런싱할 때 한 곳만 보면 돼요.

---

## 6. 그래픽 placeholder 교체 시스템

핵심 아이디어: **에셋 키만 일관되게 쓰고, 실제 파일은 BootScene에서 한 번에 바꿈**

### BootScene.js

```javascript
class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // placeholder 모드 (개발 초반)
    this.loadPlaceholders();

    // 실제 그래픽이 준비되면 위 줄을 주석 처리하고 아래 줄 사용:
    // this.loadFinalAssets();
  }

  loadPlaceholders() {
    // 단색 텍스처를 동적으로 만들어서 키에 등록
    this.makeRect('player',   32, 48, 0x3366ff);  // 파란색
    this.makeRect('mother',   40, 56, 0xff66aa);  // 분홍
    this.makeRect('computer', 48, 40, 0x444444);  // 회색
    this.makeRect('item-water',     24, 24, 0x66ccff);
    this.makeRect('item-hotChoco',  24, 24, 0x885522);
    // ... 나머지 아이템들
    this.makeRect('terrain-shade',  64, 64, 0x445555);
    this.makeRect('terrain-normal', 64, 64, 0xddccaa);
    this.makeRect('terrain-asphalt',64, 64, 0x222222);
  }

  loadFinalAssets() {
    this.load.image('player',   'assets/images/final/player.png');
    this.load.image('mother',   'assets/images/final/mother.png');
    // ... 키는 그대로, 경로만 바뀜
  }

  makeRect(key, w, h, color) {
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillRect(0, 0, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  create() {
    this.scene.start('HomeScene');
  }
}
```

이렇게 하면 게임 코드 전체에서 `this.add.sprite(x, y, 'player')` 처럼 키만 쓰니까,  
나중에 그래픽이 완성되면 **BootScene에서 한 줄만 바꾸면** 전부 교체돼요.

---

## 7. 데이터 전달 패턴

씬끼리 데이터를 주고받을 때 `scene.start` 두 번째 인자를 사용해요.

```javascript
// TimeSelectScene → ErrandScene
this.scene.start('ErrandScene', {
  hour: 14,
  temperature: 36
});

// ErrandScene → ResultScene
this.scene.start('ResultScene', {
  gameType: 'errand',
  cleared: true,
  score: 1250,
  items: ['water', 'watermelon', 'fan'],
  remainingHeat: 45,
  remainingWater: 30
});

// ResultScene → HomeScene
this.scene.start('HomeScene', {
  lastScore: 1250
});
```

---

## 8. 코드 작성 규칙

### 명명
- 클래스: `PascalCase` (HomeScene, Player)
- 함수/변수: `camelCase` (playerSpeed, updateGauge)
- 상수: `UPPER_SNAKE_CASE` (GAME_CONFIG, ITEMS)
- 씬 키 (씬 식별자): 클래스명과 동일 (`'HomeScene'`)

### 파일 1개 = 클래스 1개
복잡해지면 디버깅이 어려워요. 한 파일엔 한 클래스/모듈만.

### 매직 넘버 금지
`if (heat > 80)` 대신 `if (heat > GAME_CONFIG.heatWarningThreshold)`.

### 주석은 "왜"를 적기
"무엇을" 하는 코드인지는 코드가 말해줘요. 왜 그렇게 짰는지를 적으세요.

---

## 9. 디버깅 도구

개발 중엔 이 옵션들을 켜두면 편해요.

```javascript
// main.js의 config에서
physics: {
  default: 'arcade',
  arcade: {
    gravity: { y: 0 },
    debug: true  // 충돌 박스가 보임. 완성되면 false로
  }
}
```

게이지나 게임 상태를 화면에 디버그 텍스트로 띄우는 것도 좋아요.

```javascript
// 어느 씬에서든
this.debugText = this.add.text(10, 10, '', { color: '#fff', fontSize: 14 });

// update에서
this.debugText.setText(`더위: ${this.heat.toFixed(1)} | 수분: ${this.water.toFixed(1)}`);
```

---

## 10. 자주 쓸 Phaser API

| 기능 | 코드 예시 |
|---|---|
| 텍스트 추가 | `this.add.text(x, y, '글자', { fontSize: 24, color: '#fff' })` |
| 이미지 추가 | `this.add.image(x, y, 'key')` |
| 스프라이트 (물리) | `this.physics.add.sprite(x, y, 'key')` |
| 키 입력 | `this.cursors = this.input.keyboard.createCursorKeys()` |
| 충돌 감지 | `this.physics.add.overlap(playerA, itemB, callback, null, this)` |
| 씬 전환 | `this.scene.start('OtherScene', { data })` |
| 시간 이벤트 | `this.time.addEvent({ delay: 1000, callback: fn, loop: true })` |
| 트윈 (애니메이션) | `this.tweens.add({ targets: obj, x: 100, duration: 500 })` |

---

## 11. 다음에 추가하면 좋을 것 (나중)

- 모듈 시스템 (ES Modules) 전환 → `<script>` 순서 신경 안 써도 됨
- 빌드 도구 (Vite 등) 도입 → 핫 리로드, 번들링
- 로컬스토리지 → 최고 점수 저장
- 타일맵 (Tiled 에디터) → 지형을 데이터로 분리
