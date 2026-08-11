import Marquee from "react-fast-marquee";
import SectionTitle from "./SectionTitle";
import { useSpotify } from "../SpotifyContext.jsx";

const SpotifyComponent = () => {
  const spotifyState = useSpotify();
  const currentlyPlaying = spotifyState && spotifyState.isPlaying;

  return (
    <div className="flex flex-col items-center gap-3 py-4 w-full">
      <div className="self-start px-4">
        <SectionTitle
          english={currentlyPlaying ? "CURRENTLY PLAYING" : "RECENTLY PLAYED"}
          chinese={currentlyPlaying ? "此刻播放" : "最近播放"}
        />
      </div>
      {spotifyState ? (
        spotifyState.trackUrl ? (
          <a
            href={spotifyState.trackUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img className="max-h-40" src={spotifyState.albumImage} alt="" />
          </a>
        ) : (
          <img className="max-h-40" src={spotifyState.albumImage} alt="" />
        )
      ) : (
        <img className="max-h-40 vinyl-spin" src="/assets/vinyl.png" alt="" />
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
