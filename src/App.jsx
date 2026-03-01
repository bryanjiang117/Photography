import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Mexico from "./pages/MexicoPage";

import "./App.scss";
import "./Fonts.scss";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mexico" element={<Mexico />} />
      </Routes>
    </Router>
  );
}

export default App;
