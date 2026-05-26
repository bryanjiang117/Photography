import Marquee from "react-fast-marquee";
import { motion } from "motion/react";
import SectionTitle from "./SectionTitle";
import { useSpotify } from "../SpotifyContext.jsx";

const SpotifyComponent = () => {
  const spotifyState = useSpotify();

  return (
    <div className="flex flex-col items-center gap-3 p-4 w-full">
      <div className="self-start">
        <SectionTitle
          english={
            !spotifyState || spotifyState.isPlaying
              ? "CURRENTLY PLAYING"
              : "RECENTLY PLAYED"
          }
          chinese="此刻播放"
        />
      </div>
      {spotifyState ? (
        <img className="max-h-40" src={spotifyState.albumImage} />
      ) : (
        <motion.img
          animate={{ rotate: 360 }}
          transition={{ duration: 3, ease: "linear", repeat: Infinity }}
          className="max-h-40"
          src="/assets/vinyl.png"
        />
      )}
      <div className="w-full">
        <Marquee speed={20} direction="left" loop={0} autoFill>
          {spotifyState ? (
            <div className="flex font-tsm text-sm">
              <span className="px-2">‧</span>
              {spotifyState.track}
              <span className="px-2">‧</span>
              {spotifyState.artists.join(", ")}
            </div>
          ) : (
            <div className="px-2 font-tsm text-sm">
              Spotify rate-limited me D:
            </div>
          )}
        </Marquee>
      </div>
    </div>
  );
};

export default SpotifyComponent;
