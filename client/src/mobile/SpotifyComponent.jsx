import Marquee from "react-fast-marquee";
import SectionTitle from "./SectionTitle";
import { useSpotify } from "../SpotifyContext.jsx";
import { EXTRAS_COPY } from "../constants/data";

const SpotifyComponent = () => {
  const spotifyState = useSpotify();
  const currentlyPlaying = spotifyState && spotifyState.isPlaying;
  const copy = currentlyPlaying
    ? EXTRAS_COPY.spotify.currently
    : EXTRAS_COPY.spotify.recently;

  return (
    <div className="flex flex-col items-center gap-3 py-4 w-full">
      <div className="w-full px-4">
        <SectionTitle english={copy.en} chinese={copy.zh} />
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
              {EXTRAS_COPY.spotify.rateLimited}
            </div>
          )}
        </Marquee>
      </div>
    </div>
  );
};

export default SpotifyComponent;
