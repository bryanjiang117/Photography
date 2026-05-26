import { useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import HomePage from "./panels/HomePanel";
import MexicoCityGalleryPage from "./panels/MexicoCityGallery";
import CanadaGalleryPage from "./panels/CanadaGallery";
import MobileHome from "./mobile/MobileHome";
import MobileMexicoCityGallery from "./mobile/MexicoCityGallery";
import MobileCanadaGallery from "./mobile/CanadaGallery";
import JapanGalleryPage from "./panels/JapanGallery";
import MobileJapanGallery from "./mobile/JapanGallery";
import { useIsMobile } from "./hooks/useIsMobile";
import { GalleryContext } from "./GalleryContext";
import { SpotifyProvider } from "./SpotifyContext.jsx";
import { MalProvider } from "./MalContext.jsx";
import { TmdbProvider } from "./TmdbContext.jsx";
import { GALLERY_PREFETCH_URLS } from "./constants/data";
import { runIntroBootstrap } from "./introBootstrap";
import { warmGalleryImages } from "./galleryPrefetch";

import "./App.scss";
import "./Fonts.scss";

const CRITICAL_IMAGES = [
  "/assets/photos/japan/flowers.avif",
  "/assets/photos/mexico/orange-wall.avif",
  "/assets/photos/canada/leaves-glow.avif",
];

function AnimatedRoutes() {
  const location = useLocation();
  const path = location.pathname;
  const {
    introReady,
    showMexicoGallery,
    showCanadaGallery,
    showJapanGallery,
  } = useContext(GalleryContext);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!introReady) return;
    warmGalleryImages(GALLERY_PREFETCH_URLS, { concurrency: 8 });
  }, [introReady]);

  if (path !== "/") {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {isMobile ? <MobileHome /> : <HomePage />}
      <AnimatePresence>
        {showMexicoGallery && (
          isMobile
            ? <MobileMexicoCityGallery key="mexico-gallery" />
            : <MexicoCityGalleryPage key="mexico-gallery" />
        )}
        {showCanadaGallery && (
          isMobile
            ? <MobileCanadaGallery key="canada-gallery" />
            : <CanadaGalleryPage key="canada-gallery" />
        )}
        {showJapanGallery && (
          isMobile
            ? <MobileJapanGallery key="japan-gallery" />
            : <JapanGalleryPage key="japan-gallery" />
        )}
      </AnimatePresence>
    </>
  );
}

function App() {
  const [phase, setPhase] = useState("loading"); // 'loading' | 'revealing' | 'done'
  const [squareTarget, setSquareTarget] = useState({ x: 0, y: 0 });
  const [showMexicoGallery, setShowMexicoGallery] = useState(false);
  const [showCanadaGallery, setShowCanadaGallery] = useState(false);
  const [showJapanGallery, setShowJapanGallery] = useState(false);
  const [bootstrap, setBootstrap] = useState({
    spotify: null,
    mal: [],
    tmdb: [],
  });

  useEffect(() => {
    const prevent = (e) => e.preventDefault();
    window.addEventListener("wheel", prevent, { passive: false });
    window.addEventListener("touchmove", prevent, { passive: false });

    CRITICAL_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    let revealTimer;
    let cancelled = false;

    runIntroBootstrap().then((data) => {
      if (cancelled) return;
      setBootstrap(data);

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
      revealTimer = setTimeout(() => {
        setPhase("done");
        window.removeEventListener("wheel", prevent);
        window.removeEventListener("touchmove", prevent);
      }, 700);
    });

    return () => {
      cancelled = true;
      clearTimeout(revealTimer);
      window.removeEventListener("wheel", prevent);
      window.removeEventListener("touchmove", prevent);
    };
  }, []);

  const isRevealing = phase === "revealing";
  const isDone = phase === "done";

  return (
    <GalleryContext.Provider value={{ introReady: isDone, showMexicoGallery, setShowMexicoGallery, showCanadaGallery, setShowCanadaGallery, showJapanGallery, setShowJapanGallery }}>
      <SpotifyProvider initialState={bootstrap.spotify}>
      <MalProvider initialData={bootstrap.mal}>
      <TmdbProvider initialData={bootstrap.tmdb}>
      <Router>
        <AnimatedRoutes />

        {/* Background — fades via motion delay, fully gone by the time scroll unlocks */}
        {!isDone && (
          <motion.div
            animate={{ opacity: isRevealing ? 0 : 1 }}
            transition={{ duration: 0.2, delay: isRevealing ? 0.8 : 0 }}
            className="fixed inset-0 z-100 bg-background pointer-events-none"
          />
        )}

        {/* Square — moves to IntroPanel position, unmounts when done */}
        {!isDone && (
          <motion.div
            animate={
              isRevealing
                ? { x: squareTarget.x, y: squareTarget.y }
                : { x: 0, y: 0 }
            }
            transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-101 flex items-center justify-center pointer-events-none"
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
      </TmdbProvider>
      </MalProvider>
      </SpotifyProvider>
    </GalleryContext.Provider>
  );
}

export default App;
