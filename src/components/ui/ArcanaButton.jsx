import React from "react";
import { motion } from "framer-motion";

// 메인 화면에서 사용하는 공통 버튼 컴포넌트
const ArcanaButton = ({ label, onClick, index }) => {
  return (
    <motion.button
      className="arcana-button"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.18 * index, // 버튼마다 등장 간격을 조금 더 넓게
        duration: 0.4,
      }}
      whileHover={{
        scale: 1.04,
      }}
      whileTap={{ scale: 0.96 }}
    >
      <span className="arcana-button__label">{label}</span>
    </motion.button>
  );
};

export default ArcanaButton;


