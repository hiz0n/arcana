import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const DesignDetailPage = () => {
  const navigate = useNavigate();

  const keywords = ["Mystic", "Cosmic", "Glow"];

  return (
    <div className="page design-detail-page">
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
        <span className="subtitle-text">Overview</span>
      </motion.h2>

      <motion.div
        className="design-detail-frame"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* 프로젝트 개요 섹션 */}
        <motion.section
          className="overview-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h3 className="overview-section-title">Project Overview</h3>
          <p className="overview-description">
            arcana는 사용자가 일상의 흐름 속 간단하고 빠르게 타로 운세를 확인할 수 있는 디지털 타로 리딩 서비스입니다. 우주, 밤하늘의 분위기를 바탕으로 디자인하여, 사용자가 타로 리더 앞에 앉은 듯한 몰입감을 제공합니다. 다크 톤의 배경 위 밝고 따뜻한 하이라이트 컬러를 더해 시각 집중도를 높였으며, 카드 애니메이션을 통해 실제 카드를 뽑는 감각을 경험하도록 구성하였습니다.
          </p>
        </motion.section>

        {/* 핵심 키워드 섹션 */}
        <motion.section
          className="overview-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="overview-section-title">Keywords</h3>
          <div className="keywords-container">
            {keywords.map((keyword, index) => (
              <motion.span
                key={keyword}
                className="keyword-tag"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                #{keyword}
              </motion.span>
            ))}
          </div>
        </motion.section>

        {/* 컬러 팔레트 섹션 */}
        <motion.section
          className="overview-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="overview-section-title">Color Palette</h3>
          <div className="color-palette-container">
            <div className="color-palette-item">
              <div className="color-palette-box background-palette">
                <div className="color-palette-gradient"></div>
              </div>
              <p className="color-palette-label">Background Color</p>
              <p className="color-palette-codes">#202153 → #28275f</p>
            </div>
            <div className="color-palette-item">
              <div className="color-palette-box accent-palette">
                <div className="color-palette-gradient"></div>
              </div>
              <p className="color-palette-label">Accent Color</p>
              <p className="color-palette-codes">#e7be8e → #a46344</p>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default DesignDetailPage;
