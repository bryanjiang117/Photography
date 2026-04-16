import { useEffect, useState } from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import HomePage from "./pages/HomePage";
import CanadaPage from "./pages/CanadaPage";
import MexicoCityGalleryPage from "./pages/MexicoCityGalleryPage";

import "./App.scss";
import "./Fonts.scss";

const MEXICO_PHOTOS = [
  "orange-wall", "green-wall", "blue-door", "bike-leaves",
  "meat-vendor", "pastor-tacos", "street-vendor", "coke-store",
  "taco-vendor", "bakery", "flowers", "fruit-store", "fruit-vendor",
  "old-man", "bikes", "pool", "street-stalls", "windmill",
  "modern-balcony", "old-building", "line-squirrel", "playground",
  "museum-reflection", "museum-roof", "art-museum", "palace", "plaza-garibaldi",
];

const CRITICAL_IMAGES = [
  "/assets/photos/japan/flowers.jpeg",
  "/assets/photos/mexico/orange-wall.jpeg",
];

function AnimatedRoutes() {
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    const preload = () => {
      MEXICO_PHOTOS.forEach((name) => {
        new Image().src = `/assets/photos/mexico/${name}.jpeg`;
      });
    };
    if ("requestIdleCallback" in window) {
      requestIdleCallback(preload, { timeout: 4000 });
    } else {
      setTimeout(preload, 2000);
    }
  }, []);

  return (
    <>
      {(path === "/" || path === "/mexico") && <HomePage />}
      {path === "/canada" && <CanadaPage />}
      <AnimatePresence>
        {path === "/mexico" && <MexicoCityGalleryPage key="mexico-gallery" />}
      </AnimatePresence>
    </>
  );
}

function App() {
  const [phase, setPhase] = useState("loading");  // 'loading' | 'revealing' | 'done'
  const [squareTarget, setSquareTarget] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const prevent = (e) => e.preventDefault();
    window.addEventListener("wheel", prevent, { passive: false });
    window.addEventListener("touchmove", prevent, { passive: false });

    const images = CRITICAL_IMAGES.map(
      (src) => new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = src;
      })
    );

    Promise.all([document.fonts.ready, ...images, new Promise((r) => setTimeout(r, 1000))]).then(() => {
      const squares = document.querySelectorAll("[data-intro-square]");
      const visible = Array.from(squares).find((el) => {
        const r = el.getBoundingClientRect();
        return r.left >= 0 && r.left < window.innerWidth;
      });
      if (visible) {
        const r = visible.getBoundingClientRect();
        setSquareTarget({
          x: r.left + r.width / 2 - window.innerWidth / 2,
          y: r.top + r.height / 2 - window.innerHeight / 2,
        });
      }

      setPhase("revealing");
      setTimeout(() => {
        setPhase("done");
        window.removeEventListener("wheel", prevent);
        window.removeEventListener("touchmove", prevent);
      }, 1000);
    });

    return () => {
      window.removeEventListener("wheel", prevent);
      window.removeEventListener("touchmove", prevent);
    };
  }, []);

  const isRevealing = phase === "revealing";
  const isDone = phase === "done";

  return (
    <Router>
      <AnimatedRoutes />

      {/* Background — fades via motion delay, fully gone by the time scroll unlocks */}
      {!isDone && (
        <motion.div
          animate={{ opacity: isRevealing ? 0 : 1 }}
          transition={{ duration: 0.2, delay: isRevealing ? 0.8 : 0 }}
          className="fixed inset-0 z-[100] bg-background pointer-events-none"
        />
      )}

      {/* Square — moves to IntroPanel position, unmounts when done */}
      {!isDone && (
        <motion.div
          animate={isRevealing ? { x: squareTarget.x, y: squareTarget.y } : { x: 0, y: 0 }}
          transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none"
        >
          <motion.div
            className="h-4 w-4 bg-primary"
            animate={isRevealing ? { opacity: 1 } : { opacity: [0.1, 1, 0.1] }}
            transition={
              isRevealing
                ? { duration: 0.15 }
                : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }
          />
        </motion.div>
      )}
    </Router>
  );
}

export default App;
