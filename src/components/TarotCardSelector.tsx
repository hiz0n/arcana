import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArcCard from './ArcCard';
import SelectedCardArea from './SelectedCardArea';
import { MAJOR_ARCANA } from '../data/CardData';
import './TarotCardSelector.css';

interface Card {
  id: number;
  name: string;
  image: string;
  isReversed?: boolean;
}

interface TarotCardSelectorProps {
  maxSelection?: number;
  onSelectionChange?: (selectedCards: Card[]) => void;
  initialSelectedCards?: Card[];
  showSelectedArea?: boolean;
}

const TarotCardSelector = ({
  maxSelection = Infinity,
  onSelectionChange,
  initialSelectedCards = [],
  showSelectedArea = true,
}) => {
  const [cards] = useState(MAJOR_ARCANA);
  const [selectedCards, setSelectedCards] = useState(initialSelectedCards);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [centerCardId, setCenterCardId] = useState(MAJOR_ARCANA[Math.floor(MAJOR_ARCANA.length / 2)].id);
  
  const containerRef = useRef(null);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 드래그 시작
  const handleTouchStart = useCallback((e) => {
    if (!isMobile) return;
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  }, [isMobile]);

  // 드래그 중
  const handleTouchMove = useCallback((e) => {
    if (!isMobile || !isDragging) return;
    e.preventDefault();
    const newX = e.touches[0].clientX;
    setCurrentX(newX);
    
    const deltaX = newX - startX;
    setDragOffset(deltaX);
  }, [isMobile, isDragging, startX]);

  // 드래그 종료
  const handleTouchEnd = useCallback(() => {
    if (!isMobile || !isDragging) return;
    
    const deltaX = currentX - startX;
    const threshold = 50; // 카드 변경을 위한 최소 이동 거리
    
    // 현재 사용 가능한 카드 목록
    const available = cards.filter(card => 
      !selectedCards.some(selected => selected.id === card.id)
    );
    
    if (Math.abs(deltaX) > threshold && available.length > 0) {
      const currentCenterIndex = available.findIndex(c => c.id === centerCardId);
      
      if (deltaX > 0 && currentCenterIndex > 0) {
        // 오른쪽으로 드래그 -> 이전 카드로
        setCenterCardId(available[currentCenterIndex - 1].id);
      } else if (deltaX < 0 && currentCenterIndex < available.length - 1) {
        // 왼쪽으로 드래그 -> 다음 카드로
        setCenterCardId(available[currentCenterIndex + 1].id);
      }
    }
    
    setDragOffset(0);
    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  }, [isMobile, isDragging, currentX, startX, centerCardId, cards, selectedCards]);

  // 선택된 카드 변경 시 콜백 호출
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedCards);
    }
  }, [selectedCards, onSelectionChange]);

  // 카드 선택 핸들러
  const handleCardSelect = useCallback((card: Card) => {
    // 이미 선택된 카드인지 확인
    if (selectedCards.some(c => c.id === card.id)) {
      return;
    }
    
    // 최대 선택 개수 확인
    if (selectedCards.length >= maxSelection) {
      return;
    }
    
    // 선택된 카드 추가 (애니메이션을 위해 약간의 지연)
    setTimeout(() => {
      setSelectedCards(prev => [...prev, card]);
    }, 100);
    
    // 선택된 카드가 중심 카드였다면, 다음 사용 가능한 카드로 중심 이동
    if (card.id === centerCardId) {
      const available = cards.filter(c => 
        !selectedCards.some(selected => selected.id === c.id) && c.id !== card.id
      );
      if (available.length > 0) {
        const currentIndex = available.findIndex(c => c.id === card.id);
        const nextIndex = currentIndex < available.length - 1 ? currentIndex + 1 : currentIndex - 1;
        if (nextIndex >= 0 && nextIndex < available.length) {
          setTimeout(() => {
            setCenterCardId(available[nextIndex].id);
          }, 300);
        }
      }
    }
  }, [selectedCards, centerCardId, cards]);

  // 카드 제거 핸들러
  const handleCardRemove = useCallback((cardId: number) => {
    setSelectedCards(prev => prev.filter(c => c.id !== cardId));
  }, []);

  // 현재 표시할 카드 목록 (선택되지 않은 카드만)
  const availableCards = cards.filter(card => 
    !selectedCards.some(selected => selected.id === card.id)
  );

  return (
    <div className="tarot-card-selector">
      {/* 반원 형태 카드 영역 */}
      <div
        ref={containerRef}
        className="arc-card-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: isMobile ? 'pan-y' : 'auto' }}
      >
        <AnimatePresence mode="popLayout">
          {availableCards.map((card, index) => {
            // 현재 중심 카드 기준 상대 위치 계산
            const centerIndex = availableCards.findIndex(c => c.id === centerCardId);
            const relativeIndex = index - centerIndex;
            
            return (
              <ArcCard
                key={card.id}
                card={card}
                index={index}
                relativeIndex={relativeIndex}
                totalCards={availableCards.length}
                dragOffset={dragOffset}
                isDragging={isDragging}
                isMobile={isMobile}
                onSelect={handleCardSelect}
                isSelected={selectedCards.some(c => c.id === card.id)}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* 선택된 카드 영역 */}
      {showSelectedArea && (
        <SelectedCardArea
          selectedCards={selectedCards}
          onRemove={handleCardRemove}
        />
      )}
    </div>
  );
};

export default TarotCardSelector;

