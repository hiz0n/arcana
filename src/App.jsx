import React from "react";
import { Routes, Route } from "react-router-dom";
import MainPage from "./components/MainPage";
import SubPage from "./components/SubPage";
import DesignDetailPage from "./components/design/DesignDetailPage";

const App = () => {
  return (
    <div className="app-root">
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/fortune/:type" element={<SubPage />} />
        <Route path="/design" element={<DesignDetailPage />} />
      </Routes>
    </div>
  );
};

export default App;


