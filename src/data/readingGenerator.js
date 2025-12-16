// 타로 전문가 해석 생성기
// 선택한 카드를 기반으로 상세한 운세 해석을 생성합니다.

// JSON 파일에서 미리 생성된 해석 텍스트 로드
let readingsData = null;
try {
  // 브라우저 환경에서는 fetch를 사용하고, Node.js 환경에서는 require를 사용
  if (typeof window !== 'undefined') {
    // 브라우저 환경: fetch로 로드 (비동기)
    fetch('/all_readings_complete.json')
      .then(response => response.json())
      .then(data => {
        readingsData = data;
      })
      .catch(err => {
        console.warn('JSON 파일을 로드할 수 없습니다. 기본 해석을 사용합니다.', err);
      });
  } else {
    // Node.js 환경: require 사용
    const fs = require('fs');
    const path = require('path');
    const jsonPath = path.join(__dirname, '../../all_readings_complete.json');
    if (fs.existsSync(jsonPath)) {
      readingsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    }
  }
} catch (err) {
  console.warn('JSON 파일을 로드할 수 없습니다. 기본 해석을 사용합니다.', err);
}

// 카드별 상세 의미 데이터
const cardMeanings = {
  "The Fool": {
    upright: {
      core: "새로움, 자유, 순수함, 모험, 즉흥성, 가능성, 통제되지 않은 에너지",
      meaning: "바보 카드는 삶의 새로운 장이 열리고 있음을 상징합니다. 익숙한 틀을 벗어나 자유롭게 나아가며, 두려움이나 계산보다는 순수한 열정과 호기심이 앞서 있습니다. 예측할 수 없는 흐름이 따라오지만, 바로 그 예상 밖의 상황 속에서 기회가 피어나는 시기입니다.",
    },
    reversed: {
      meaning: "무모함, 부주의, 불안정, 충동적 선택, 방향성 상실. 새로운 시작이 필요하지만 준비가 부족하거나 상황을 너무 가볍게 보고 있을 수 있습니다.",
    },
  },
  "The Magician": {
    upright: {
      core: "의지, 실행력, 집중력, 재능 발휘, 커뮤니케이션, 현실화",
      meaning: "마법사는 자신의 의지를 현실로 만들어내는 강력한 에너지를 보여줍니다. 당신이 가진 재능과 말솜씨, 기획력, 창의력이 빛을 발하며, 스스로 상황을 주도할 수 있는 흐름이 매우 강합니다. 무언가를 시작하기에 좋은 시기이며 추진력과 명확한 목표가 행운을 불러옵니다.",
    },
    reversed: {
      meaning: "에너지 분산, 말뿐인 계획, 거짓된 태도, 추진력 부족. 능력은 충분하지만 자신감 부족 혹은 과한 자신감으로 길을 잃을 수 있습니다.",
    },
  },
  "The High Priestess": {
    upright: {
      core: "직관, 비밀, 내면성, 지혜, 감정의 숨겨진 층위",
      meaning: "여사제는 보이지 않는 진실을 꿰뚫는 카드입니다. 당신은 깊은 통찰을 갖게 되며, 감정이나 관계에서 표면 아래의 신호를 포착하게 됩니다. 감정적으로 차분하고, 조용히 상황을 파악하는 능력이 높아집니다. 속도를 내기보다는 관찰과 준비가 필요한 시기입니다.",
    },
    reversed: {
      meaning: "억눌린 감정, 정보 부족, 직관 오류, 지나친 의심. 판단이 흐려질 수 있고 숨겨진 문제가 드러나지 않은 상태일 수 있습니다.",
    },
  },
  "The Empress": {
    upright: {
      core: "풍요, 성장, 안정, 창조적 에너지, 사랑, 보상",
      meaning: "여제는 풍요와 성장을 상징합니다. 당신이 노력한 것들이 구체적인 형태로 나타나고, 물질적·감정적 만족이 함께 찾아옵니다. 사랑과 배려, 안정적인 관계, 그리고 풍성한 결과물이 따라오는 시기입니다.",
    },
    reversed: {
      meaning: "과보호, 지나친 의존, 성장 지연, 감정적 불균형. 풍요가 과해져 게으름이 생기거나 관계가 답답하게 변질될 위험이 있습니다.",
    },
  },
  "The Emperor": {
    upright: {
      core: "권위, 구조, 책임, 질서, 강인함, 리더십",
      meaning: "황제는 체계를 구축하고 책임을 지는 카드입니다. 당신의 결정력이 높아지고 상황을 명확하게 통제할 수 있는 힘이 주어집니다. 이성적이고 현실적인 판단이 중요하며, 목표를 향한 단단한 발걸음을 보여줍니다.",
    },
    reversed: {
      meaning: "고집, 권위적 태도, 무질서, 책임 회피. 통제가 과하거나 부족해 균형이 무너질 수 있습니다.",
    },
  },
  "The Hierophant": {
    upright: {
      core: "전통, 조언, 신뢰, 규칙, 윤리, 배움",
      meaning: "교황은 올바른 길, 사회적 규범, 믿음, 그리고 도움을 상징합니다. 안정적인 조언을 받을 수 있으며, 누군가의 가르침이나 제도가 당신을 돕습니다. 정직함과 윤리가 중요한 시기입니다.",
    },
    reversed: {
      meaning: "관습의 틀, 고리타분함, 반항, 잘못된 조언. 전통적인 방식에서 벗어나고 싶을 때 나타나기도 합니다.",
    },
  },
  "The Lovers": {
    upright: {
      core: "사랑, 선택, 감정적 교류, 중요한 결정",
      meaning: "관계와 감정이 깊어지는 시기입니다. 연인, 동료, 팀 등 누군가와의 조화로운 교류가 강하게 작용합니다. 또한 삶에 큰 영향을 미칠 '중대한 선택'을 의미합니다.",
    },
    reversed: {
      meaning: "갈등, 감정적 혼란, 잘못된 선택, 가치 충돌. 관계에서 의사소통이 어려울 수 있습니다.",
    },
  },
  "The Chariot": {
    upright: {
      core: "승리, 속도, 의지, 돌파, 추진력, 집중",
      meaning: "강한 의지로 목표를 돌파하는 시기입니다. 당신의 결단력과 속도가 모든 일을 앞당기며, 성공의 기운이 매우 강합니다.",
    },
    reversed: {
      meaning: "과속, 통제 불능, 방향 상실, 무모한 추진. 속도는 빠지만 중심은 흔들릴 수 있습니다.",
    },
  },
  "Strength": {
    upright: {
      core: "내적 강함, 인내, 포용, 자제력, 자신감",
      meaning: "당신이 가진 부드럽고 단단한 힘이 빛을 발합니다. 문제를 억지로 밀어붙이기보다 조용히 다스릴 수 있는 능력이 생깁니다.",
    },
    reversed: {
      meaning: "의지 약화, 감정 폭발, 불안정한 자신감. 조급함이 상황을 악화시킬 수 있습니다.",
    },
  },
  "The Hermit": {
    upright: {
      core: "고독, 성찰, 지혜, 탐구, 내면 안내",
      meaning: "은둔자는 혼자만의 시간 속에서 해답을 찾는 카드입니다. 내적인 깨달음, 자기만의 길 찾기, 깊은 사색이 중요합니다.",
    },
    reversed: {
      meaning: "고립, 지나친 혼자만의 세계, 소통 부족. 스스로 벽을 세울 위험이 있습니다.",
    },
  },
  "Wheel of Fortune": {
    upright: {
      core: "변화, 운명적 흐름, 기회, 전환점",
      meaning: "예상치 못한 행운, 중요한 전환점, 기회의 물줄기가 열립니다. 상황이 빠르게 움직입니다.",
    },
    reversed: {
      meaning: "지연, 불운, 반복되는 패턴. 의지로 바꾸기 어려운 흐름이 나타날 수 있습니다.",
    },
  },
  "Justice": {
    upright: {
      core: "균형, 공정함, 원인과 결과, 진실",
      meaning: "당신의 선택과 행동이 정확한 결과로 돌아오는 시기입니다. 결과는 매우 공정하고, 균형 잡힌 판단이 중요합니다.",
    },
    reversed: {
      meaning: "불공정함, 오판, 책임 회피.",
    },
  },
  "The Hanged Man": {
    upright: {
      core: "희생, 시각 전환, 멈춤, 새로운 인식",
      meaning: "잠시 멈춰 바라볼 필요가 있습니다. 조급함을 버리고 다른 각도에서 상황을 보아야 합니다.",
    },
    reversed: {
      meaning: "헛된 희생, 지연, 답답함, 고착.",
    },
  },
  "Death": {
    upright: {
      core: "종결, 변화, 재탄생, 전환, 낡은 것의 정리",
      meaning: "무언가 명확히 끝나고 새로운 것이 시작될 준비가 됩니다. 큰 변화가 운세를 뒤흔드는 시기입니다.",
    },
    reversed: {
      meaning: "종결 거부, 변화 지연, 집착.",
    },
  },
  "Temperance": {
    upright: {
      core: "조화, 균형, 흐름, 인내, 중용",
      meaning: "모든 것이 알맞은 조율 속에서 진행됩니다. 과하거나 부족함 없이 자연스러운 순환이 이루어집니다.",
    },
    reversed: {
      meaning: "균형 상실, 과함·부족함, 조절 실패.",
    },
  },
  "The Devil": {
    upright: {
      core: "유혹, 집착, 중독, 충동, 속박",
      meaning: "강한 욕망이 작용하는 시기입니다. 좋지 않은 관계나 습관이 당신을 유혹할 수 있습니다.",
    },
    reversed: {
      meaning: "해방, 중독 탈출, 집착에서 벗어남.",
    },
  },
  "The Tower": {
    upright: {
      core: "붕괴, 충격, 진실 폭로, 재정비",
      meaning: "예상치 못한 변화나 충격이 찾아옵니다. 하지만 이 무너짐은 새롭게 쌓기 위한 기반입니다.",
    },
    reversed: {
      meaning: "피할 수 없는 변화, 작은 경고, 지연된 붕괴.",
    },
  },
  "The Star": {
    upright: {
      core: "희망, 영감, 치유, 감정 안정",
      meaning: "당신은 밝은 희망과 안정된 감정을 얻게 됩니다. 영감과 치유의 기운이 강합니다.",
    },
    reversed: {
      meaning: "희망 상실, 실망, 에너지 부족.",
    },
  },
  "The Moon": {
    upright: {
      core: "불안, 환상, 상상력, 감정의 파동",
      meaning: "감정이 예민해지고 예측 불가능한 흐름이 등장합니다. 섣부른 판단은 피하는 것이 좋습니다.",
    },
    reversed: {
      meaning: "진실 드러남, 혼란 해소.",
    },
  },
  "The Sun": {
    upright: {
      core: "성공, 기쁨, 활력, 행복, 성장",
      meaning: "모든 면에서 밝은 에너지가 함께합니다. 행운, 성취, 건강, 관계 모두 긍정적입니다.",
    },
    reversed: {
      meaning: "과한 자신감, 일시적 지연, 피로.",
    },
  },
  "Judgement": {
    upright: {
      core: "부활, 결단, 깨달음, 결과 발표",
      meaning: "과거의 선택이 결과로 나타나는 시기입니다. 재평가가 이루어지고 중요한 통찰을 갖게 됩니다.",
    },
    reversed: {
      meaning: "결정 지연, 과거 미련, 기회 놓침.",
    },
  },
  "The World": {
    upright: {
      core: "완성, 성취, 안정, 순환의 마무리, 새로운 도약",
      meaning: "하나의 사이클이 완벽하게 완성됩니다. 평화롭고 안정적인 기운이 들어오며 목표가 성취됩니다.",
    },
    reversed: {
      meaning: "마무리 지연, 부족한 완성, 다음 단계의 준비 미흡.",
    },
  },
};

// 카드의 기본 의미를 가져오는 헬퍼 함수
function getCardMeaning(card) {
  // 전달된 카드 객체에 upright와 reversed가 직접 있는 경우
  if (card.upright !== undefined && card.reversed !== undefined) {
    let uprightText = "";
    let reversedText = "";
    
    if (typeof card.upright === 'string') {
      uprightText = card.upright;
    } else if (Array.isArray(card.upright)) {
      uprightText = card.upright[0] || "";
    } else if (card.upright && typeof card.upright === 'object') {
      uprightText = card.upright.meaning || card.upright.core || "";
    }
    
    if (typeof card.reversed === 'string') {
      reversedText = card.reversed;
    } else if (Array.isArray(card.reversed)) {
      reversedText = card.reversed[0] || "";
    } else if (card.reversed && typeof card.reversed === 'object') {
      reversedText = card.reversed.meaning || "";
    }
    
    return {
      description: card.description || "",
      upright: uprightText,
      reversed: reversedText,
    };
  }
  
  // cardMeanings에서 찾기
  const cardData = cardMeanings[card.name];
  if (cardData) {
    return {
      description: cardData.upright?.core || "",
      upright: cardData.upright?.meaning || "",
      reversed: cardData.reversed?.meaning || "",
    };
  }
  
  return {
    description: "",
    upright: "카드의 의미를 해석하는 중입니다.",
    reversed: "카드의 의미를 해석하는 중입니다.",
  };
}

// 카드 방향 표시 문자열 생성
function getCardDirectionString(card) {
  const isReversed = card.isReversed || false;
  return isReversed ? "(역방향)" : "(정방향)";
}

// 상세한 해석 생성 헬퍼 함수 (카드 이름, 의미, 위치, 타입 기반)
// 각 카드마다 독립적이고 상세한 해석 생성 (5-7문장, 템플릿 없음)
function generateDetailedReading(card, timePosition, fortuneType) {
  const isReversed = card.isReversed || false;
  const cardName = card.name;
  const direction = isReversed ? "역방향" : "정방향";
  
  // JSON 파일에서 해당 해석 찾기 (동기적으로 확인)
  if (readingsData && Array.isArray(readingsData)) {
    // timePosition과 fortuneType을 JSON의 type 형식으로 변환
    let typeKey = "";
    if (fortuneType === "daily") {
      if (timePosition === "morning") typeKey = "아침";
      else if (timePosition === "noon") typeKey = "점심";
      else if (timePosition === "night") typeKey = "저녁";
    } else if (fortuneType === "money") {
      if (timePosition === "past") typeKey = "금전운-과거";
      else if (timePosition === "present") typeKey = "금전운-현재";
      else if (timePosition === "future") typeKey = "금전운-미래";
    } else if (fortuneType === "love") {
      if (timePosition === "past") typeKey = "애정운-과거";
      else if (timePosition === "present") typeKey = "애정운-현재";
      else if (timePosition === "future") typeKey = "애정운-미래";
    } else if (fortuneType === "health") {
      if (timePosition === "past") typeKey = "건강운-과거";
      else if (timePosition === "present") typeKey = "건강운-현재";
      else if (timePosition === "future") typeKey = "건강운-미래";
    } else if (fortuneType === "business") {
      if (timePosition === "past") typeKey = "사업운-과거";
      else if (timePosition === "present") typeKey = "사업운-현재";
      else if (timePosition === "future") typeKey = "사업운-미래";
    }
    
    // JSON에서 일치하는 항목 찾기
    if (typeKey) {
      const matchedReading = readingsData.find(
        item => item.card === cardName && 
                item.direction === direction && 
                item.type === typeKey
      );
      
      if (matchedReading && matchedReading.text) {
        return matchedReading.text;
      }
    }
  }
  
  // JSON에서 찾지 못한 경우 기존 로직 사용
  const meaning = getCardMeaning(card);
  const cardMeaning = isReversed ? meaning.reversed : meaning.upright;
  const cardData = cardMeanings[cardName];
  const coreKeywords = isReversed 
    ? (cardData?.reversed?.meaning || "").split(/[,\s]+/).filter(Boolean)
    : (cardData?.upright?.core || "").split(/[,\s]+/).filter(Boolean);
  
  // 시간/위치별 맥락
  const timeContexts = {
    morning: {
      intro: "아침 시간대에",
      flow: "하루를 시작하는 초기 단계에서",
      energy: "새로운 시작의 에너지가",
      action: "첫 발걸음을 내딛는",
    },
    noon: {
      intro: "점심 시간대에",
      flow: "하루가 활발하게 전개되는 중반 단계에서",
      energy: "진행 중인 활동의 에너지가",
      action: "목표를 향해 나아가는",
    },
    night: {
      intro: "저녁 시간대에",
      flow: "하루를 마무리하는 후반 단계에서",
      energy: "정리와 안정의 에너지가",
      action: "하루를 마무리하는",
    },
    past: {
      intro: "과거 시기에",
      flow: "지나간 시간 속에서",
      energy: "과거의 경험이",
      action: "과거에 경험했던",
    },
    present: {
      intro: "현재 시점에",
      flow: "지금 이 순간에",
      energy: "현재 작용하는 에너지가",
      action: "현재 진행 중인",
    },
    future: {
      intro: "미래 시기에",
      flow: "앞으로 다가올 시간 속에서",
      energy: "미래의 가능성이",
      action: "미래에 펼쳐질",
    },
  };
  
  // 운세 타입별 특화 맥락
  const fortuneContexts = {
    daily: {
      focus: "오늘 하루의 흐름",
      detail: "시간의 흐름에 따른 변화",
      advice: "하루를 보내는 방식",
    },
    love: {
      focus: "애정 관계와 감정의 흐름",
      detail: "연인이나 중요한 사람과의 관계",
      advice: "감정적 교류와 소통",
    },
    money: {
      focus: "금전 흐름과 재정 상황",
      detail: "투자, 소비, 수입과 관련된 재정",
      advice: "금전 관리와 재정 계획",
    },
    business: {
      focus: "사업 흐름과 기회",
      detail: "사업 전략과 파트너십",
      advice: "사업 실행과 성장",
    },
    health: {
      focus: "건강 상태와 웰빙",
      detail: "신체적, 정신적 건강",
      advice: "건강 관리와 생활습관",
    },
  };
  
  const timeCtx = timeContexts[timePosition] || timeContexts.present;
  const fortuneCtx = fortuneContexts[fortuneType] || fortuneContexts.daily;
  
  // 카드 의미를 기반으로 각 카드마다 완전히 다른 상세한 해석 생성
  // 반복 문장 없이 독립적으로 작성
  
  // 카드의 핵심 키워드를 활용하여 다양한 표현으로 확장
  const keywordVariations = {
    "새로움": ["새로운 시작", "익숙하지 않은 영역", "미지의 가능성"],
    "자유": ["자유로운 선택", "구속 없는 흐름", "독립적인 움직임"],
    "의지": ["강한 결심", "확고한 의지력", "목표를 향한 집중"],
    "직관": ["내면의 목소리", "깊은 통찰", "보이지 않는 신호"],
    "풍요": ["풍성한 결과", "넘치는 에너지", "풍부한 기회"],
  };
  
  // 과거(past) 해석: 상황 설명만, 생동감 있는 묘사
  if (timePosition === "past") {
    return generatePastReading(card, cardMeaning, isReversed, fortuneType, cardName);
  }
  
  // 현재(present) 해석: 상황 설명 + 부드러운 조언
  if (timePosition === "present") {
    return generatePresentReading(card, cardMeaning, isReversed, fortuneType, cardName);
  }
  
  // 미래(future) 해석: 방향성/가능성/준비
  if (timePosition === "future") {
    return generateFutureReading(card, cardMeaning, isReversed, fortuneType, cardName);
  }
  
  // daily 타입 (morning, noon, night)은 기존 로직 유지
  let reading = "";
  
  // 첫 문장: 시간/위치 맥락과 카드 등장
  reading += `${timeCtx.intro} 나타난 ${cardName} 카드는 ${cardMeaning}을(를) 전달하고 있습니다. `;
  
  // 두 번째 문장: 구체적인 상황 묘사
  reading += `${timeCtx.flow} ${fortuneCtx.focus}에 이러한 에너지가 작용하며, ${fortuneCtx.detail}에 영향을 미치고 있습니다. `;
  
  // 세 번째 문장: 카드의 의미를 깊이 있게 해석
  if (isReversed) {
    reading += `역방향으로 나타난 이 카드는 내부적이거나 지연된 형태로 그 의미가 발현될 수 있으며, 주의 깊은 관찰이 필요한 시기입니다. `;
  } else {
    reading += `정방향으로 나타난 이 카드는 명확하고 직접적인 형태로 그 의미가 발현되며, 적극적인 대응이 가능한 시기입니다. `;
  }
  
  // 네 번째 문장: 구체적인 조언
  reading += `${fortuneCtx.advice}에 있어서 카드가 가리키는 방향을 고려하여 신중하게 판단하고 행동하는 것이 중요합니다. `;
  
  // 다섯 번째 문장: 상황의 전개
  reading += `${timeCtx.energy} ${fortuneCtx.focus}에 지속적으로 영향을 미치며, 이러한 흐름 속에서 새로운 가능성이나 변화가 감지될 수 있습니다. `;
  
  // 여섯 번째 문장: 개인적인 적용
  reading += `개인적으로는 ${timeCtx.action} 과정에서 카드의 메시지를 깊이 있게 받아들이고, 현재 상황에 맞게 적용해보는 것이 도움이 될 것입니다. `;
  
  // 일곱 번째 문장: 마무리와 전망
  if (timePosition === "night") {
    reading += `앞으로의 흐름을 긍정적으로 준비하면서도, 카드가 전하는 메시지를 바탕으로 현명한 선택을 하시기 바랍니다.`;
  } else {
    reading += `지금 이 순간의 선택과 행동이 앞으로의 결과에 영향을 미칠 수 있으니, 카드의 의미를 참고하여 최선의 방향을 찾아가시기 바랍니다.`;
  }
  
  return reading;
}

// 과거(past) 해석 생성: 상황 설명만, 생동감 있는 묘사 (최소 4문장)
function generatePastReading(card, cardMeaning, isReversed, fortuneType, cardName) {
  const meaning = getCardMeaning(card);
  const cardData = cardMeanings[cardName];
  const coreMeaning = isReversed ? meaning.reversed : meaning.upright;
  
  // 운세 타입별 과거 상황 묘사 템플릿
  const fortuneContexts = {
    love: {
      reversed: {
        intro: "그때는 관계에서",
        emotion: "마음이 쉽게 흔들리고",
        situation: "서로의 마음이 닿지 않아",
        detail: "주변의 작은 변화에도 예민하게 반응하며",
      },
      upright: {
        intro: "그때는",
        emotion: "깊은 감정적 교류가 흘렀고",
        situation: "서로를 이해하고 배려하는",
        detail: "따뜻한 시간들이 이어졌던",
      },
    },
    money: {
      reversed: {
        intro: "그때는 금전 상황에서",
        emotion: "돈에 대한 걱정이 마음을 무겁게 만들었고",
        situation: "계획 없이 지출하거나",
        detail: "재정 흐름이 불안정했던",
      },
      upright: {
        intro: "그때는",
        emotion: "안정적인 수입이 있었고",
        situation: "노력한 만큼 보상이 따랐던",
        detail: "금전적으로 여유가 생기며 마음이 편해졌던",
      },
    },
    business: {
      reversed: {
        intro: "그때는 사업에서",
        emotion: "방향을 잃고 막막했던",
        situation: "계획이 제대로 실행되지 않았거나",
        detail: "파트너십이나 협력에서 어려움이 있었던",
      },
      upright: {
        intro: "그때는",
        emotion: "강한 의지로 목표를 향해 나아갔고",
        situation: "기회를 잘 포착하고 실행했던",
        detail: "리더십과 기획력이 빛을 발하며 성장했던",
      },
    },
    health: {
      reversed: {
        intro: "그때는 건강에서",
        emotion: "몸과 마음의 균형이 깨졌고",
        situation: "건강 관리가 소홀했거나",
        detail: "무리한 생활습관으로 인해 피로가 누적되었던",
      },
      upright: {
        intro: "그때는",
        emotion: "건강한 생활습관을 유지했고",
        situation: "몸과 마음이 안정을 찾아가던",
        detail: "활력이 넘치고 에너지가 충만했던",
      },
    },
  };
  
  const context = fortuneContexts[fortuneType];
  if (!context) {
    // 기본 과거 해석
    if (isReversed) {
      return `그때는 ${coreMeaning}했을 가능성이 있습니다. 당시에는 내부적이거나 지연된 형태로 이러한 상황이 전개되었던 것으로 보입니다. 그 시기만의 어려움이나 갈등이 있었던 흐름이 보여요. 마음 한편에는 불안이나 답답함이 자리 잡고 있었을 거예요.`;
    } else {
      return `당시에는 ${coreMeaning}한 흐름이 있었던 것으로 보입니다. 그때는 명확하고 직접적인 형태로 이러한 기운이 작용했을 거예요. 그 시기만의 특별한 분위기나 감정이 흘렀던 순간이었을 가능성이 있습니다. 마음이 가볍고 희망적인 에너지가 감돌았을 것입니다.`;
    }
  }
  
  const ctx = isReversed ? context.reversed : context.upright;
  
  // 카드별 상징적 묘사
  const symbolicDescriptions = {
    "Justice": {
      reversed: "마음의 저울이 한쪽으로 기울어 있었던",
      upright: "공정하고 균형 잡힌 판단이 있었던",
    },
    "The Fool": {
      reversed: "무모하게 앞만 보고 달려갔던",
      upright: "새로운 시작에 대한 설렘이 가득했던",
    },
    "The Magician": {
      reversed: "재능을 제대로 발휘하지 못했던",
      upright: "의지와 실행력이 빛을 발했던",
    },
    "The High Priestess": {
      reversed: "직관이 흐려지고 혼란스러웠던",
      upright: "깊은 통찰과 내면의 지혜가 작용했던",
    },
  };
  
  const symbol = symbolicDescriptions[cardName] || {};
  const symbolText = isReversed ? symbol.reversed : symbol.upright;
  
  // 최소 4문장으로 구성
  let reading = "";
  
  // 첫 번째 문장: 기본 상황
  reading += `${ctx.intro} ${coreMeaning}했을 가능성이 있습니다. `;
  
  // 두 번째 문장: 감정적 묘사
  reading += `당시에는 ${ctx.emotion} ${ctx.situation} 흐름이 있었던 것으로 보입니다. `;
  
  // 세 번째 문장: 상징적 묘사
  if (symbolText) {
    reading += `${symbolText} 시기였을 거예요. `;
  } else {
    reading += `${ctx.detail} 순간이었을 가능성이 있습니다. `;
  }
  
  // 네 번째 문장: 생생한 장면 묘사
  if (fortuneType === "love") {
    if (isReversed) {
      reading += `그때의 당신은 마음속 저울의 무게를 스스로 이해하기 위해 애썼던, 결정 앞에서 오래 머뭇거렸던 순간이었을 것입니다.`;
    } else {
      reading += `그때의 당신은 서로의 마음을 읽으며 조화를 찾아갔던, 따뜻한 감정이 흘렀던 순간이었을 거예요.`;
    }
  } else if (fortuneType === "money") {
    if (isReversed) {
      reading += `그때의 당신은 재정에 대한 불안이 마음을 짓눌렀던, 계획 없이 흔들렸던 순간이었을 가능성이 있습니다.`;
    } else {
      reading += `그때의 당신은 노력한 만큼의 보상이 찾아왔던, 금전적 여유가 마음을 편하게 만들었던 순간이었을 거예요.`;
    }
  } else if (fortuneType === "business") {
    if (isReversed) {
      reading += `그때의 당신은 목표를 향해 가는 길이 막막하게 느껴졌던, 추진력이 부족해 답답했던 순간이었을 가능성이 있습니다.`;
    } else {
      reading += `그때의 당신은 강한 의지로 목표를 향해 나아갔던, 기회를 포착하며 성장했던 순간이었을 거예요.`;
    }
  } else {
    if (isReversed) {
      reading += `그때의 당신은 몸과 마음의 균형을 잃어가던, 피로가 쌓이며 힘들었던 순간이었을 가능성이 있습니다.`;
    } else {
      reading += `그때의 당신은 건강한 에너지가 넘쳤던, 활력이 가득했던 순간이었을 거예요.`;
    }
  }
  
  return reading;
}

// 현재(present) 해석 생성: 상황 설명 + 부드러운 조언 (최소 4문장)
function generatePresentReading(card, cardMeaning, isReversed, fortuneType, cardName) {
  const meaning = getCardMeaning(card);
  const coreMeaning = isReversed ? meaning.reversed : meaning.upright;
  
  // 카드별 상징
  const cardSymbols = {
    "Justice": {
      reversed: "저울",
      upright: "저울",
    },
    "The Fool": {
      reversed: "절벽",
      upright: "여행 가방",
    },
    "The Magician": {
      reversed: "도구",
      upright: "마법 지팡이",
    },
    "The High Priestess": {
      reversed: "베일",
      upright: "달",
    },
  };
  
  const symbol = cardSymbols[cardName] || { reversed: "상징", upright: "상징" };
  const symbolText = isReversed ? symbol.reversed : symbol.upright;
  
  // 최소 4문장으로 구성
  let reading = "";
  
  // 첫 번째 문장: 현재 상황
  if (fortuneType === "love") {
    if (isReversed) {
      reading += `지금은 관계에서 감정의 균형을 잡아야 하는 순간으로 보입니다. `;
    } else {
      reading += `지금은 감정이 깊어지고 관계가 성장하는 시기로 보입니다. `;
    }
  } else if (fortuneType === "money") {
    if (isReversed) {
      reading += `지금은 금전 흐름에 주의가 필요한 시기로 보입니다. `;
    } else {
      reading += `지금은 재정 상황이 안정되거나 기회가 찾아올 수 있는 시기로 보입니다. `;
    }
  } else if (fortuneType === "business") {
    if (isReversed) {
      reading += `지금은 사업 흐름에 신중함이 필요한 시기로 보입니다. `;
    } else {
      reading += `지금은 사업 기회가 열리거나 목표를 향해 나아갈 수 있는 시기로 보입니다. `;
    }
  } else {
    if (isReversed) {
      reading += `지금은 건강 관리에 주의가 필요한 시기로 보입니다. `;
    } else {
      reading += `지금은 건강이 회복되거나 활력이 넘치는 시기로 보입니다. `;
    }
  }
  
  // 두 번째 문장: 감정이나 관계의 상태 묘사
  if (fortuneType === "love") {
    if (isReversed) {
      reading += `작은 오해가 크게 번질 수 있는 시기라, 한 걸음 물러서서 상황을 차분히 바라보는 태도가 필요해 보입니다. `;
    } else {
      reading += `서로를 이해하고 배려하는 따뜻한 교류가 이어질 수 있어요. `;
    }
  } else if (fortuneType === "money") {
    if (isReversed) {
      reading += `계획 없는 지출을 피하고, 신중하게 판단하는 것이 도움이 됩니다. `;
    } else {
      reading += `노력한 만큼 보상이 따를 수 있으니, 계획적으로 관리해 보세요. `;
    }
  } else if (fortuneType === "business") {
    if (isReversed) {
      reading += `성급한 결정보다는 차근차근 준비하는 것이 도움이 됩니다. `;
    } else {
      reading += `강한 의지와 실행력이 성공으로 이어질 수 있어요. `;
    }
  } else {
    if (isReversed) {
      reading += `무리하지 말고 휴식과 균형을 찾는 것이 도움이 됩니다. `;
    } else {
      reading += `규칙적인 생활습관이 몸과 마음에 좋은 영향을 줄 수 있어요. `;
    }
  }
  
  // 세 번째 문장: 상징 활용
  if (cardName === "Justice") {
    if (isReversed) {
      reading += `가까운 관계에서는 서로의 입장이 살짝 엇갈릴 수 있으니, 말보다 표정이나 분위기를 먼저 읽어보는 것이 좋습니다. `;
    } else {
      reading += `카드가 보여주는 저울은 '공정한 판단이 관계를 돈독하게 만든다'는 의미를 담고 있어요. `;
    }
  } else {
    reading += `카드가 말하는 ${symbolText}은(는) '${isReversed ? "신중하게" : "적극적으로"} 나아가라'는 메시지를 전하고 있어요. `;
  }
  
  // 네 번째 문장: 부드러운 조언 또는 관찰
  if (fortuneType === "love") {
    if (isReversed) {
      reading += `지금 이 순간, 감정에 치우치지 않고 상황을 객관적으로 바라보는 것이 관계를 지키는 열쇠가 될 수 있습니다.`;
    } else {
      reading += `지금 이 순간, 서로의 마음을 열고 진심을 나누는 것이 관계를 더 깊게 만들어 갈 거예요.`;
    }
  } else if (fortuneType === "money") {
    if (isReversed) {
      reading += `지금 이 순간, 서두르지 말고 기다리는 것이 더 나은 선택을 만날 수 있습니다.`;
    } else {
      reading += `지금 이 순간, 현명한 선택이 부를 가져올 수 있는 기회가 열려 있어요.`;
    }
  } else if (fortuneType === "business") {
    if (isReversed) {
      reading += `지금 이 순간, 기초를 다지고 준비하는 것이 더 큰 성공으로 이어질 수 있습니다.`;
    } else {
      reading += `지금 이 순간, 목표를 향해 전진하는 것이 성취로 이어질 거예요.`;
    }
  } else {
    if (isReversed) {
      reading += `지금 이 순간, 뿌리를 튼튼히 하고 휴식을 취하는 것이 회복의 첫걸음이 될 수 있습니다.`;
    } else {
      reading += `지금 이 순간, 에너지를 충전하고 활력을 유지하는 것이 건강을 지키는 열쇠가 될 거예요.`;
    }
  }
  
  return reading;
}

// 미래(future) 해석 생성: 방향성/가능성/준비 (최소 4문장)
function generateFutureReading(card, cardMeaning, isReversed, fortuneType, cardName) {
  const meaning = getCardMeaning(card);
  const coreMeaning = isReversed ? meaning.reversed : meaning.upright;
  
  // 최소 4문장으로 구성
  let reading = "";
  
  // 첫 번째 문장: 미래 가능성 (단정적이지 않게)
  if (fortuneType === "love") {
    if (isReversed) {
      reading += `앞으로는 관계에서 갈등이나 감정적 혼란이 생길 수 있습니다. `;
    } else {
      reading += `앞으로는 관계가 더욱 깊어지고 조화로워질 가능성이 있습니다. `;
    }
  } else if (fortuneType === "money") {
    if (isReversed) {
      reading += `앞으로는 재정 상황에 주의가 필요할 수 있습니다. `;
    } else {
      reading += `앞으로는 재정 상황이 안정되거나 기회가 찾아올 가능성이 있습니다. `;
    }
  } else if (fortuneType === "business") {
    if (isReversed) {
      reading += `앞으로는 사업 흐름에 어려움이 있을 수 있습니다. `;
    } else {
      reading += `앞으로는 사업 목표를 달성하거나 성장할 가능성이 있습니다. `;
    }
  } else {
    if (isReversed) {
      reading += `앞으로는 건강 관리에 더 신경 써야 할 수 있습니다. `;
    } else {
      reading += `앞으로는 건강이 회복되거나 활력이 넘칠 가능성이 있습니다. `;
    }
  }
  
  // 두 번째 문장: 긍정/주의 요소의 균형
  if (isReversed) {
    if (fortuneType === "love") {
      reading += `그러나 솔직한 대화와 이해하려는 노력이 도움이 될 거예요. `;
    } else if (fortuneType === "money") {
      reading += `그러나 신중한 계획과 관리가 도움이 될 거예요. `;
    } else if (fortuneType === "business") {
      reading += `그러나 차근차근 준비하고 기다리면 기회가 올 거예요. `;
    } else {
      reading += `그러나 규칙적인 생활과 휴식이 도움이 될 거예요. `;
    }
  } else {
    if (fortuneType === "love") {
      reading += `서로를 이해하고 배려하는 따뜻한 시간이 이어질 수 있어요. `;
    } else if (fortuneType === "money") {
      reading += `노력한 만큼 보상이 따를 수 있으니, 계획적으로 준비해 보세요. `;
    } else if (fortuneType === "business") {
      reading += `강한 의지와 실행력이 성공으로 이어질 수 있어요. `;
    } else {
      reading += `규칙적인 생활습관이 몸과 마음에 좋은 영향을 줄 수 있어요. `;
    }
  }
  
  // 세 번째 문장: 카드 이미지 상징적 힌트
  if (cardName === "Justice") {
    if (isReversed) {
      reading += `앞으로는 천천히 균형을 되찾게 되지만, 결정을 내릴 때는 감정에 치우치지 않도록 마음의 저울을 다시 한 번 들여다보는 것이 도움이 됩니다. `;
    } else {
      reading += `카드가 보여주는 저울은 '공정한 판단이 올바른 길을 만든다'는 의미를 담고 있어요. `;
    }
  } else if (cardName === "The Fool") {
    if (isReversed) {
      reading += `카드가 보여주는 절벽은 '신중한 선택이 필요하다'는 경고를 전하고 있어요. `;
    } else {
      reading += `카드가 말하는 여행 가방은 '새로운 모험이 기다린다'는 희망의 메시지를 전해요. `;
    }
  } else if (cardName === "The Magician") {
    if (isReversed) {
      reading += `카드가 보여주는 도구는 '재능을 제대로 활용하라'는 의미입니다. `;
    } else {
      reading += `카드가 말하는 마법 지팡이는 '의지가 현실을 만든다'는 힘찬 메시지를 전해요. `;
    }
  } else {
    if (isReversed) {
      reading += `카드가 보여주는 상징은 '신중한 준비가 필요하다'는 의미입니다. `;
    } else {
      reading += `카드가 말하는 상징은 '긍정적인 변화가 기다린다'는 희망의 메시지를 전해요. `;
    }
  }
  
  // 네 번째 문장: 준비해야 할 마음가짐
  if (fortuneType === "love") {
    if (isReversed) {
      reading += `앞으로의 관계를 위해 지금부터 소통의 다리를 놓아가는 것이 중요할 거예요.`;
    } else {
      reading += `앞으로의 관계를 위해 지금부터 진심을 나누고 서로를 이해하려는 노력이 필요할 거예요.`;
    }
  } else if (fortuneType === "money") {
    if (isReversed) {
      reading += `앞으로의 재정을 위해 지금부터 현명한 선택을 준비하는 것이 중요할 거예요.`;
    } else {
      reading += `앞으로의 재정을 위해 지금부터 계획적으로 준비하는 것이 풍요로 이어질 거예요.`;
    }
  } else if (fortuneType === "business") {
    if (isReversed) {
      reading += `앞으로의 사업을 위해 지금부터 기초를 다지고 준비하는 것이 중요할 거예요.`;
    } else {
      reading += `앞으로의 사업을 위해 지금부터 목표를 향해 전진하는 것이 성취로 이어질 거예요.`;
    }
  } else {
    if (isReversed) {
      reading += `앞으로의 건강을 위해 지금부터 휴식과 균형을 찾는 것이 회복으로 이어질 거예요.`;
    } else {
      reading += `앞으로의 건강을 위해 지금부터 활력을 유지하는 것이 웰빙으로 이어질 거예요.`;
    }
  }
  
  return reading;
}

// 타로 해석을 자연스럽고 읽기 쉽게 다듬는 함수 (3-5문장)
function summarizeReading(longText) {
  if (!longText || typeof longText !== 'string') {
    return longText;
  }
  
  // 과거 해석인지 확인 (조언/미래형 표현 제거)
  const isPastReading = longText.includes("그때는") || longText.includes("당시에는") || 
                         longText.includes("과거 시기에") || longText.includes("과거의");
  
  // 문장 단위로 분리
  const sentences = longText.split(/[.!?]\s+/).filter(s => s.trim().length > 0);
  
  if (sentences.length <= 3) {
    // 이미 짧으면 어색한 표현만 수정
    let polished = polishSentence(longText);
    // 과거 해석인 경우 조언/미래형 표현 제거
    if (isPastReading) {
      polished = removeAdviceAndFuture(polished);
    }
    return polished;
  }
  
  // 핵심 정보 추출
  const cardMatch = longText.match(/(The\s+\w+|[\w\s]+)\s+카드는\s+([^을를에에가이]+?)(?:을|를|에|에|가|이|\.|,)/);
  const cardName = cardMatch ? cardMatch[1].trim() : "";
  const cardMeaning = cardMatch ? cardMatch[2].trim() : "";
  
  const timeMatch = longText.match(/(아침|점심|저녁|과거|현재|미래)/);
  const timeContext = timeMatch ? timeMatch[1] : "";
  
  const isReversed = longText.includes("역방향");
  const direction = isReversed ? "역방향" : "정방향";
  
  // 자연스러운 해석 생성 (3-5문장)
  const polishedSentences = [];
  
  // 과거 해석인 경우: 상황 설명만 (조언/미래형 제외)
  if (isPastReading) {
    // 첫 번째 문장: 과거 상황
    if (sentences[0]) {
      let pastSentence = sentences[0]
        .replace(/나타난/g, "")
        .replace(/전달하고\s+있습니다/g, "의미했을 수 있어요")
        .replace(/의미합니다/g, "의미했을 수 있어요");
      polishedSentences.push(polishSentence(pastSentence));
    }
    
    // 두 번째 문장: 구체적인 과거 상황
    if (sentences.length > 1) {
      const situationText = sentences.slice(1, 3)
        .filter(s => !s.includes("중요") && !s.includes("필요") && !s.includes("바랍니다") && !s.includes("앞으로"))
        .join(" ");
      if (situationText) {
        const polished = polishSentence(situationText);
        if (polished && polished.length > 15) {
          polishedSentences.push(polished);
        }
      }
    }
    
    // 세 번째 문장: 과거 경험의 영향 (있는 경우)
    if (sentences.length > 3) {
      const influenceText = sentences
        .find(s => s.includes("경험이") || s.includes("영향을") || s.includes("있을 수 있어요"));
      if (influenceText) {
        const polished = polishSentence(influenceText);
        if (polished && polished.length > 15) {
          polishedSentences.push(polished);
        }
      }
    }
  } else {
    // 현재/미래 해석: 일반적인 처리
    // 첫 번째 문장: 카드 소개 (부드러운 톤)
    if (cardName && cardMeaning) {
      let intro = "";
      if (timeContext) {
        intro = `${timeContext} 뽑힌 ${cardName} 카드는 ${cardMeaning}을 의미해요.`;
      } else {
        intro = `${cardName} 카드는 ${cardMeaning}을 의미합니다.`;
      }
      polishedSentences.push(intro);
    } else if (sentences[0]) {
      polishedSentences.push(polishSentence(sentences[0]));
    }
    
    // 두 번째 문장: 현재 상황 (간단하고 명확하게)
    if (sentences.length > 1) {
      const situationText = sentences.slice(1, 3).join(" ");
      const polished = polishSentence(situationText);
      if (polished && polished.length > 20) {
        polishedSentences.push(polished);
      }
    }
    
    // 세 번째 문장: 조언 (상담 톤)
    const adviceKeywords = ["중요합니다", "필요합니다", "도움이", "바랍니다", "권장", "주의", "하시기"];
    const adviceSentences = sentences.filter(s => 
      adviceKeywords.some(keyword => s.includes(keyword))
    );
    
    if (adviceSentences.length > 0) {
      const advice = polishSentence(adviceSentences[0]);
      if (advice && advice.length > 15) {
        polishedSentences.push(advice);
      }
    }
    
    // 네 번째 문장: 전망 (있는 경우)
    if (polishedSentences.length < 4 && sentences.length > 4) {
      const futureSentences = sentences.slice(4).filter(s => 
        s.includes("앞으로") || s.includes("미래") || s.includes("기대")
      );
      if (futureSentences.length > 0) {
        const future = polishSentence(futureSentences[0]);
        if (future && future.length > 15) {
          polishedSentences.push(future);
        }
      }
    }
    
    // 다섯 번째 문장: 마무리 (있는 경우)
    if (polishedSentences.length < 5 && sentences.length > 5) {
      const lastSentence = sentences[sentences.length - 1];
      const polished = polishSentence(lastSentence);
      if (polished && polished.length > 15 && !polishedSentences.some(s => s.includes(polished.substring(0, 10)))) {
        polishedSentences.push(polished);
      }
    }
  }
  
  // 최종 정리: 3-5문장으로 제한
  let finalSentences = polishedSentences.slice(0, 5);
  
  // 과거 해석인 경우 조언/미래형 표현 제거
  if (isPastReading) {
    finalSentences = finalSentences
      .map(s => removeAdviceAndFuture(s))
      .filter(s => s && s.trim().length > 0);
  }
  
  return finalSentences
    .map(s => {
      s = s.trim();
      if (!s.endsWith(".") && !s.endsWith("다") && !s.endsWith("요") && !s.endsWith("니다")) {
        return s + ".";
      }
      return s;
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

// 조언과 미래형 표현을 제거하는 함수 (과거 해석용)
function removeAdviceAndFuture(text) {
  if (!text) return "";
  
  // 조언 표현 제거
  const advicePatterns = [
    /중요합니다?/g,
    /필요합니다?/g,
    /권장합니다?/g,
    /주의하세요?/g,
    /하시기\s+바랍니다?/g,
    /참고하세요?/g,
    /판단하고\s+행동하는/g,
    /적용해보는\s+것이/g,
    /도움이\s+될\s+것입니다?/g,
    /참고하여/g,
    /참고해/g,
    /고려하여/g,
    /신중하게/g,
  ];
  
  // 미래형 표현 제거
  const futurePatterns = [
    /앞으로의/g,
    /앞으로\s+다가올/g,
    /앞으로\s+결과에/g,
    /앞으로\s+흐름을/g,
    /미래에/g,
    /향후/g,
    /기대할\s+수/g,
    /기대합니다?/g,
    /준비하세요?/g,
    /준비하는\s+것이/g,
    /선택을\s+하시기/g,
    /방향을\s+찾아가시기/g,
  ];
  
  let cleaned = text;
  
  // 조언 문장 전체 제거
  advicePatterns.forEach(pattern => {
    cleaned = cleaned.replace(new RegExp(`[^.]*${pattern.source}[^.]*\\.?`, 'g'), '');
  });
  
  // 미래형 표현 제거
  futurePatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // 빈 문장 제거
  cleaned = cleaned
    .replace(/\s+/g, " ")
    .replace(/\.\s*\./g, ".")
    .trim();
  
  return cleaned;
}

// 문장을 자연스럽게 다듬는 헬퍼 함수
function polishSentence(sentence) {
  if (!sentence) return "";
  
  let polished = sentence.trim();
  
  // 어색한 표현 제거 및 자연스럽게 수정
  polished = polished
    // '이런 작용합니다' 같은 어색한 표현 제거
    .replace(/이런\s+작용합니다/g, "이런 흐름이 있어요")
    .replace(/이러한\s+에너지가\s+작용하며/g, "이런 기운이")
    .replace(/이러한\s+에너지가\s+작용하고\s+있습니다/g, "이런 기운이 있어요")
    .replace(/작용하며/g, "영향을 미치고")
    .replace(/작용하고\s+있습니다/g, "영향을 미치고 있어요")
    .replace(/작용합니다/g, "영향을 미쳐요")
    
    // 딱딱한 표현을 부드럽게
    .replace(/나타난\s+/g, "뽑힌 ")
    .replace(/전달하고\s+있습니다/g, "의미해요")
    .replace(/의미합니다/g, "의미해요")
    .replace(/필요합니다/g, "필요해요")
    .replace(/중요합니다/g, "중요해요")
    .replace(/가능합니다/g, "가능해요")
    
    // 과도한 수식어 제거
    .replace(/지속적으로|계속해서/g, "")
    .replace(/지금\s+이\s+순간에/g, "지금")
    .replace(/앞으로의\s+흐름을/g, "앞으로")
    .replace(/앞으로의\s+결과에/g, "앞으로")
    
    // 자연스러운 표현으로 변경
    .replace(/카드가\s+전하는\s+메시지를/g, "이 카드가 말하는 것은")
    .replace(/카드의\s+의미를/g, "이 의미를")
    .replace(/카드가\s+가리키는/g, "이 카드가 보여주는")
    .replace(/받아들이고/g, "이해하고")
    .replace(/참고하여/g, "참고해서")
    .replace(/참고해\s+주시기\s+바랍니다/g, "참고해 보세요")
    
    // 부드러운 상담 톤
    .replace(/신중하게/g, "차근차근")
    .replace(/적극적으로/g, "활발하게")
    .replace(/현명하게/g, "똑똑하게")
    .replace(/긍정적으로/g, "밝게")
    .replace(/최선의/g, "좋은")
    
    // 반복 제거
    .replace(/이러한\s+흐름\s+속에서/g, "이런 흐름에서")
    .replace(/이러한\s+과정에서/g, "이 과정에서")
    .replace(/감지될\s+수\s+있습니다/g, "느낄 수 있어요")
    .replace(/영향을\s+미치며/g, "영향을 미치고")
    
    // 문장 길이 조절 (너무 긴 문장 분리)
    .replace(/([^다요니다])\s+그리고\s+/g, "$1. 그리고 ")
    .replace(/([^다요니다])\s+또한\s+/g, "$1. 또한 ")
    
    // 공백 정리
    .replace(/\s+/g, " ")
    .trim();
  
  // 문장이 너무 길면 분리
  if (polished.length > 80) {
    const parts = polished.split(/[,\s]+그리고|[,\s]+또한|[,\s]+하지만/);
    if (parts.length > 1) {
      polished = parts[0] + ".";
    }
  }
  
  return polished;
}

// daily 타입: 아침 해석 생성
function generateMorningReading(card) {
  const detailed = generateDetailedReading(card, "morning", "daily");
  return summarizeReading(detailed);
}

// daily 타입: 점심 해석 생성
function generateNoonReading(card) {
  const detailed = generateDetailedReading(card, "noon", "daily");
  return summarizeReading(detailed);
}

// daily 타입: 저녁 해석 생성
function generateNightReading(card) {
  const detailed = generateDetailedReading(card, "night", "daily");
  return summarizeReading(detailed);
}

// love 타입: 애정운 해석 생성
function generateLoveReading(card, position) {
  return generateDetailedReading(card, position, "love");
}

// money 타입: 금전운 해석 생성
function generateMoneyReading(card, position) {
  return generateDetailedReading(card, position, "money");
}

// business 타입: 사업운 해석 생성
function generateBusinessReading(card, position) {
  return generateDetailedReading(card, position, "business");
}

// health 타입: 건강운 해석 생성
function generateHealthReading(card, position) {
  return generateDetailedReading(card, position, "health");
}

// 메인 해석 생성 함수
export function generateReading(cards, type) {
  if (!cards || cards.length < 3) {
    return null;
  }

  const pastCard = cards[0];
  const presentCard = cards[1];
  const futureCard = cards[2];

  // daily 타입: 아침/점심/저녁 (카드 이름과 방향 표시 포함)
  if (type === "daily" || type === "today") {
    return {
      type: "daily",
      morningCard: `${pastCard.name} ${getCardDirectionString(pastCard)}`,
      morning: generateMorningReading(pastCard),
      noonCard: `${presentCard.name} ${getCardDirectionString(presentCard)}`,
      noon: generateNoonReading(presentCard),
      nightCard: `${futureCard.name} ${getCardDirectionString(futureCard)}`,
      night: generateNightReading(futureCard),
    };
  }

  // love, money, business, health 타입: 과거/현재/미래
  const fortuneTypes = ["love", "money", "business", "health"];
  if (fortuneTypes.includes(type)) {
    const generateFunc = {
      love: generateLoveReading,
      money: generateMoneyReading,
      business: generateBusinessReading,
      health: generateHealthReading,
    }[type];
    
    return [
      {
        position: "과거",
        cardName: `${pastCard.name} ${getCardDirectionString(pastCard)}`,
        content: generateFunc(pastCard, "past"),
      },
      {
        position: "현재",
        cardName: `${presentCard.name} ${getCardDirectionString(presentCard)}`,
        content: generateFunc(presentCard, "present"),
      },
      {
        position: "미래",
        cardName: `${futureCard.name} ${getCardDirectionString(futureCard)}`,
        content: generateFunc(futureCard, "future"),
      },
    ];
  }

  // 기본값: daily
  return {
    type: "daily",
    morningCard: `${pastCard.name} ${getCardDirectionString(pastCard)}`,
    morning: generateMorningReading(pastCard),
    noonCard: `${presentCard.name} ${getCardDirectionString(presentCard)}`,
    noon: generateNoonReading(presentCard),
    nightCard: `${futureCard.name} ${getCardDirectionString(futureCard)}`,
    night: generateNightReading(futureCard),
  };
}
