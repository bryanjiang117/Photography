import { lazy, Suspense, useContext, useEffect, useMemo, useRef } from "react";
import { GalleryContext } from "../GalleryContext";

import IntroPanel from "./IntroPanel";

const JapanPanel = lazy(() => import("./JapanPanel"));
const MexicoCityPanel = lazy(() => import("../components/MexicoCityPanel"));
const CanadaPanel = lazy(() => import("./CanadaPanel"));
const ChinaPanel = lazy(() => import("./ChinaPanel"));
const ProjectsPanel = lazy(() => import("../components/ProjectsPanel"));
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

  // Intro-only under the pulsing square so region images / video don't contend.
  const panels = useMemo(() => {
    const intro = <IntroPanel scrollRef={scrollRef} key="intro" />;
    if (!introReady) return [intro];

    return [
      intro,
      <Suspense key="china" fallback={null}>
        <ChinaPanel />
      </Suspense>,
      <Suspense key="japan" fallback={null}>
        <JapanPanel />
      </Suspense>,
      <Suspense key="mexico-city" fallback={null}>
        <MexicoCityPanel />
      </Suspense>,
      <Suspense key="canada" fallback={null}>
        <CanadaPanel />
      </Suspense>,
      <Suspense key="projects" fallback={null}>
        <ProjectsPanel />
      </Suspense>,
      <Suspense key="extras" fallback={null}>
        <ExtrasPanel />
      </Suspense>,
    ];
  }, [introReady]);

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
    // Translate vertical wheel events to horizontal scroll, except inside
    // panels that scroll vertically (e.g. the projects list).
    const onWheel = (e) => {
      userInteractedRef.current = true;
      const verticalRoot =
        e.target instanceof Element
          ? e.target.closest("[data-vertical-scroll]")
          : null;

      if (verticalRoot && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const { scrollTop, scrollHeight, clientHeight } = verticalRoot;
        const atTop = scrollTop <= 0;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
        if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
          e.preventDefault();
        }
        return;
      }

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
