import { useContext, useEffect, useMemo, useRef } from "react";
import { GalleryContext } from "../GalleryContext";

import IntroPanel from "./IntroPanel";
import JapanPanel from "./JapanPanel";
import MexicoCityPanel from "../components/MexicoCityPanel";
import ExtrasPanel from "./ExtrasPanel";
import CanadaPanel from "./CanadaPanel";
import ProjectsPanel from "../components/ProjectsPanel";

// Infinite horizontal scrolling in both directions (panels can have variable width)
const HomePanel = () => {
  const { introReady } = useContext(GalleryContext);
  const scrollRef = useRef(null);
  const setRef = useRef(null);
  const setWidthRef = useRef(0);
  const hasPositionedRef = useRef(false);
  const userInteractedRef = useRef(false);
  const panels = useMemo(() => {
    const items = [
      <IntroPanel scrollRef={scrollRef} key="intro" />,
      <MexicoCityPanel key="mexico-city" />,
      <CanadaPanel key="canada" />,
      <JapanPanel key="japan" />,
      <ProjectsPanel key="projects" />,
    ];
    if (introReady) {
      items.push(<ExtrasPanel key="extras" />);
    }
    return items;
  }, [introReady]);

  useEffect(() => {
    if (!introReady) return;
    const el = scrollRef.current;
    const set = setRef.current;
    if (!el || !set) return;
    el.style.scrollBehavior = "auto";
    el.scrollLeft = setWidthRef.current || set.getBoundingClientRect().width;
    hasPositionedRef.current = true;
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
      if (!introReady) return;
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

    // Mark user interaction so we stop auto-repositioning once the user scrolls.
    // wheel/touchstart won't fire from programmatic scrolls.
    const onUserInteract = () => {
      userInteractedRef.current = true;
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
          el.scrollLeft = introReady ? width : 0;
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
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("wheel", onUserInteract, {
      once: true,
      passive: true,
    });
    window.addEventListener("touchstart", onUserInteract, {
      once: true,
      passive: true,
    });

    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("wheel", onUserInteract);
      window.removeEventListener("touchstart", onUserInteract);
    };
  }, [panels, introReady]);

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
      {introReady && panelSet("left")}
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
      {introReady && panelSet("right")}
    </div>
  );
};

export default HomePanel;
