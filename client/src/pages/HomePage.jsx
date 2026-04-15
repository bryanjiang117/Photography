import { useEffect, useMemo, useRef } from "react";

import IntroPanel from "../components/IntroPanel";
import JapanPanel from "../components/JapanPanel";
import MexicoCityPanel from "../components/MexicoCityPanel";
import ExtrasPanel from "../components/ExtrasPanel";
import CanadaPage from "./CanadaPage";

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
      <CanadaPage key="canada-page" />,
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

    let safariCorrectTimeout = null;
    const applyInitialScroll = () => {
      const w = leftSet.getBoundingClientRect().width;
      if (w <= 0) return;
      setWidthRef.current = w;
      withInstantScroll(() => {
        el.scrollLeft = w;
      });
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
          // Safari often reports width before layout is final. Re-apply after layout settles.
          safariCorrectTimeout = setTimeout(applyInitialScroll, 150);
        }
      }
    });

    ro.observe(leftSet);
    el.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (safariCorrectTimeout) clearTimeout(safariCorrectTimeout);
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
    };
  }, [panels]);

  return (
    <div
      ref={scrollRef}
      className="flex h-screen w-screen scroll-smooth overflow-x-scroll overflow-y-hidden scrollbar-hide"
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

export default HomePage;
