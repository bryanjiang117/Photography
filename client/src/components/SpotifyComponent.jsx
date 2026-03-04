import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import { motion } from "motion/react";

const SpotifyPanel = () => {
  const [spotifyState, setSpotifyState] = useState(null);

  console.log(spotifyState);

  async function getCurrentlyPlaying() {
    const res = await fetch("/api/spotify/currently-playing");

    if (!res.ok) {
      throw new Error("Failed to get Spotify currently playing", res.status);
    }

    const data = await res.json();
    setSpotifyState(data);
  }

  useEffect(() => {
    getCurrentlyPlaying();
    const interval = setInterval(() => getCurrentlyPlaying(), 10000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-1 justify-center items-center p-8 h-full min-w-fit min-h-fit">
      <div className="relative flex h-48 p-4 pr-9 w-fit">
        {/* text-[5rem] because 6rem - 1rem of padding */}
        <div
          className={`flex flex-col pr-4 h-full basis-20 shrink-0 text-[5rem] leading-20 font-bold`}
        >
          <div>
            {!spotifyState || spotifyState.isPlaying ? "CURRENTLY" : "RECENTLY"}
          </div>
          <div className="flex items-center justify-between">
            <span>
              {!spotifyState || spotifyState.isPlaying ? "PLAYING" : "PLAYED"}
            </span>
            <span className="ml-1">:</span>
            <div className="flex flex-col justify-center">
              <div
                className="text-center text-[2rem] leading-8 font-tsm"
                lang="zh-CN"
              >
                此刻
              </div>
              <div
                className="text-center text-[2rem] leading-8 font-tsm"
                lang="zh-CN"
              >
                播放
              </div>
            </div>
          </div>
        </div>
        {spotifyState ? (
          <img className="ml-2 max-h-full" src={spotifyState.albumImage} />
        ) : (
          <motion.img
            animate={{ rotate: 360 }}
            transition={{
              duration: 3,
              ease: "linear",
              repeat: Infinity,
            }}
            className="max-h-full"
            src="/assets/vinyl.png"
            transformOrigin="center"
          />
        )}

        <div className="absolute top-4 right-0 h-10 w-39">
          <Marquee
            className="origin-top-left rotate-90 translate-x-36"
            speed={2}
            direction="left"
            loop={0}
          >
            {spotifyState ? (
              <div className="flex mt-px ml-4 font-tsm">
                {spotifyState.track}
                <span className="px-2 -translate-x-px">‧</span>
                {spotifyState.artists.join(", ")}
              </div>
            ) : (
              <div className="px-2 font-tsm">Spotify rate-limited me D:</div>
            )}
          </Marquee>
        </div>
      </div>
    </div>
  );
};

export default SpotifyPanel;
