import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import HomePage from "./pages/HomePage";
import CanadaPage from "./pages/CanadaPage";
import MexicoCityGalleryPage from "./pages/MexicoCityGalleryPage";

import "./App.scss";
import "./Fonts.scss";

function AnimatedRoutes() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <>
      {/* Base layer — keep HomePage mounted while gallery is open so it stays visible beneath */}
      {(path === "/" || path === "/mexico") && <HomePage />}
      {path === "/canada" && <CanadaPage />}

      {/* Mexico gallery slides over the top as a fixed overlay */}
      <AnimatePresence>
        {path === "/mexico" && <MexicoCityGalleryPage key="mexico-gallery" />}
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
