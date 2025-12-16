import React from "react";
import { motion } from "framer-motion";

// 손등 일러스트를 단순한 벡터 스타일 박스로 표현
// 실제 프로덕션에서는 SVG나 실제 이미지를 넣으면 됨
const Hand = () => {
  return (
    <motion.div
      className="hand-illustration"
      initial={{ opacity: 0, y: 40, x: -80, rotate: -10 }}
      animate={{ opacity: 1, y: 0, x: -40, rotate: -3 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
    >
      <motion.div
        className="hand-core"
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="hand-back" />
        <div className="hand-fingers" />
      </motion.div>
    </motion.div>
  );
};

export default Hand;


