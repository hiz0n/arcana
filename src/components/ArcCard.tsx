import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import './ArcCard.css';

interface Card {
  id: number;
  name: string;
  image: string;
}

interface ArcCardProps {
  card: Card;
  index: number;
  relativeIndex: number;
  totalCards: number;
  dragOffset: number;
  isDragging: boolean;
  isMobile: boolean;
  onSelect: (card: Card) => void;
  isSelected: boolean;
}

const ArcCard = ({
  card,
  index,
  relativeIndex,
  totalCards,
  dragOffset,
  isDragging,
  isMobile,
  onSelect,
  isSelected,
}) => {
  // 반원 형태 배치 계산
  const cardPosition = useMemo(() => {
    // 상대 위치를 -totalCards/2 ~ totalCards/2 범위로 정규화
    const normalizedIndex = relativeIndex;
    const maxOffset = Math.floor(totalCards / 2);
    const clampedIndex = Math.max(-maxOffset, Math.min(maxOffset, normalizedIndex));
    
    // -1 ~ 1 범위로 정규화
    const t = maxOffset > 0 ? clampedIndex / maxOffset : 0;
    
    // 각도 계산: -45도 ~ +45도
    const minAngle = -45;
    const maxAngle = 45;
    const angleDeg = minAngle + (maxAngle - minAngle) * ((t + 1) / 2);
    const angleRad = (angleDeg * Math.PI) / 180;
    
    // 반지름 (모바일에서는 작게)
    const radius = isMobile ? 250 : 400;
    const centerY = isMobile ? 150 : 250;
    
    // x, y 좌표 계산 (반원 형태)
    const x = radius * Math.sin(angleRad);
    const y = centerY - radius * Math.cos(angleRad);
    
    // 회전 각도 (양 끝으로 갈수록 더 많이 회전)
    const rotation = angleDeg * 0.8;
    
    // z-index: 중심에 가까울수록 높게
    const zIndex = 1000 - Math.abs(clampedIndex) * 10;
    
    // 스케일: 중심에 가까울수록 크게
    const baseScale = 0.7;
    const centerScale = 1.0;
    const scale = baseScale + (centerScale - baseScale) * (1 - Math.abs(t));
    
    // 드래그 오프셋 적용
    const dragX = isDragging ? dragOffset * 0.3 : 0;
    
    return {
      x: x + dragX,
      y,
      rotate: rotation,
      scale,
      zIndex,
      opacity: isSelected ? 0.3 : 1,
    };
  }, [relativeIndex, totalCards, isMobile, dragOffset, isDragging, isSelected]);

  // 중심 카드인지 확인
  const isCenterCard = relativeIndex === 0;
  
  // 중심 카드일 때 확대 및 글로우 효과
  const centerCardStyle = isCenterCard && !isSelected ? {
    scale: cardPosition.scale * 1.1,
    filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))',
  } : {};

  const handleClick = () => {
    if (!isDragging && !isSelected && isCenterCard) {
      onSelect(card);
    }
  };

  return (
    <motion.div
      className={`arc-card ${isCenterCard ? 'center-card' : ''} ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        transformOrigin: 'center bottom',
        zIndex: cardPosition.zIndex,
      }}
      initial={false}
      animate={{
        x: cardPosition.x,
        y: cardPosition.y,
        rotate: cardPosition.rotate,
        scale: centerCardStyle.scale || cardPosition.scale,
        opacity: isSelected ? 0 : cardPosition.opacity,
      }}
      exit={{
        opacity: 0,
        scale: 0.5,
        y: typeof window !== 'undefined' ? window.innerHeight : 1000,
        transition: {
          duration: 0.5,
          ease: [0.4, 0, 0.2, 1],
        },
      }}
      transition={{
        type: 'spring',
        stiffness: isDragging ? 300 : 150,
        damping: isDragging ? 30 : 25,
        mass: 0.8,
      }}
      whileHover={!isMobile && !isSelected ? {
        scale: cardPosition.scale * 1.05,
        y: cardPosition.y - 10,
      } : undefined}
      onClick={handleClick}
    >
      <motion.div
        className="arc-card-inner"
        style={{
          filter: centerCardStyle.filter,
        }}
      >
        <div className="arc-card-front">
          <img
            src={card.image}
            alt={card.name}
            className="arc-card-image"
            draggable={false}
          />
        </div>
        {isCenterCard && !isSelected && (
          <motion.div
            className="center-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            탭하여 선택
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ArcCard;

