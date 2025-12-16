import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import TarotCard from "./TarotCard";
import MobileTarotCardSelector from "./MobileTarotCardSelector";
import { MAJOR_ARCANA } from "../data/CardData";
import { generateReading } from "../data/readingGenerator";

// 해석 결과를 페이지 타입에 맞게 포맷팅하는 컴포넌트
const FormattedReading = ({ reading, pageType, isMobile = false }) => {
  if (!reading) return null;

  // 모바일 전용 간단한 형식
  if (isMobile) {
    // 과거·현재·미래 페이지
    if (Array.isArray(reading)) {
      return (
        <div className="reading-formatted reading-formatted-mobile">
          {reading.map((item, idx) => (
            <div key={idx} className="reading-section-mobile">
              <div className="reading-line-mobile">
                [{item.position}] {item.cardName}
              </div>
              <div className="reading-content-mobile">
                {item.content}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // 오늘의 운세 페이지 (daily 또는 today)
    if ((reading.type === "daily" || reading.type === "today") && reading.morning) {
      return (
        <div className="reading-formatted reading-formatted-mobile">
          <div className="reading-section-mobile">
            <div className="reading-line-mobile">
              [아침] {reading.morningCard}
            </div>
            <div className="reading-content-mobile">
              {reading.morning}
            </div>
          </div>
          <div className="reading-section-mobile">
            <div className="reading-line-mobile">
              [점심] {reading.noonCard}
            </div>
            <div className="reading-content-mobile">
              {reading.noon}
            </div>
          </div>
          <div className="reading-section-mobile">
            <div className="reading-line-mobile">
              [저녁] {reading.nightCard}
            </div>
            <div className="reading-content-mobile">
              {reading.night}
            </div>
          </div>
        </div>
      );
    }

    // 개별 운세 페이지 (금전운, 애정운, 건강운, 사업운)
    if (reading.type && reading.content) {
      return (
        <div className="reading-formatted reading-formatted-mobile">
          <div className="reading-content-mobile">
            {reading.content}
          </div>
        </div>
      );
    }
  }

  // 데스크톱: 기존 형식 유지
  // 과거·현재·미래 페이지
  if (Array.isArray(reading)) {
    return (
      <div className="reading-formatted">
        {reading.map((item, idx) => (
          <div key={idx} className="reading-section">
            <div className="reading-section-title">[{item.position}]</div>
            <div className="reading-item">
              <span className="reading-label">카드 이름 :</span>
              <span className="reading-text">{item.cardName}</span>
            </div>
            <div className="reading-item">
              <span className="reading-label">해석 :</span>
              <span className="reading-text">{item.content}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 오늘의 운세 페이지 (daily 또는 today)
  if ((reading.type === "daily" || reading.type === "today") && reading.morning) {
    return (
      <div className="reading-formatted">
        <div className="reading-section">
          <div className="reading-section-title">[아침]</div>
          <div className="reading-item">
            <span className="reading-label">카드 이름 :</span>
            <span className="reading-text">{reading.morningCard}</span>
          </div>
          <div className="reading-item">
            <span className="reading-label">해석 :</span>
            <span className="reading-text">{reading.morning}</span>
          </div>
        </div>
        <div className="reading-section">
          <div className="reading-section-title">[점심]</div>
          <div className="reading-item">
            <span className="reading-label">카드 이름 :</span>
            <span className="reading-text">{reading.noonCard}</span>
          </div>
          <div className="reading-item">
            <span className="reading-label">해석 :</span>
            <span className="reading-text">{reading.noon}</span>
          </div>
        </div>
        <div className="reading-section">
          <div className="reading-section-title">[저녁]</div>
          <div className="reading-item">
            <span className="reading-label">카드 이름 :</span>
            <span className="reading-text">{reading.nightCard}</span>
          </div>
          <div className="reading-item">
            <span className="reading-label">해석 :</span>
            <span className="reading-text">{reading.night}</span>
          </div>
        </div>
      </div>
    );
  }

  // 개별 운세 페이지 (금전운, 애정운, 건강운, 사업운)
  if (reading.type && reading.content) {
    const typeLabels = {
      money: "금전운",
      love: "애정운",
      health: "건강운",
      business: "사업운",
    };

    const label = typeLabels[reading.type] || "운세";

    return (
      <div className="reading-formatted">
        <div className="reading-section-title">{label}</div>
        <div className="reading-text">{reading.content}</div>
      </div>
    );
  }

  return null;
};

const typeToLabel = {
  daily: "오늘의 운세",
  today: "오늘의 운세",
  money: "금전운",
  love: "애정운",
  health: "건강운",
  business: "사업운",
};

const SubPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [flippedCards, setFlippedCards] = useState(new Set());
  const cardStageRef = React.useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSelectedCards, setMobileSelectedCards] = useState([]);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 데스크톱: 22장 전체 카드 랜덤 섞기
  const cards = useMemo(() => {
    if (isMobile) return [];
    const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5);
    return shuffled.map((card) => ({
      ...card,
      isReversed: Math.random() > 0.5,
    }));
  }, [type, isMobile]);

  // 데스크톱: 단계별 애니메이션
  useEffect(() => {
    if (isMobile || cards.length === 0) return;
    const totalSteps = cards.length;
    const totalDuration = 300;
    const stepInterval = totalDuration / (totalSteps - 1);
    
    if (currentStep < totalSteps) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, stepInterval);
      return () => clearTimeout(timer);
    }
  }, [currentStep, cards.length, isMobile]);

  // 선택된 카드 (데스크톱/모바일 통합)
  const selectedCards = isMobile
    ? mobileSelectedCards
    : selectedIndices.length === 3
    ? selectedIndices.map((i) => cards[i])
    : null;

  const reading = useMemo(() => {
    if (!selectedCards || selectedCards.length !== 3) return null;
    return generateReading(selectedCards, type || "today");
  }, [selectedCards, type]);

  // 데스크톱: 카드 클릭 핸들러
  const handleCardClick = (index) => {
    if (isMobile) return;
    if (flippedCards.has(index)) return;
    if (selectedIndices.length >= 3) return;

    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });

    if (!selectedIndices.includes(index)) {
      setSelectedIndices((prev) => [...prev, index]);
    }
  };

  // 데스크톱: 모바일 터치 이벤트 (기존 로직 유지)
  const [touchStart, setTouchStart] = useState(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [cardOffset, setCardOffset] = useState(0);

  const getCardOffsetLimits = () => {
    if (!isMobile) return { min: 0, max: 0 };
    const r = 300;
    const minDeg = -40;
    const maxDeg = 40;
    const minAngleRad = (minDeg * Math.PI) / 180;
    const maxAngleRad = (maxDeg * Math.PI) / 180;
    const leftmostX = r * Math.sin(minAngleRad);
    const rightmostX = r * Math.sin(maxAngleRad);
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 360;
    const rightLimit = (screenWidth / 2) - rightmostX;
    const leftLimit = -(screenWidth / 2) - leftmostX;
    return { min: leftLimit, max: rightLimit };
  };

  const handleTouchStart = (e) => {
    if (isMobile) return;
    setTouchStart(e.touches[0].clientX);
    setTouchStartX(cardOffset);
    setIsDragging(false);
  };

  const handleTouchMove = (e) => {
    if (isMobile || touchStart === null) return;
    const touchCurrent = e.touches[0].clientX;
    const diff = touchCurrent - touchStart;
    
    if (Math.abs(diff) > 5) {
      setIsDragging(true);
      const newOffset = touchStartX + diff;
      const limits = getCardOffsetLimits();
      const clampedOffset = Math.max(limits.min, Math.min(limits.max, newOffset));
      setCardOffset(clampedOffset);
    }
  };

  const handleTouchEnd = (e) => {
    if (isMobile) return;
    setTouchStart(null);
    setTimeout(() => {
      setIsDragging(false);
    }, 100);
  };

  return (
    <div className="page sub-page">
      {/* 서브 페이지에서만 배경 위 오버레이 레이어 표시 */}
      <div className="background-overlay"></div>
      <motion.button
        className="back-button"
        onClick={() => navigate("/")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← 메인으로
      </motion.button>

      <motion.h2
        className="subtitle"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="subtitle-text">{typeToLabel[type] || "운세"}</span>
      </motion.h2>

      <motion.div
        className="subtitle-instruction"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="subtitle-instruction-text">
          카드를 세 장 선택해 주세요. ({isMobile ? mobileSelectedCards.length : selectedIndices.length}/3)
        </p>
      </motion.div>

      {/* 모바일: 새로운 드래그 카드 선택 UI */}
      {isMobile && (
        <div style={{ width: '100%', maxWidth: '100vw', overflow: 'hidden' }}>
          <MobileTarotCardSelector
            maxSelection={3}
            onSelectionChange={setMobileSelectedCards}
            selectedCards={mobileSelectedCards}
          />
        </div>
      )}

      {/* 데스크톱: 기존 카드 선택 UI */}
      {!isMobile && (
        <div 
          className="card-stage"
          ref={cardStageRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <motion.div 
            className="card-orbit"
            animate={isMobile ? { x: cardOffset } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {cards.map((card, index) => (
              <TarotCard
                key={card.id}
                card={card}
                index={index}
                total={cards.length}
                currentStep={currentStep}
                onClick={() => handleCardClick(index)}
                isFlipped={flippedCards.has(index)}
                isSelected={selectedIndices.includes(index)}
                isDragging={isDragging}
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* 선택된 카드 3장 표시용 틀 */}
      <div className="card-selection-slots">
        {[0, 1, 2].map((slotIndex) => {
          const filledCard = selectedCards && selectedCards[slotIndex] ? selectedCards[slotIndex] : null;
          return (
            <div
              key={slotIndex}
              className={`card-selection-slot ${
                filledCard ? "filled" : "empty"
              }`}
            >
              <span className="card-selection-label">
                {slotIndex === 0
                  ? "첫 번째 카드"
                  : slotIndex === 1
                  ? "두 번째 카드"
                  : "세 번째 카드"}
              </span>
              {filledCard ? (
                <>
                  <img
                    src={filledCard.image}
                    alt={filledCard.name}
                    className="card-selection-image"
                  />
                  <span className="card-selection-name">{filledCard.name}</span>
                </>
              ) : (
                <div className="card-selection-placeholder"></div>
              )}
            </div>
          );
        })}
      </div>

      <motion.div
        className="reading-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3>카드 해석</h3>
        <div className="reading-content">
          {reading ? (
            <FormattedReading reading={reading} pageType={type} isMobile={isMobile} />
          ) : (
            <p>카드를 세 장 선택하면 해석을 볼 수 있어요.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SubPage;


