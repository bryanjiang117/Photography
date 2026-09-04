import { useContext, useEffect, useState } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";
import { INTRO } from "../constants/data";

function getTorontoTime() {
  return new Date().toLocaleString("en-CA", {
    timeZone: "America/Toronto",
    hour12: false,
  });
}

const IntroPanel = () => {
  const { introReady } = useContext(GalleryContext);
  const [time, setTime] = useState(() => getTorontoTime());
  const [showScroll, setShowScroll] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setTime(getTorontoTime()), 1000);
    const onScroll = () => setShowScroll(false);
    const timeout = setTimeout(() => {
      const scroller = document.getElementById("root") ?? window;
      scroller.addEventListener("scroll", onScroll, { once: true });
    }, 1000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      (document.getElementById("root") ?? window).removeEventListener(
        "scroll",
        onScroll,
      );
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="w-full min-h-screen relative flex flex-col items-center justify-start gap-6 px-6 py-8">
      {/* Name */}
      <section className="flex flex-col items-center">
        <div
          className="mt-8 text-[calc((100vw-3rem)/3)] leading-none font-tsm [writing-mode:vertical-rl]"
          lang="zh-CN"
          translate="no"
        >
          {INTRO.nameZh}
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div>{INTRO.nameCaption}</div>
          <div data-intro-square className="h-4 w-4 bg-primary" />
        </div>
      </section>

      {/* Time */}
      <div className="flex gap-1.5 flex-wrap justify-center text-sm">
        <span>{INTRO.location}</span>
        <span>‧</span>
        <span>{INTRO.timezone}</span>
        <span>‧</span>
        <span className="tabular-nums">{time}</span>
        <span>‧</span>
        <div className="flex">
          <img className="h-5" src="assets/photos/canada-flag.avif" />
          <img
            className="-translate-x-1.5 h-5"
            src="assets/photos/china-flag.avif"
          />
        </div>
      </div>

      {/* About */}
      <div className="mt-auto pb-12 max-w-full">
        <div className="flex flex-col gap-2">
          <div className="text-base leading-tight bodoni-small">
            {INTRO.blurbEnBefore}
            <h1 className="inline m-0 p-0 text-[length:inherit] leading-[inherit] font-[inherit] font-normal">
              {INTRO.nameEn}
            </h1>
            {INTRO.blurbEnAfter}
          </div>
          <p className="text-sm font-sh" lang="zh-CN" translate="no">
            {INTRO.blurbZh}
          </p>
        </div>
      </div>

      {/* Scroll tooltip */}
      {showScroll && introReady && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-lg"
        >
          SCROLL ↓
        </motion.div>
      )}
    </div>
  );
};

export default IntroPanel;
