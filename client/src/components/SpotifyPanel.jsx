import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";

const SpotifyPanel = () => {
  const [spotifyState, setSpotifyState] = useState({
    track: "",
    artists: [],
    albumImage: null,
  });

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

  return spotifyState ? (
    <div className="relative flex h-48 p-4 pr-9 w-fit border">
      {/* text-[5rem] because 6rem - 1rem of padding */}
      <div className="flex flex-col min-w-125 h-full basis-20 shrink-0 text-[5rem] leading-none font-bold">
        <div>RECENTLY</div>
        <div className="flex items-center">
          <div>PLAYING :&nbsp;</div>
          <div className="flex flex-col flex-1 justify-center">
            <div
              className="text-center text-[2rem] leading-none font-tsm"
              lang="zh-CN"
            >
              此刻
            </div>
            <div
              className="text-center text-[2rem] leading-none font-tsm"
              lang="zh-CN"
            >
              播放
            </div>
          </div>
        </div>
      </div>
      <img className="ml-2 max-h-full" src={spotifyState.albumImage} />
      {/* TODO: handle when text is too long. probably carousel */}
      <div className="absolute top-4 right-0 h-10 w-39">
        <Marquee
          className="origin-top-left rotate-90 translate-x-36"
          speed={4}
          direction="left"
          loop={0}
        >
          <div className="flex mt-px ml-4 whitespace-nowrap font-tsm">
            {spotifyState.track}
            <span className="px-2 -translate-x-px">‧</span>
            {spotifyState.artists.join(", ")}
          </div>
        </Marquee>
      </div>
    </div>
  ) : (
    <div>Spotify not found</div>
  );
};

export default SpotifyPanel;
