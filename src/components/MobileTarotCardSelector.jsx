import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { MAJOR_ARCANA } from '../data/CardData';
import './MobileTarotCardSelector.css';

const MobileTarotCardSelector = ({ maxSelection = 3, onSelectionChange, selectedCards = [] }) => {
  const [cards] = useState(() => 
    [...MAJOR_ARCANA].sort(() => Math.random() - 0.5)
  );
  const [flippedCardIds, setFlippedCardIds] = useState(new Set());
  const [localSelectedCards, setLocalSelectedCards] = useState(selectedCards);
  const [currentCenterIndex, setCurrentCenterIndex] = useState(0);
  const containerRef = useRef(null);
  
  // 카드 간격 (픽셀) - 겹치도록 작은 간격 사용
  const CARD_SPACING = 50; // 카드들이 겹치도록 간격 축소
  const CARD_WIDTH = 160;
  const SNAP_THRESHOLD = CARD_SPACING * 0.3;
  
  // 모든 카드 표시 (선택된 카드도 계속 표시)
  const availableCards = useMemo(() => cards, [cards]);
  
  // 모션 값: 드래그 위치
  // 초기값: 첫 번째 카드가 중앙에 오도록
  const x = useMotionValue(0);
  const springX = useSpring(x, { 
    stiffness: 200, /* 더 약하고 세밀한 조절을 위해 낮춤 */
    damping: 60, /* 감쇠 증가로 더 부드럽고 정밀하게 */
    mass: 0.6 /* 질량 증가로 더 무거운 느낌, 세밀한 제어 */
  });
  
  // 중앙 인덱스를 실시간으로 추적
  useEffect(() => {
    // 초기 중앙 인덱스 설정 (첫 번째 카드가 중앙)
    if (availableCards.length > 0) {
      setCurrentCenterIndex(0);
    }
    
    const unsubscribe = springX.on('change', (latestX) => {
      const availableCount = availableCards.length;
      if (availableCount === 0) return;
      
      const newCenterIndex = Math.round(-latestX / CARD_SPACING);
      // 인덱스 범위 제한
      const clampedIndex = Math.max(0, Math.min(availableCount - 1, newCenterIndex));
      setCurrentCenterIndex(clampedIndex);
    });
    return unsubscribe;
  }, [springX, availableCards.length, CARD_SPACING]);

  // 드래그 상태
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animationFrameRef = useRef(null);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const hasMovedRef = useRef(false);

  // 중앙 카드로 스냅
  const snapToCenter = useCallback(() => {
    const currentX = x.get();
    const availableCount = availableCards.length;
    if (availableCount === 0) return;
    
    // 현재 x 위치를 기반으로 가장 가까운 카드 인덱스 계산
    const currentCenterIndex = Math.round(-currentX / CARD_SPACING);
    // 인덱스 범위 제한
    const clampedIndex = Math.max(0, Math.min(availableCount - 1, currentCenterIndex));
    const targetX = -clampedIndex * CARD_SPACING;
    
    // 빠른 애니메이션
    x.set(targetX);
  }, [x, availableCards.length]);

  // 속도 계산 및 관성 적용
  const updateVelocity = useCallback(() => {
    const now = performance.now();
    const currentX = x.get();
    
    if (lastTimeRef.current > 0) {
      const deltaTime = (now - lastTimeRef.current) / 1000; // 초 단위
      const deltaX = currentX - lastXRef.current;
      
      if (deltaTime > 0) {
        const v = deltaX / deltaTime;
        setVelocity(v);
      }
    }
    
    lastXRef.current = currentX;
    lastTimeRef.current = now;
    
    if (isDragging) {
      animationFrameRef.current = requestAnimationFrame(updateVelocity);
    }
  }, [x, isDragging]);

  // 터치 시작
  const handleTouchStart = useCallback((e) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    hasMovedRef.current = false;
    setIsDragging(false); // 초기에는 드래그가 아님
    setStartX(e.touches[0].clientX);
    lastXRef.current = x.get();
    lastTimeRef.current = performance.now();
    setVelocity(0);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(updateVelocity);
  }, [x, updateVelocity]);

  // 터치 이동
  const handleTouchMove = useCallback((e) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = Math.abs(currentX - touchStartXRef.current);
    const deltaY = Math.abs(currentY - touchStartYRef.current);
    
    // 수평 이동이 수직 이동보다 크면 드래그로 판단
    if (deltaX > 10 || deltaY > 10) {
      hasMovedRef.current = true;
      if (deltaX > deltaY) {
        setIsDragging(true);
      }
    }
    
    if (!isDragging && deltaX <= deltaY) return; // 수직 스크롤은 무시
    
    const moveDeltaX = currentX - startX;
    // 더 세밀한 조절을 위해 감도 조정 (약간 감소)
    const sensitivity = 0.95; /* 약간 감소된 감도로 더 정밀한 제어 */
    const newX = x.get() + moveDeltaX * sensitivity;
    
    // 제한: 사용 가능한 카드 범위 내에서만 이동
    const availableCount = availableCards.length;
    const minX = -(availableCount - 1) * CARD_SPACING;
    const maxX = 0;
    const clampedX = Math.max(minX, Math.min(maxX, newX));
    
    x.set(clampedX);
    setStartX(currentX);
  }, [isDragging, startX, x, availableCards.length]);

  // 터치 종료 (관성 적용)
  const handleTouchEnd = useCallback((e) => {
    const wasDragging = isDragging;
    const hasMoved = hasMovedRef.current;
    
    setIsDragging(false);
    hasMovedRef.current = false;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // 드래그가 아니고 이동도 없었다면 클릭으로 처리하지 않음 (카드의 onTouchEnd가 처리)
    if (!wasDragging && !hasMoved) {
      return;
    }
    
    // 관성 적용
    const currentVelocity = velocity;
    const currentX = x.get();
    
    if (Math.abs(currentVelocity) > 30) { /* 임계값 낮춤 - 더 세밀한 반응 */
      // 빠르게 드래그한 경우: 관성 적용
      const friction = 0.88; /* 더 빠르게 멈추도록 감소 */
      const maxVelocity = 200; /* 최대 속도 제한 - 한 번에 많은 카드를 넘기지 않게 */
      let inertiaX = currentX;
      let remainingVelocity = Math.max(-maxVelocity, Math.min(maxVelocity, currentVelocity)); /* 속도 제한 */
      
      // 관성 시뮬레이션
      const simulateInertia = () => {
        if (Math.abs(remainingVelocity) > 10) { /* 임계값 높임 - 더 빠르게 멈춤 */
          inertiaX += remainingVelocity * 0.016;
          remainingVelocity *= friction; /* 더 빠른 감쇠 */
          
          const availableCount = availableCards.length;
          const minX = -(availableCount - 1) * CARD_SPACING;
          const maxX = 0;
          const clampedX = Math.max(minX, Math.min(maxX, inertiaX));
          
          x.set(clampedX);
          
          requestAnimationFrame(simulateInertia);
        } else {
          // 관성 종료 후 빠른 스냅
          setTimeout(() => {
            snapToCenter();
          }, 50); /* 지연 시간 감소로 빠른 스냅 */
        }
      };
      
      simulateInertia();
    } else {
      // 느리게 드래그한 경우: 즉시 스냅
      setTimeout(() => {
        snapToCenter();
      }, 50); /* 지연 시간 감소로 빠른 스냅 */
    }
  }, [isDragging, velocity, x, availableCards.length, snapToCenter]);


  // 카드 선택
  const handleCardSelect = useCallback((card) => {
    if (localSelectedCards.length >= maxSelection) return;
    if (flippedCardIds.has(card.id)) return;
    
    // 중앙 카드인지 확인
    const currentX = x.get();
    const currentCenterIndex = Math.round(-currentX / CARD_SPACING);
    const cardIndex = availableCards.findIndex(c => c.id === card.id);
    
    if (Math.abs(cardIndex - currentCenterIndex) > 0.5) return;
    
    // 카드 뒤집기만 (카드는 사라지지 않음)
    setFlippedCardIds(prev => new Set([...prev, card.id]));
    
    // 선택된 카드 추가
    const newSelected = [...localSelectedCards, card];
    setLocalSelectedCards(newSelected);
    
    if (onSelectionChange) {
      onSelectionChange(newSelected);
    }
  }, [localSelectedCards, maxSelection, flippedCardIds, x, availableCards, onSelectionChange]);

  // 선택된 카드 제거 (슬롯에서 제거 버튼 클릭 시)
  useEffect(() => {
    if (selectedCards.length < localSelectedCards.length) {
      // 카드가 제거된 경우
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
      // 카드 요소를 클릭한 경우는 컨테이너 이벤트 무시
      const cardItem = e.target.closest('.mobile-card-item');
      if (cardItem) {
        return; // 카드 클릭은 카드의 이벤트 핸들러가 처리
      }
      handleTouchStart(e);
    };

    const touchMoveHandler = (e) => {
      // 카드 요소를 드래그하는 경우도 처리
      handleTouchMove(e);
    };

    const touchEndHandler = (e) => {
      // 카드 요소를 클릭한 경우는 컨테이너 이벤트 무시
      const cardItem = e.target.closest('.mobile-card-item');
      if (cardItem && !hasMovedRef.current) {
        return; // 카드 클릭은 카드의 이벤트 핸들러가 처리
      }
      handleTouchEnd(e);
    };

    // passive: false로 설정하여 preventDefault 가능하게 함
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
      style={{ touchAction: 'none' }} /* pan-y 대신 none으로 변경하여 수평 스크롤 제어 */
    >
      <motion.div
        className="mobile-card-stack"
        style={{ x: springX }}
      >
        {availableCards.map((card, index) => {
          const isFlipped = flippedCardIds.has(card.id);
          
          // 중앙 인덱스는 useState로 추적
          const relativeIndex = index - currentCenterIndex;
          const distance = Math.abs(relativeIndex);
          
          // 중앙에서의 거리에 따른 스케일만 조절 (opacity는 항상 1)
          // 겹쳐진 카드 효과를 위해 스케일 차이를 줄임
          const scale = Math.max(0.85, 1 - distance * 0.08);
          const opacity = 1; // 항상 불투명하게
          const zIndex = 1000 - distance;
          
          // 위치 계산: 각 카드는 겹치도록 작은 간격으로 배치
          // 스택의 x 이동과 함께 각 카드의 상대 위치 계산
          const baseX = index * CARD_SPACING;
          
          return (
            <motion.div
              key={card.id}
              className="mobile-card-item"
              style={{
                x: baseX,
                scale,
                zIndex,
                cursor: isFlipped ? 'default' : 'pointer',
              }}
              animate={{
                scale,
              }}
              transition={{ duration: 0.25, ease: 'easeOut' }} /* 더 부드러운 애니메이션 */
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // 뒤집힌 카드나 이미 선택된 카드는 클릭 불가
                if (!isFlipped && localSelectedCards.length < maxSelection) {
                  handleCardSelect(card);
                }
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                // 카드 터치 시작 시 이동 여부 초기화
                touchStartXRef.current = e.touches[0].clientX;
                touchStartYRef.current = e.touches[0].clientY;
                hasMovedRef.current = false;
              }}
              onTouchMove={(e) => {
                e.stopPropagation();
                // 이동 감지
                const deltaX = Math.abs(e.touches[0].clientX - touchStartXRef.current);
                const deltaY = Math.abs(e.touches[0].clientY - touchStartYRef.current);
                if (deltaX > 5 || deltaY > 5) {
                  hasMovedRef.current = true;
                }
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // 터치 종료 시 클릭 처리 (드래그가 아닌 경우)
                if (!hasMovedRef.current && !isFlipped && localSelectedCards.length < maxSelection) {
                  handleCardSelect(card);
                }
                // 리셋
                hasMovedRef.current = false;
              }}
            >
              <motion.div
                className={`mobile-card ${isFlipped ? 'flipped' : ''}`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="mobile-card-inner">
                  {/* 뒷면 - 항상 표시 */}
                  <div className="mobile-card-back">
                    <img
                      src="/card-back.webp"
                      alt="Card Back"
                      className="mobile-card-back-image"
                      draggable={false}
                    />
                  </div>
                  {/* 앞면 - 항상 DOM에 렌더링 (CSS로 표시/숨김 제어) */}
                  <div className="mobile-card-front">
                    <img
                      src={card.image}
                      alt={card.name}
                      className="mobile-card-front-image"
                      draggable={false}
                    />
                  </div>
                </div>
              </motion.div>
              
              {/* 중앙 카드 인디케이터 - 뒤집히지 않은 중앙 카드에만 표시 */}
              {relativeIndex === 0 && !isFlipped && localSelectedCards.length < maxSelection && (
                <motion.div
                  className="center-indicator"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  카드를 클릭하여 선택
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default MobileTarotCardSelector;

