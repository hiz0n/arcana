import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FORTUNE_TYPES } from "../constants/fortuneTypes";
import ArcanaButton from "./ui/ArcanaButton";

const buttons = [
  { label: "오늘의 운세", type: FORTUNE_TYPES.DAILY },
  { label: "금전운", type: FORTUNE_TYPES.MONEY },
  { label: "애정운", type: FORTUNE_TYPES.LOVE },
  { label: "건강운", type: FORTUNE_TYPES.HEALTH },
  { label: "사업운", type: FORTUNE_TYPES.BUSINESS },
];

const MainPage = () => {
  const navigate = useNavigate();

  const topButtons = buttons.slice(0, 3);
  const bottomButtons = buttons.slice(3);

  return (
    <div className="page main-page">
      {/* 안쪽에 살짝 들어온 골드 프레임 배경 박스 */}
      <div className="main-frame">
        <motion.h1
          className="title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          arcana
        </motion.h1>

        <motion.p
          className="subtitle-main"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          운명이 깃든 카드의 속삭임을 들어보세요.
        </motion.p>

        <motion.div
          className="button-group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="button-row top">
            {topButtons.map((btn, index) => (
              <ArcanaButton
                key={btn.type}
                label={btn.label}
                onClick={() => navigate(`/fortune/${btn.type}`)}
                index={index}
              />
            ))}
          </div>
          <div className="button-row bottom">
            {bottomButtons.map((btn, index) => (
              <ArcanaButton
                key={btn.type}
                label={btn.label}
                onClick={() => navigate(`/fortune/${btn.type}`)}
                index={index + topButtons.length}
              />
            ))}
          </div>
        </motion.div>

        {/* 디자인 상세 보기 텍스트 버튼 */}
        <motion.button
          className="design-detail-button"
          type="button"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/design")}
        >
          Overview
        </motion.button>
      </div>
    </div>
  );
};

export default MainPage;


