import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CanadaPage from "./pages/CanadaPage";

import "./App.scss";
import "./Fonts.scss";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/canada" element={<CanadaPage />} />
      </Routes>
    </Router>
  );
}

export default App;
