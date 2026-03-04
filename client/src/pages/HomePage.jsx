import { useEffect, useMemo, useRef } from "react";

import IntroPanel from "../components/IntroPanel";
import JapanPanel from "../components/JapanPanel";
import MexicoCityPanel from "../components/MexicoCityPanel";
import ExtrasPanel from "../components/ExtrasPanel";
import CanadaPanel from "../components/CanadaPanel";

const DEFAULT_MIN_PANEL_WIDTH = 1300;

// Optional: override min-width per panel (default 1300). e.g. [1300, 900, 600, 400, ...]
const PANEL_MIN_WIDTHS = [
  DEFAULT_MIN_PANEL_WIDTH,
  DEFAULT_MIN_PANEL_WIDTH,
  DEFAULT_MIN_PANEL_WIDTH,
  DEFAULT_MIN_PANEL_WIDTH,
  1000,
];

// Infinite horizontal scrolling in both directions (panels can have variable width)
const HomePage = () => {
  const scrollRef = useRef(null);
  const leftSetRef = useRef(null);
  const setWidthRef = useRef(0);
  const initialScrollDoneRef = useRef(false);

  const panels = useMemo(
    () => [
      <IntroPanel scrollRef={scrollRef} key="intro" />,
      <JapanPanel key="japan" />,
      <MexicoCityPanel key="mexico-city" />,
      <CanadaPanel key="canada" />,
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

    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width ?? 0;
      if (width > 0) {
        setWidthRef.current = width;
        if (!initialScrollDoneRef.current) {
          withInstantScroll(() => {
            el.scrollLeft = width;
          });
          initialScrollDoneRef.current = true;
        }
      }
    });

    ro.observe(leftSet);
    el.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
    };
  }, [panels]);

  return (
    <div
      ref={scrollRef}
      className="flex h-screen w-screen overflow-x-scroll overflow-y-hidden scroll-smooth scrollbar-hide"
    >
      <div ref={leftSetRef} className="flex h-screen min-h-[700px] shrink-0">
        {panels.map((p, i) => (
          <div
            key={`left-${i}`}
            className="h-screen min-h-[700px] shrink-0 overflow-hidden"
            style={{ minWidth: PANEL_MIN_WIDTHS[i] ?? DEFAULT_MIN_PANEL_WIDTH }}
          >
            {p}
          </div>
        ))}
      </div>
      <div className="flex h-screen min-h-[700px] shrink-0">
        {panels.map((p, i) => (
          <div
            key={`mid-${i}`}
            className="h-screen min-h-[700px] shrink-0 overflow-hidden"
            style={{ minWidth: PANEL_MIN_WIDTHS[i] ?? DEFAULT_MIN_PANEL_WIDTH }}
          >
            {p}
          </div>
        ))}
      </div>
      <div className="flex h-screen min-h-[700px] shrink-0">
        {panels.map((p, i) => (
          <div
            key={`right-${i}`}
            className="h-screen min-h-[700px] shrink-0 overflow-hidden"
            style={{ minWidth: PANEL_MIN_WIDTHS[i] ?? DEFAULT_MIN_PANEL_WIDTH }}
          >
            {p}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
