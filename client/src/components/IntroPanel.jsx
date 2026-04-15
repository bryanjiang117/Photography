import { useEffect, useState } from "react";
import { motion } from "motion/react";

function getTorontoTime() {
  return new Date().toLocaleString("en-CA", {
    timeZone: "America/Toronto",
    hour12: false,
  });
}

const IntroPanel = ({ scrollRef }) => {
  const [time, setTime] = useState(() => getTorontoTime());
  const [showScroll, setShowScroll] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setTime(getTorontoTime()), 1000);

    const onScroll = () => {
      setShowScroll(false);
    };

    let timeout;
    const el = scrollRef.current;
    if (el) {
      timeout = setTimeout(() => el.addEventListener("scroll", onScroll), 1000);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      if (el) {
        el.removeEventListener("scroll", onScroll);
      }
    };
  }, []);

  return (
    <div className="shrink-0 w-screen h-screen relative flex justify-between p-4">
      {/* My name */}
      <section className="flex w-fit">
        <div
          className="text-[calc((100vh-2rem)/3)] leading-none font-tsm [writing-mode:vertical-rl]"
          lang="zh-CN"
          translate="no"
        >
          姜昊周
        </div>
        <div className="-translate-x-2 flex flex-col justify-between h-full">
          <div className="pt-6 [writing-mode:vertical-lr] ">
            This is my name
          </div>
          <div className="mb-4 h-4 w-4 -translate-x-1 bg-primary" />
        </div>
      </section>

      {/* Current time in toronto */}
      <div className="absolute top-6 right-8 flex gap-2">
        <span>Toronto</span>
        <span>‧</span>
        <span>EST</span>
        <span>‧</span>
        <span className="tabular-nums">{time}</span>
        <span>‧</span>
        <div className="flex -translate-y-px">
          <img className="h-6" src="assets/photos/canada-flag.png" />
          <img
            className="-translate-x-1.5 h-6"
            src="assets/photos/china-flag.png"
          />
        </div>
      </div>

      {/* About me  */}
      <div className="absolute bottom-2/10 right-24 max-w-4/10">
        <div className="flex flex-col gap-2">
          <p className="mr-[30%] text-xl font-sh" lang="zh-CN" translate="no">
            你好，我叫姜昊周。我是一名热爱美术的软件工程师。这是我的一些作品。欢迎来到我的网站。
          </p>
          <p className="ml-8 mr-[15%] text-xl leading-tight bodoni-small">
            Nice to meet you. My name is Bryan Jiang. I'm a developer who loves
            visual art. Welcome to my WIP site.
          </p>
        </div>
      </div>

      {/* Scroll Tooltip */}
      {showScroll && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 1,
            duration: 0.6,
            ease: "easeOut",
          }}
          className="absolute bottom-6 right-8 text-lg"
        >
          SCROLL ⇀
        </motion.div>
      )}
    </div>
  );
};

export default IntroPanel;
