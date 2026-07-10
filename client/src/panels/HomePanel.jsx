import { lazy, Suspense, useContext, useEffect, useMemo, useRef } from "react";
import { GalleryContext } from "../GalleryContext";

import IntroPanel from "./IntroPanel";
import JapanPanel from "./JapanPanel";
import MexicoCityPanel from "../components/MexicoCityPanel";
import CanadaPanel from "./CanadaPanel";
import ChinaPanel from "./ChinaPanel";
import ProjectsPanel from "../components/ProjectsPanel";

const ExtrasPanel = lazy(() => import("./ExtrasPanel"));

// Infinite horizontal scrolling in both directions (panels can have variable width)
const HomePanel = () => {
  const { introReady } = useContext(GalleryContext);
  const introReadyRef = useRef(introReady);
  introReadyRef.current = introReady;
  const scrollRef = useRef(null);
  const setRef = useRef(null);
  const setWidthRef = useRef(0);
  const hasPositionedRef = useRef(false);
  const userInteractedRef = useRef(false);
  const panels = useMemo(
    () => [
      <IntroPanel scrollRef={scrollRef} key="intro" />,
      <ChinaPanel key="china" />,
      <JapanPanel key="japan" />,
      <MexicoCityPanel key="mexico-city" />,
      <CanadaPanel key="canada" />,
      <ProjectsPanel key="projects" />,
      <Suspense key="extras" fallback={null}>
        <ExtrasPanel />
      </Suspense>,
    ],
    [],
  );

  useEffect(() => {
    const el = scrollRef.current;
    const set = setRef.current;
    if (!el || !set) return;

    const withInstantScroll = (fn) => {
      el.style.scrollBehavior = "auto";
      fn();
    };

    const onScroll = () => {
      if (!introReadyRef.current) return;
      const setWidth = setWidthRef.current;
      if (setWidth <= 0) return;
      const clientW = el.clientWidth;
      const jumpThreshold = Math.min(clientW, 400);

      if (el.scrollLeft <= jumpThreshold) {
        withInstantScroll(() => {
          el.scrollLeft += setWidth;
        });
        return;
      }
      if (el.scrollLeft >= setWidth * 2 - clientW - jumpThreshold) {
        withInstantScroll(() => {
          el.scrollLeft -= setWidth;
        });
      }
    };

    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width ?? 0;
      if (width <= 0) return;

      setWidthRef.current = width;

      // Re-apply the initial scroll position when:
      // - We haven't positioned yet (first firing), OR
      // - The user hasn't scrolled yet and content is still loading (e.g. Spotify/MAL)
      // This ensures async panel content changing widths doesn't leave us at the wrong position.
      if (!hasPositionedRef.current || !userInteractedRef.current) {
        withInstantScroll(() => {
          el.scrollLeft = width;
        });
        hasPositionedRef.current = true;
      }

      // ResizeObserver callbacks fire before the browser paints, so making the
      // container visible here means the user never sees scrollLeft=0.
      el.style.visibility = "visible";
    });

    ro.observe(set);
    // Translate vertical wheel events to horizontal scroll
    const onWheel = (e) => {
      userInteractedRef.current = true;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    const onUserInteract = () => {
      userInteractedRef.current = true;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onUserInteract, { passive: true });

    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onUserInteract);
    };
  }, []);

  const panelSet = (keyPrefix) => (
    <div className="flex h-screen min-h-[800px] shrink-0">
      {panels.map((p, i) => (
        <div
          key={`${keyPrefix}-${i}`}
          className="h-screen min-h-[800px] w-fit shrink-0 overflow-hidden"
        >
          {p}
        </div>
      ))}
    </div>
  );

  return (
    <div
      ref={scrollRef}
      style={{ visibility: "hidden" }}
      className="flex h-screen w-screen overflow-x-scroll overflow-y-hidden scrollbar-hide"
    >
      {panelSet("left")}
      <div ref={setRef} className="flex h-screen min-h-[800px] shrink-0">
        {panels.map((p, i) => (
          <div
            key={`mid-${i}`}
            className="h-screen min-h-[800px] w-fit shrink-0 overflow-hidden"
          >
            {p}
          </div>
        ))}
      </div>
      {panelSet("right")}
    </div>
  );
};

export default HomePanel;
