import { useEffect, useMemo, useRef } from "react";

import IntroPanel from "../components/IntroPanel";
import JapanPanel from "../components/JapanPanel";
import MexicoPanel from "../components/MexicoPanel";

// Infinite horizontal scrolling in both directions
const HomePage = () => {
  const scrollerRef = useRef(null);

  const panels = useMemo(
    () => [
      <IntroPanel key="intro" />,
      <JapanPanel key="japan" />,
      <MexicoPanel key="mexico" />,
    ],
    [],
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const panelCount = panels.length;

    const getPanelWidth = () => el.clientWidth;
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

    const onResize = () => {
      withInstantScroll(() => {
        el.scrollLeft = getSetWidth();
      });
    };
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [panels]);

  return (
    <div
      ref={scrollerRef}
      className="flex h-screen w-screen overflow-x-scroll overflow-y-hidden scroll-smooth scrollbar-hide"
    >
      {panels.map((p, i) => (
        <div key={`left-${i}`} className="shrink-0 w-screen h-screen">
          {p}
        </div>
      ))}

      {panels.map((p, i) => (
        <div key={`mid-${i}`} className="shrink-0 w-screen h-screen">
          {p}
        </div>
      ))}

      {panels.map((p, i) => (
        <div key={`right-${i}`} className="shrink-0 w-screen h-screen">
          {p}
        </div>
      ))}
    </div>
  );
};

export default HomePage;
