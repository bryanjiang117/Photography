import {
  lazy,
  Suspense,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  BrowserRouter as Router,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useIsMobile } from "./hooks/useIsMobile";
import { GalleryContext } from "./GalleryContext";
import { SpotifyProvider } from "./SpotifyContext.jsx";
import { MalProvider } from "./MalContext.jsx";
import { TmdbProvider } from "./TmdbContext.jsx";
import {
  fetchBootstrapApis,
  runIntroBootstrap,
} from "./introBootstrap";
import { scheduleIdleGalleryWarm } from "./galleryPrefetch";
import { galleryImageUrl } from "./galleryImages";

import "./App.scss";
import "./Fonts.scss";

const HomePage = lazy(() => import("./panels/HomePanel"));
const MobileHome = lazy(() => import("./mobile/MobileHome"));
const MexicoCityGalleryPage = lazy(() => import("./panels/MexicoCityGallery"));
const CanadaGalleryPage = lazy(() => import("./panels/CanadaGallery"));
const ChinaGalleryPage = lazy(() => import("./panels/ChinaGallery"));
const JapanGalleryPage = lazy(() => import("./panels/JapanGallery"));
const MobileMexicoCityGallery = lazy(
  () => import("./mobile/MexicoCityGallery"),
);
const MobileCanadaGallery = lazy(() => import("./mobile/CanadaGallery"));
const MobileChinaGallery = lazy(() => import("./mobile/ChinaGallery"));
const MobileJapanGallery = lazy(() => import("./mobile/JapanGallery"));

const CRITICAL_IMAGES = [
  galleryImageUrl("japan", "flowers", "md"),
  galleryImageUrl("mexico", "orange-wall", "md"),
  galleryImageUrl("canada", "leaves-glow", "sm"),
  galleryImageUrl("china", "temple", "md"),
];

function AnimatedRoutes() {
  const location = useLocation();
  const path = location.pathname;
  const {
    showMexicoGallery,
    showCanadaGallery,
    showChinaGallery,
    showJapanGallery,
  } = useContext(GalleryContext);
  const isMobile = useIsMobile();

  if (path !== "/") {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Suspense fallback={null}>
        {isMobile ? <MobileHome /> : <HomePage />}
      </Suspense>
      <AnimatePresence>
        {showChinaGallery && (
          <Suspense fallback={null}>
            {isMobile ? (
              <MobileChinaGallery key="china-gallery" />
            ) : (
              <ChinaGalleryPage key="china-gallery" />
            )}
          </Suspense>
        )}
        {showMexicoGallery && (
          <Suspense fallback={null}>
            {isMobile ? (
              <MobileMexicoCityGallery key="mexico-gallery" />
            ) : (
              <MexicoCityGalleryPage key="mexico-gallery" />
            )}
          </Suspense>
        )}
        {showCanadaGallery && (
          <Suspense fallback={null}>
            {isMobile ? (
              <MobileCanadaGallery key="canada-gallery" />
            ) : (
              <CanadaGalleryPage key="canada-gallery" />
            )}
          </Suspense>
        )}
        {showJapanGallery && (
          <Suspense fallback={null}>
            {isMobile ? (
              <MobileJapanGallery key="japan-gallery" />
            ) : (
              <JapanGalleryPage key="japan-gallery" />
            )}
          </Suspense>
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
  const [showChinaGallery, setShowChinaGallery] = useState(false);
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

    const apis = fetchBootstrapApis();
    apis.then((data) => setBootstrap(data));

    let revealTimer;
    let cancelled = false;

    runIntroBootstrap().then(() => {
      if (cancelled) return;

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

  useEffect(() => {
    if (!isDone) return;
    scheduleIdleGalleryWarm();
  }, [isDone]);

  return (
    <GalleryContext.Provider
      value={{
        introReady: isDone,
        showMexicoGallery,
        setShowMexicoGallery,
        showCanadaGallery,
        setShowCanadaGallery,
        showChinaGallery,
        setShowChinaGallery,
        showJapanGallery,
        setShowJapanGallery,
      }}
    >
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
                    animate={
                      isRevealing ? { opacity: 1 } : { opacity: [0.1, 1, 0.1] }
                    }
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
