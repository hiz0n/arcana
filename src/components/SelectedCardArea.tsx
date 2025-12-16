import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SelectedCardArea.css';

interface Card {
  id: number;
  name: string;
  image: string;
}

interface SelectedCardAreaProps {
  selectedCards: Card[];
  onRemove: (cardId: number) => void;
}

const SelectedCardArea = ({
  selectedCards,
  onRemove,
}) => {
  return (
    <div className="selected-card-area">
      <h3 className="selected-card-title">
        선택한 카드 ({selectedCards.length})
      </h3>
      <div className="selected-cards-grid">
        <AnimatePresence mode="popLayout">
          {selectedCards.map((card, index) => (
            <motion.div
              key={card.id}
              className="selected-card-item"
              initial={{
                opacity: 0,
                scale: 0.5,
                y: 100,
                x: -100,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                x: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.5,
                y: -50,
                x: 100,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 25,
                duration: 0.5,
              }}
              layout
            >
              <motion.div
                className="selected-card-wrapper"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={card.image}
                  alt={card.name}
                  className="selected-card-image"
                />
                <button
                  className="remove-card-button"
                  onClick={() => onRemove(card.id)}
                  aria-label={`${card.name} 제거`}
                >
                  ×
                </button>
              </motion.div>
              <p className="selected-card-name">{card.name}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {selectedCards.length === 0 && (
        <motion.p
          className="empty-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          카드를 선택해주세요
        </motion.p>
      )}
    </div>
  );
};

export default SelectedCardArea;

