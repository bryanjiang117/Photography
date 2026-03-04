import { useEffect, useMemo, useRef } from "react";

import IntroPanel from "../components/IntroPanel";
import JapanPanel from "../components/JapanPanel";
import MexicoCityPanel from "../components/MexicoCityPanel";
import ExtrasPanel from "../components/ExtrasPanel";

const MIN_PANEL_WIDTH = 1300;

// Infinite horizontal scrolling in both directions
const HomePage = () => {
  const scrollRef = useRef(null);

  const panels = useMemo(
    () => [
      <IntroPanel scrollRef={scrollRef} key="intro" />,
      <JapanPanel key="japan" />,
      <MexicoCityPanel key="mexico-city" />,
      <ExtrasPanel key="extras" />,
    ],
    [],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const panelCount = panels.length;

    const getPanelWidth = () => Math.max(el.clientWidth, MIN_PANEL_WIDTH);
    const getSetWidth = () => getPanelWidth() * panelCount;

    const withInstantScroll = (fn) => {
      const prev = el.style.scrollBehavior;
      el.style.scrollBehavior = "auto";
      fn();
      el.style.scrollBehavior = prev;
    };

    withInstantScroll(() => {
      el.scrollLeft = getSetWidth();
    });

    const onScroll = () => {
      const setWidth = getSetWidth();
      const jumpThreshold = 10;

      // left wrap
      if (el.scrollLeft <= jumpThreshold) {
        withInstantScroll(() => {
          el.scrollLeft += setWidth;
        });
        return;
      }

      // right wrap
      if (el.scrollLeft >= setWidth * 2 - el.clientWidth - jumpThreshold) {
        withInstantScroll(() => {
          el.scrollLeft -= setWidth;
        });
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      el.removeEventListener("scroll", onScroll);
    };
  }, [panels]);

  return (
    <div
      ref={scrollRef}
      className="flex h-screen w-screen overflow-x-scroll overflow-y-hidden scroll-smooth scrollbar-hide"
    >
      {panels.map((p, i) => (
        <div
          key={`left-${i}`}
          className={`h-screen min-h-[700px] min-w-[${MIN_PANEL_WIDTH}px] shrink-0 w-screen overflow-hidden`}
        >
          {p}
        </div>
      ))}

      {panels.map((p, i) => (
        <div
          key={`mid-${i}`}
          className={`h-screen min-h-[700px] min-w-[${MIN_PANEL_WIDTH}px] shrink-0 w-screen overflow-hidden`}
        >
          {p}
        </div>
      ))}

      {panels.map((p, i) => (
        <div
          key={`right-${i}`}
          className={`h-screen min-h-[700px] min-w-[${MIN_PANEL_WIDTH}px] shrink-0 w-screen overflow-hidden`}
        >
          {p}
        </div>
      ))}
    </div>
  );
};

export default HomePage;
