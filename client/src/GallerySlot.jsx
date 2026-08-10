import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { motion, useAnimationControls } from "motion/react";
import { GalleryContext } from "./GalleryContext";
import {
  getResolvedGallery,
  loadGalleryChunk,
} from "./galleryChunkPrefetch";
import GalleryLoadingShell from "./GalleryLoadingShell";
import { SLIDE_TRANSITION } from "./galleryMotion";

/**
 * Keeps gallery overlays mounted after intro so images decode into real <img>s.
 * Slide animation is owned here so warm-mount can sit invisible at rest, then
 * still slide in/out on open/close.
 */
export default function GallerySlot({ show, region, isMobile }) {
  const { introReady } = useContext(GalleryContext);
  const [Comp, setComp] = useState(() =>
    getResolvedGallery(region, isMobile),
  );
  const controls = useAnimationControls();
  const usedShellRef = useRef(false);
  const parkedRef = useRef(true);
  // Deep-link / hard refresh: open already at rest (no entrance slide/fade).
  const deepLinkRef = useRef(show);
  const [suppressFade, setSuppressFade] = useState(() => show);
  const axis = isMobile ? "x" : "y";

  useEffect(() => {
    if (!introReady && !show) return;
    let cancelled = false;
    loadGalleryChunk(region, isMobile).then((Component) => {
      if (cancelled || !Component) return;
      setComp(() => Component);
    });
    return () => {
      cancelled = true;
    };
  }, [introReady, show, region, isMobile]);

  useEffect(() => {
    if (!Comp && show) {
      usedShellRef.current = true;
      // Shell already painted solid chrome — don't re-fade titles on handoff.
      setSuppressFade(true);
    }
  }, [Comp, show]);

  useEffect(() => {
    if (!show) setSuppressFade(false);
  }, [show]);

  // Layout effect so park/open styles apply before paint (avoids a visible
  // inert flash when warm-mounted galleries first mount).
  useLayoutEffect(() => {
    if (!Comp) return;
    let cancelled = false;
    const onPos = { x: 0, y: 0 };
    const offPos =
      axis === "x" ? { x: "100vw", y: 0 } : { x: 0, y: "100vh" };

    (async () => {
      if (show) {
        if (usedShellRef.current) {
          // Shell already in — take over at rest without a second slide.
          usedShellRef.current = false;
          deepLinkRef.current = false;
          parkedRef.current = false;
          controls.set({
            ...onPos,
            opacity: 1,
            zIndex: 50,
            pointerEvents: "auto",
          });
          return;
        }
        if (deepLinkRef.current) {
          deepLinkRef.current = false;
          parkedRef.current = false;
          controls.set({
            ...onPos,
            opacity: 1,
            zIndex: 50,
            pointerEvents: "auto",
          });
          return;
        }
        const fromParked = parkedRef.current;
        parkedRef.current = false;
        if (fromParked) {
          controls.set({
            ...offPos,
            opacity: 1,
            zIndex: 50,
            pointerEvents: "auto",
          });
        }
        await controls.start({
          ...onPos,
          opacity: 1,
          zIndex: 50,
          pointerEvents: "auto",
          transition: SLIDE_TRANSITION,
        });
        return;
      }

      if (parkedRef.current) {
        // Idle warm park: on-screen layout (for decode) but invisible.
        controls.set({
          ...onPos,
          opacity: 0,
          zIndex: -1,
          pointerEvents: "none",
        });
        return;
      }

      await controls.start({ ...offPos, transition: SLIDE_TRANSITION });
      if (cancelled) return;
      // Re-park at rest so images stay mounted/decoded for the next open.
      controls.set({
        ...onPos,
        opacity: 0,
        zIndex: -1,
        pointerEvents: "none",
      });
      parkedRef.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, [show, Comp, axis, controls]);

  if (!Comp) {
    if (!show) return null;
    return (
      <GalleryLoadingShell
        key="gallery-shell"
        region={region}
        isMobile={isMobile}
        instant={deepLinkRef.current}
      />
    );
  }

  return (
    <motion.div
      className="fixed inset-0"
      initial={false}
      animate={controls}
      aria-hidden={!show}
      inert={!show ? true : undefined}
    >
      {/* slide=false: slot owns the slide; entrance drives chrome fades only */}
      <Comp entrance={show && !suppressFade} slide={false} />
    </motion.div>
  );
}
