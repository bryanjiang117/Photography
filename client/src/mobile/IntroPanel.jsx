import { useEffect, useState } from "react";
import { motion } from "motion/react";

function getTorontoTime() {
  return new Date().toLocaleString("en-CA", {
    timeZone: "America/Toronto",
    hour12: false,
  });
}

const IntroPanel = () => {
  const [time, setTime] = useState(() => getTorontoTime());
  const [showScroll, setShowScroll] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setTime(getTorontoTime()), 1000);
    const onScroll = () => setShowScroll(false);
    const timeout = setTimeout(() => {
      window.addEventListener("scroll", onScroll, { once: true });
    }, 1000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
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
          姜昊周
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div>This is my name</div>
          <div data-intro-square className="h-4 w-4 bg-primary" />
        </div>
      </section>

      {/* Time */}
      <div className="flex gap-1.5 flex-wrap justify-center text-sm">
        <span>Toronto</span>
        <span>‧</span>
        <span>EST</span>
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
          <p className="text-base font-sh" lang="zh-CN" translate="no">
            你好，我叫姜昊周。我是一名热爱美术的软件工程师。这是我的一些作品。欢迎来到我的网站。
          </p>
          <p className="text-base leading-tight bodoni-small">
            Nice to meet you. My name is Bryan Jiang. I'm a developer who loves
            visual art. Welcome to my WIP site.
          </p>
        </div>
      </div>

      {/* Scroll tooltip */}
      {showScroll && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6, ease: "easeOut" }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-lg"
        >
          SCROLL ↓
        </motion.div>
      )}
    </div>
  );
};

export default IntroPanel;
