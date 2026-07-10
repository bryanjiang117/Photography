import {
  lazy,
  Suspense,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import {
  BrowserRouter as Router,
  useLocation,
  Navigate,
} from "react-router-dom";
import { motion } from "motion/react";
import { useIsMobile } from "./hooks/useIsMobile";
import { GalleryContext } from "./GalleryContext";
import { SpotifyProvider } from "./SpotifyContext.jsx";
import { MalProvider } from "./MalContext.jsx";
import { TmdbProvider } from "./TmdbContext.jsx";
import {
  fetchBootstrapApis,
  introSquareTarget,
  preloadHomeChunk,
  runIntroBootstrap,
  waitForIntroSquare,
} from "./introBootstrap";
import { scheduleGalleryPrefetch } from "./galleryPrefetch";
import { galleryImageUrl } from "./galleryImages";
import GallerySlot from "./GallerySlot";

import "./App.scss";
import "./Fonts.scss";

const HomePage = lazy(() => import("./panels/HomePanel"));
const MobileHome = lazy(() => import("./mobile/MobileHome"));

const CRITICAL_IMAGES = [
  galleryImageUrl("japan", "flowers", "md"),
  galleryImageUrl("mexico", "orange-wall", "md"),
  galleryImageUrl("canada", "leaves-glow", "sm"),
  galleryImageUrl("china", "mountain-scene", "md"),
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
      <GallerySlot show={showChinaGallery} region="china" isMobile={isMobile} />
      <GallerySlot
        show={showMexicoGallery}
        region="mexico"
        isMobile={isMobile}
      />
      <GallerySlot
        show={showCanadaGallery}
        region="canada"
        isMobile={isMobile}
      />
      <GallerySlot show={showJapanGallery} region="japan" isMobile={isMobile} />
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

  // Hand off from the static HTML loader to React before first paint.
  useLayoutEffect(() => {
    document.getElementById("intro-loader")?.remove();
  }, []);

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

    const homeChunk = preloadHomeChunk();

    let revealTimer;
    let cancelled = false;

    runIntroBootstrap().then(async () => {
      if (cancelled) return;

      await homeChunk;
      if (cancelled) return;

      const square = await waitForIntroSquare();
      if (cancelled) return;
      if (square) setSquareTarget(introSquareTarget(square));

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
    scheduleGalleryPrefetch();
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
      {/* Intro overlay — outside Router so it paints on the first frame */}
      {!isDone && (
        <>
          <div
            className="fixed inset-0 z-100 bg-background pointer-events-none transition-opacity duration-200"
            style={{
              opacity: isRevealing ? 0 : 1,
              transitionDelay: isRevealing ? "800ms" : "0ms",
            }}
          />
          <motion.div
            animate={
              isRevealing
                ? { x: squareTarget.x, y: squareTarget.y }
                : { x: 0, y: 0 }
            }
            transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-101 flex items-center justify-center pointer-events-none"
          >
            <div
              className={`h-4 w-4 bg-primary ${isRevealing ? "opacity-100" : "intro-square-pulse"}`}
            />
          </motion.div>
        </>
      )}

      <SpotifyProvider initialState={bootstrap.spotify}>
        <MalProvider initialData={bootstrap.mal}>
          <TmdbProvider initialData={bootstrap.tmdb}>
            <Router>
              <AnimatedRoutes />
            </Router>
          </TmdbProvider>
        </MalProvider>
      </SpotifyProvider>
    </GalleryContext.Provider>
  );
}

export default App;
