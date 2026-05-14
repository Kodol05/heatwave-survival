export const FIRST_AID_CASES = [
  {
    situation: '친구가 운동장에서 갑자기 어지럽다고 해요.',
    choices: [
      { text: '그늘로 옮기고 119에 신고', correct: true },
      { text: '햇빛을 더 받게 한다', correct: false },
      { text: '뜨거운 물을 마시게 한다', correct: false },
      { text: '그냥 두고 본다', correct: false },
    ],
    explain: '어지럼증은 온열질환 초기 증상! 그늘로 옮기고 도움을 청해야 해요.',
  },
  {
    situation: '친구가 의식을 잃고 쓰러졌어요.',
    choices: [
      { text: '즉시 119 신고', correct: true },
      { text: '얼굴에 찬물을 뿌리고 일으킨다', correct: false },
      { text: '소금을 먹인다', correct: false },
      { text: '깨어날 때까지 기다린다', correct: false },
    ],
    explain: '의식을 잃었을 땐 무조건 119가 첫 단계예요.',
  },
  {
    situation: '땀이 안 나고 피부가 뜨겁고 건조해요. (열사병 증상)',
    choices: [
      { text: '시원한 곳으로 옮기고 몸을 식혀준다', correct: true },
      { text: '담요를 덮어준다', correct: false },
      { text: '뜨거운 음료를 준다', correct: false },
      { text: '운동을 시켜 땀을 낸다', correct: false },
    ],
    explain: '열사병은 응급! 체온을 빨리 낮춰야 합니다.',
  },
  {
    situation: '운동 후 다리에 쥐가 났어요. (열경련)',
    choices: [
      { text: '시원한 곳에서 휴식 + 수분 섭취', correct: true },
      { text: '더 운동을 시킨다', correct: false },
      { text: '뜨거운 음식을 먹인다', correct: false },
      { text: '얼음으로 다리를 찜질만 한다', correct: false },
    ],
    explain: '열경련엔 수분과 휴식이 핵심이에요.',
  },
  {
    situation: '에어컨이 없는 방에서 어르신이 더위를 호소해요.',
    choices: [
      { text: '119 신고하고 시원한 곳으로 옮긴다', correct: true },
      { text: '두꺼운 옷을 입혀준다', correct: false },
      { text: '뜨거운 차를 권한다', correct: false },
      { text: '창문을 닫는다', correct: false },
    ],
    explain: '노인은 폭염에 매우 취약해요. 시원한 환경이 우선!',
  },
];
