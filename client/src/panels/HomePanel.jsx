import { useEffect, useMemo, useRef } from "react";

import IntroPanel from "./IntroPanel";
import JapanPanel from "./JapanPanel";
import MexicoCityPanel from "../components/MexicoCityPanel";
import ExtrasPanel from "./ExtrasPanel";
import CanadaPanel from "./CanadaPanel";
import ProjectsPanel from "../components/ProjectsPanel";

// Infinite horizontal scrolling in both directions (panels can have variable width)
const HomePanel = () => {
  const scrollRef = useRef(null);
  const leftSetRef = useRef(null);
  const setWidthRef = useRef(0);
  const hasPositionedRef = useRef(false);
  const userInteractedRef = useRef(false);
  const panels = useMemo(
    () => [
      <IntroPanel scrollRef={scrollRef} key="intro" />,
      <JapanPanel key="japan" />,
      <MexicoCityPanel key="mexico-city" />,
      <CanadaPanel key="canada" />,
      <ProjectsPanel key="projects" />,
      <ExtrasPanel key="extras" />,
    ],
    [],
  );

  useEffect(() => {
    const el = scrollRef.current;
    const leftSet = leftSetRef.current;
    if (!el || !leftSet) return;

    const withInstantScroll = (fn) => {
      el.style.scrollBehavior = "auto";
      fn();
    };

    const onScroll = () => {
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
          el.scrollLeft = width;
        });
        hasPositionedRef.current = true;
      }

      // ResizeObserver callbacks fire before the browser paints, so making the
      // container visible here means the user never sees scrollLeft=0.
      el.style.visibility = "visible";
    });

    ro.observe(leftSet);
    el.addEventListener("scroll", onScroll, { passive: true });
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
      window.removeEventListener("wheel", onUserInteract);
      window.removeEventListener("touchstart", onUserInteract);
    };
  }, [panels]);

  return (
    <div
      ref={scrollRef}
      style={{ visibility: "hidden" }}
      className="flex h-screen w-screen overflow-x-scroll overflow-y-hidden scrollbar-hide"
    >
      <div ref={leftSetRef} className="flex h-screen min-h-[700px] shrink-0">
        {panels.map((p, i) => (
          <div
            key={`left-${i}`}
            className="h-screen min-h-[700px] w-fit shrink-0 overflow-hidden"
          >
            {p}
          </div>
        ))}
      </div>
      <div className="flex h-screen min-h-[700px] shrink-0">
        {panels.map((p, i) => (
          <div
            key={`mid-${i}`}
            className="h-screen min-h-[700px] w-fit shrink-0 overflow-hidden"
          >
            {p}
          </div>
        ))}
      </div>
      <div className="flex h-screen min-h-[700px] shrink-0">
        {panels.map((p, i) => (
          <div
            key={`right-${i}`}
            className="h-screen min-h-[700px] w-fit shrink-0 overflow-hidden"
          >
            {p}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePanel;
