import {
  lazy,
  Suspense,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
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
  const { introReady, stripReady } = useContext(GalleryContext);
  const introReadyRef = useRef(introReady);
  introReadyRef.current = introReady;
  const scrollRef = useRef(null);
  const setRef = useRef(null);
  const setWidthRef = useRef(0);
  const hasPositionedRef = useRef(false);
  const restoringRef = useRef(false);

  // Extra panels mount while the overlay still covers the page, so the strip
  // width is stable before the user can scroll.
  const panels = useMemo(() => {
    const intro = <IntroPanel scrollRef={scrollRef} key="intro" />;
    if (!stripReady) return [intro];

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
  }, [stripReady]);

  const applySetWidth = (el, width) => {
    if (width <= 0) return;
    const prev = setWidthRef.current;
    el.style.scrollBehavior = "auto";
    restoringRef.current = true;
    if (!hasPositionedRef.current || prev <= 0) {
      el.scrollLeft = width;
      hasPositionedRef.current = true;
    } else if (width !== prev) {
      el.scrollLeft += width - prev;
    }
    setWidthRef.current = width;
    restoringRef.current = false;
    el.style.visibility = "visible";
  };

  useLayoutEffect(() => {
    const el = scrollRef.current;
    const set = setRef.current;
    if (!el || !set) return;
    applySetWidth(el, set.getBoundingClientRect().width);
  }, [stripReady]);

  useEffect(() => {
    const el = scrollRef.current;
    const set = setRef.current;
    if (!el || !set) return;

    const withInstantScroll = (fn) => {
      el.style.scrollBehavior = "auto";
      fn();
    };

    const onScroll = () => {
      if (restoringRef.current) return;
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
      applySetWidth(el, width);
    });

    ro.observe(set);
    // Translate vertical wheel to horizontal scroll, except inside a
    // vertical panel the pointer actually moved into (not one that
    // scrolled under a still cursor).
    let verticalArmed = false;
    const onMouseMove = (e) => {
      verticalArmed =
        e.target instanceof Element &&
        Boolean(e.target.closest("[data-vertical-scroll]"));
    };
    const onWheel = (e) => {
      if (!introReadyRef.current) {
        e.preventDefault();
        return;
      }
      const verticalRoot =
        e.target instanceof Element
          ? e.target.closest("[data-vertical-scroll]")
          : null;

      if (
        verticalRoot &&
        verticalArmed &&
        Math.abs(e.deltaY) > Math.abs(e.deltaX)
      ) {
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

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("mousemove", onMouseMove, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  const panelSet = (keyPrefix) => (
    <div className="flex h-screen min-h-[800px] shrink-0">
      {panels.map((p, i) => (
        <div
          key={`${keyPrefix}-${i}`}
          className="h-screen min-h-[800px] w-fit shrink-0 overflow-clip"
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
      className="flex h-screen w-screen overflow-x-scroll overflow-y-hidden scrollbar-hide scroll-px-16"
    >
      {panelSet("left")}
      <div ref={setRef} className="flex h-screen min-h-[800px] shrink-0">
        {panels.map((p, i) => (
          <div
            key={`mid-${i}`}
            className="h-screen min-h-[800px] w-fit shrink-0 overflow-clip"
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
