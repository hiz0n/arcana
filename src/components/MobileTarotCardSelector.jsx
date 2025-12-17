import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MAJOR_ARCANA } from '../data/CardData';
import './MobileTarotCardSelector.css';

const MobileTarotCardSelector = ({ maxSelection = 3, onSelectionChange, selectedCards = [] }) => {
  const [cards] = useState(() => 
    [...MAJOR_ARCANA].sort(() => Math.random() - 0.5)
  );
  const [flippedCardIds, setFlippedCardIds] = useState(new Set());
  const [localSelectedCards, setLocalSelectedCards] = useState(selectedCards);
  const containerRef = useRef(null);
  
  // 카드 간격 (픽셀) - 겹치도록 작은 간격 사용
  const CARD_SPACING = 50;
  
  // ────────────────────────────────────────────────────────
  // 핵심: 카드 스택 위치는 오직 이 하나의 상태값으로만 관리
  // ────────────────────────────────────────────────────────
  const [offsetX, setOffsetX] = useState(0);
  
  // 드래그 상태
  const [isDragging, setIsDragging] = useState(false);
  
  // 드래그 시작 시점 기준값 (ref로 관리)
  const startTouchXRef = useRef(0);    // 터치 시작 시 손가락 X 좌표
  const baseOffsetXRef = useRef(0);    // 드래그 시작 시점의 offsetX 값
  const hasMovedRef = useRef(false);   // 드래그로 판단할 만큼 이동했는지
  
  // 모든 카드 표시 (선택된 카드도 계속 표시)
  const availableCards = useMemo(() => cards, [cards]);
  
  // 현재 중앙 카드 인덱스 계산
  const currentCenterIndex = useMemo(() => {
    const index = Math.round(-offsetX / CARD_SPACING);
    return Math.max(0, Math.min(availableCards.length - 1, index));
  }, [offsetX, CARD_SPACING, availableCards.length]);

  // ────────────────────────────────────────────────────────
  // 터치 이벤트 핸들러
  // ────────────────────────────────────────────────────────
  
  // touchstart: 기준점 저장
  const handleTouchStart = useCallback((e) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    startTouchXRef.current = e.touches[0].clientX;
    baseOffsetXRef.current = offsetX; // 현재 offsetX를 기준점으로 저장
    hasMovedRef.current = false;
    setIsDragging(true);
  }, [offsetX]);

  // touchmove: delta 계산 후 즉시 적용
  const handleTouchMove = useCallback((e) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    
    const currentTouchX = e.touches[0].clientX;
    const delta = currentTouchX - startTouchXRef.current;
    
    // 이동 감지
    if (Math.abs(delta) > 5) {
      hasMovedRef.current = true;
    }
    
    // ⚠️ 핵심: baseOffsetX + delta 만 사용
    // 누적 계산 없음, 이전 프레임 참조 없음
    setOffsetX(baseOffsetXRef.current + delta);
  }, []);

  // touchend: 아무것도 하지 않음
  const handleTouchEnd = useCallback((e) => {
    // ⚠️ 핵심: 위치 보정, snap, inertia, animation 전부 금지
    // 현재 offsetX 값 그대로 유지
    
    setTimeout(() => {
      setIsDragging(false);
      hasMovedRef.current = false;
    }, 0);
  }, []);

  // ────────────────────────────────────────────────────────
  // 카드 선택 로직
  // ────────────────────────────────────────────────────────
  
  const handleCardSelect = useCallback((card) => {
    // 드래그로 이동한 경우에만 선택 불가 (탭은 허용)
    if (hasMovedRef.current) return;
    if (localSelectedCards.length >= maxSelection) return;
    if (flippedCardIds.has(card.id)) return;
    
    // 중앙 카드인지 확인
    const cardIndex = availableCards.findIndex(c => c.id === card.id);
    if (Math.abs(cardIndex - currentCenterIndex) > 0.5) return;
    
    // 카드 뒤집기
    setFlippedCardIds(prev => new Set([...prev, card.id]));
    
    // 선택된 카드 추가
    const newSelected = [...localSelectedCards, card];
    setLocalSelectedCards(newSelected);
    
    if (onSelectionChange) {
      onSelectionChange(newSelected);
    }
  }, [localSelectedCards, maxSelection, flippedCardIds, availableCards, currentCenterIndex, onSelectionChange]);

  // 선택된 카드 제거 (슬롯에서 제거 버튼 클릭 시)
  useEffect(() => {
    if (selectedCards.length < localSelectedCards.length) {
      const removed = localSelectedCards.find(c => !selectedCards.some(sc => sc.id === c.id));
      if (removed) {
        setFlippedCardIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(removed.id);
          return newSet;
        });
        setLocalSelectedCards(selectedCards);
      }
    }
  }, [selectedCards, localSelectedCards]);

  // 터치 이벤트를 직접 등록하여 passive 옵션 제어
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const touchStartHandler = (e) => {
      const cardItem = e.target.closest('.mobile-card-item');
      if (cardItem) return;
      handleTouchStart(e);
    };

    const touchMoveHandler = (e) => {
      handleTouchMove(e);
    };

    const touchEndHandler = (e) => {
      const cardItem = e.target.closest('.mobile-card-item');
      if (cardItem && !hasMovedRef.current) return;
      handleTouchEnd(e);
    };

    container.addEventListener('touchstart', touchStartHandler, { passive: false });
    container.addEventListener('touchmove', touchMoveHandler, { passive: false });
    container.addEventListener('touchend', touchEndHandler, { passive: false });

    return () => {
      container.removeEventListener('touchstart', touchStartHandler);
      container.removeEventListener('touchmove', touchMoveHandler);
      container.removeEventListener('touchend', touchEndHandler);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div 
      className="mobile-tarot-selector"
      ref={containerRef}
      style={{ touchAction: 'none' }}
    >
      {/* 드래그 중: 짧은 transition / 드래그 종료: 매우 부드럽고 느린 전환 */}
      <div
        className="mobile-card-stack"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isDragging 
            ? 'transform 0.08s linear' 
            : 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform'
        }}
      >
        {availableCards.map((card, index) => {
          const isFlipped = flippedCardIds.has(card.id);
          
          const relativeIndex = index - currentCenterIndex;
          const distance = Math.abs(relativeIndex);
          
          // 중앙 카드는 크게, 멀어질수록 작게 (더 극적인 스케일 변화)
          const scale = Math.max(0.75, 1 - distance * 0.12);
          const zIndex = 1000 - distance;
          
          const baseX = index * CARD_SPACING;
          
          return (
            <div
              key={card.id}
              className="mobile-card-item"
              style={{
                transform: `translateX(${baseX}px) scale(${scale})`,
                zIndex,
                cursor: isFlipped ? 'default' : 'pointer',
                // 드래그 중에도 스케일 애니메이션 유지 (부드러운 스케일 변화)
                transition: isDragging 
                  ? 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)' 
                  : 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                willChange: 'transform'
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isFlipped && localSelectedCards.length < maxSelection && !hasMovedRef.current) {
                  handleCardSelect(card);
                }
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                startTouchXRef.current = e.touches[0].clientX;
                baseOffsetXRef.current = offsetX;
                hasMovedRef.current = false;
                setIsDragging(true); // 드래그 상태 활성화
              }}
              onTouchMove={(e) => {
                e.stopPropagation();
                const delta = e.touches[0].clientX - startTouchXRef.current;
                if (Math.abs(delta) > 5) {
                  hasMovedRef.current = true;
                }
                // 카드 위에서도 드래그 가능
                setOffsetX(baseOffsetXRef.current + delta);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!hasMovedRef.current && !isFlipped && localSelectedCards.length < maxSelection) {
                  handleCardSelect(card);
                }
                setTimeout(() => {
                  setIsDragging(false);
                  hasMovedRef.current = false;
                }, 0);
              }}
            >
              <div
                className={`mobile-card ${isFlipped ? 'flipped' : ''}`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="mobile-card-inner">
                  {/* 뒷면 */}
                  <div className="mobile-card-back">
                    <img
                      src="/card-back.webp"
                      alt="Card Back"
                      className="mobile-card-back-image"
                      draggable={false}
                    />
                  </div>
                  {/* 앞면 */}
                  <div className="mobile-card-front">
                    <img
                      src={card.image}
                      alt={card.name}
                      className="mobile-card-front-image"
                      draggable={false}
                    />
                  </div>
                </div>
              </div>
              
              {/* 중앙 카드 인디케이터 */}
              {relativeIndex === 0 && !isFlipped && localSelectedCards.length < maxSelection && (
                <div className="center-indicator">
                  카드를 클릭하여 선택
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileTarotCardSelector;
