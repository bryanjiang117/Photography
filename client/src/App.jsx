import {
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  BrowserRouter as Router,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { motion } from "motion/react";
import { useIsMobile } from "./hooks/useIsMobile";
import { GalleryContext } from "./GalleryContext";
import { SpotifyProvider } from "./SpotifyContext.jsx";
import { MalProvider } from "./MalContext.jsx";
import { TmdbProvider } from "./TmdbContext.jsx";
import { GithubProvider } from "./GithubContext.jsx";
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
import {
  GALLERY_PATHS,
  galleryRegionFromPath,
  isGalleryPath,
} from "./galleryRoutes";

import "./App.scss";
import "./Fonts.scss";

const HomePage = lazy(() => import("./panels/HomePanel"));
const MobileHome = lazy(() => import("./mobile/MobileHome"));

const CRITICAL_IMAGES = [
  galleryImageUrl("japan", "flowers", "md"),
  galleryImageUrl("mexico", "orange-wall", "md"),
  galleryImageUrl("canada", "leaves-glow", "sm"),
  galleryImageUrl("china", "temple", "md"),
];

function useGalleryNavigateSetter(path) {
  const navigate = useNavigate();
  return useCallback(
    (open) => {
      if (open) navigate(path);
      else navigate(-1);
    },
    [navigate, path],
  );
}

function GalleryRouteProvider({ introReady, children }) {
  const { pathname } = useLocation();
  const region = galleryRegionFromPath(pathname);

  const setShowJapanGallery = useGalleryNavigateSetter(GALLERY_PATHS.japan);
  const setShowMexicoGallery = useGalleryNavigateSetter(GALLERY_PATHS.mexico);
  const setShowCanadaGallery = useGalleryNavigateSetter(GALLERY_PATHS.canada);
  const setShowChinaGallery = useGalleryNavigateSetter(GALLERY_PATHS.china);

  const value = useMemo(
    () => ({
      introReady,
      showJapanGallery: region === "japan",
      setShowJapanGallery,
      showMexicoGallery: region === "mexico",
      setShowMexicoGallery,
      showCanadaGallery: region === "canada",
      setShowCanadaGallery,
      showChinaGallery: region === "china",
      setShowChinaGallery,
    }),
    [
      introReady,
      region,
      setShowJapanGallery,
      setShowMexicoGallery,
      setShowCanadaGallery,
      setShowChinaGallery,
    ],
  );

  return (
    <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>
  );
}

function AnimatedRoutes() {
  const { pathname } = useLocation();
  const {
    showMexicoGallery,
    showCanadaGallery,
    showChinaGallery,
    showJapanGallery,
  } = useContext(GalleryContext);
  const isMobile = useIsMobile();

  if (pathname !== "/" && !isGalleryPath(pathname)) {
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
  const [bootstrap, setBootstrap] = useState({
    spotify: null,
    mal: null,
    tmdb: null,
    github: null,
  });

  // Hand off from the static HTML loader to React before first paint.
  useLayoutEffect(() => {
    document.getElementById("intro-loader")?.remove();
  }, []);

  // While the square pulses: fonts + home/intro chunk only (for handoff).
  useEffect(() => {
    const prevent = (e) => e.preventDefault();
    window.addEventListener("wheel", prevent, { passive: false });
    window.addEventListener("touchmove", prevent, { passive: false });

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

  // After overlay is gone: hero images, APIs, gallery prefetch.
  useEffect(() => {
    if (!isDone) return;

    CRITICAL_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    fetchBootstrapApis().then((data) => setBootstrap(data));
    scheduleGalleryPrefetch();
  }, [isDone]);

  return (
    <>
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
            <GithubProvider initialData={bootstrap.github}>
              <Router>
                <GalleryRouteProvider introReady={isDone}>
                  <AnimatedRoutes />
                </GalleryRouteProvider>
              </Router>
            </GithubProvider>
          </TmdbProvider>
        </MalProvider>
      </SpotifyProvider>
    </>
  );
}

export default App;
