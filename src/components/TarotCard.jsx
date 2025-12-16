import React from "react";
import { motion } from "framer-motion";

// 카드 한 장 컴포넌트 (재사용 가능)
// total: 전체 카드 개수 (22장)을 받아서 일정한 타원 궤적으로 배치
// currentStep: 현재 애니메이션 단계 (1부터 시작)
// isFlipped: 카드가 뒤집혔는지 여부 (true: 앞면, false: 뒷면)
// isSelected: 카드가 선택되었는지 여부
const TarotCard = ({ card, index, total, currentStep = 1, onClick, isFlipped = false, isSelected = false, isDragging = false }) => {
  // 0 ~ 1 사이의 비율로 각 카드 위치를 균등 분배
  const t = total > 1 ? index / (total - 1) : 0.5;

  // 각도: -40° ~ +40° 사이의 더 완만한 호 (부채꼴을 더 완만하게)
  const minDeg = -40;
  const maxDeg = 40;
  const angleDeg = minDeg + (maxDeg - minDeg) * t;
  const angleRad = (angleDeg * Math.PI) / 180;

  // 동일한 반지름 r을 사용하는 원의 "아래쪽" 부분(∪) 위에 카드 배치
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const r = isMobile ? 300 : 500; /* 모바일에서는 반지름을 작게 */
  const centerX = 0;
  const centerY = isMobile ? 200 : 390; /* 모바일에서는 centerY를 위로 */

  // x, y 좌표: 더 완만한 convex arc(∪) 생성
  const finalX = centerX + r * Math.sin(angleRad);
  const finalY = centerY - r * Math.cos(angleRad); /* centerY가 커지면 finalY도 더 아래로 */

  // 카드 회전: 기본 각도를 줄여서 더 완만하게, 양 끝에 -25도, +25도 추가
  // 왼쪽 끝(t=0): 기본 각도 - 25도
  // 중앙(t=0.5): 기본 각도
  // 오른쪽 끝(t=1): 기본 각도 + 25도
  // 그 사이는 선형 보간으로 부드럽게 변화
  const baseRotate = angleDeg * 0.3;
  const finalRotate = baseRotate - 25 + 50 * t;

  // 단계별 위치 계산 함수 (애니메이션도 동일한 굴곡 사용)
  const getCardPosition = (cardIndex) => {
    const cardT = total > 1 ? cardIndex / (total - 1) : 0.5;
    const cardAngleDeg = minDeg + (maxDeg - minDeg) * cardT;
    const cardAngleRad = (cardAngleDeg * Math.PI) / 180;
    const cardX = centerX + r * Math.sin(cardAngleRad);
    const cardY = centerY - r * Math.cos(cardAngleRad);
    const cardBaseRotate = cardAngleDeg * 0.3;
    const cardRotate = cardBaseRotate - 25 + 50 * cardT;
    return { x: cardX, y: cardY, rotate: cardRotate };
  };

  // 가장 왼쪽 카드(index 0)의 최종 위치와 각도를 계산 (초기 상태 기준)
  const leftmostPos = getCardPosition(0);
  const initialX = leftmostPos.x;
  const initialY = leftmostPos.y;
  const initialRotate = leftmostPos.rotate;
  const initialScale = 0.95; // 살짝 작게 시작해서 자연스럽게

  // 현재 단계에 따른 카드 위치 계산
  // currentStep=1: 모든 카드가 0번 위치 (1번 카드 위치)
  // currentStep=2: 1~21번 카드가 1번 위치로 이동 (2번 카드 위치)
  // currentStep=3: 2~21번 카드가 2번 위치로 이동 (3번 카드 위치)
  // ...
  // index < currentStep - 1: 이미 자신의 최종 위치에 있음 (index번 위치)
  // index >= currentStep - 1: (currentStep - 1)번 카드의 위치에 있음
  const targetCardIndex = index < currentStep - 1 ? index : currentStep - 1;
  const currentPos = getCardPosition(targetCardIndex);

  // 레이어 순서: 높은 index(위에 보이는 카드)가 더 높은 z-index
  const zIndex = index;

  // 이미 뒤집힌 카드는 클릭 불가 및 hover 효과 제거
  const isClickable = !isFlipped;

  return (
    <motion.div
      className="tarot-card-wrapper"
      style={{ zIndex }}
      initial={{
        opacity: 1,
        x: initialX,
        y: initialY,
        rotate: initialRotate,
        scale: initialScale,
      }}
      animate={{
        opacity: 1,
        x: currentPos.x, // 모바일에서도 데스크탑과 동일한 위치 사용
        y: currentPos.y,
        rotate: currentPos.rotate, // 모바일에서도 데스크탑과 동일한 회전 각도 사용
        scale: index < currentStep - 1 ? 1 : initialScale, // 자신의 최종 위치에 도달한 카드는 스케일 1
      }}
      transition={{
        // 단계별 애니메이션: 빠르게 진행 (전체 2초 내 완료)
        type: "spring",
        stiffness: 120, // 높은 강성으로 빠른 이동
        damping: 28, // 적절한 감쇠로 자연스러운 정지
        mass: 0.8, // 가벼운 무게로 빠른 반응
        // restDelta와 restSpeed를 설정하여 각 단계 위치에 정확히 도달하도록 보장
        restDelta: 0.01,
        restSpeed: 0.01,
      }}
    >
      <motion.div
        className={`tarot-card ${isFlipped ? "flipped" : ""}`}
        onClick={isClickable && !isDragging ? onClick : undefined} // 드래그 중일 때는 클릭 무시
        whileHover={isClickable ? { scale: 1.04, y: 6 } : undefined} // 이미 뒤집힌 카드는 hover 효과 없음
        whileTap={isClickable && !isDragging ? { scale: 0.98 } : undefined}
        style={{ 
          cursor: isClickable ? "pointer" : "default",
          transformStyle: "preserve-3d"
        }}
        // 카드 뒤집기 애니메이션: 모든 카드가 동일한 Y축 방향으로 뒤집힘
        // 초기 상태: 뒷면이 보임 (rotateY: 0)
        // 클릭 시: 앞면이 보임 (rotateY: 180)
        animate={{
          rotateY: isFlipped ? 180 : 0,
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* 카드 앞면/뒷면 표현 */}
        <div className="tarot-card-inner">
          {/* 뒷면: 항상 /card-back.webp 사용 */}
          <div className="tarot-card-back">
            <img
              src="/card-back.webp"
              alt="Card Back"
              className="tarot-card-back-image"
            />
          </div>
          {/* 앞면: 반드시 MAJOR_ARCANA 배열의 image 필드 사용 (card.image) */}
          {/* 모든 카드의 방향을 일관되게 통일 */}
          <div className="tarot-card-front">
            <img
              src={card.image}
              alt={card.name}
              className="tarot-card-image"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TarotCard;


