import { createContext, useContext, useEffect, useState } from "react";
import { GalleryContext } from "./GalleryContext";

const SpotifyContext = createContext(null);

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");
/** Client only hits our cache; keep this slower on localhost. */
const POLL_INTERVAL_MS = isLocalhost ? 2 * 60_000 : 10_000;

export function SpotifyProvider({ children, initialState = null }) {
  const { introReady } = useContext(GalleryContext);
  const [spotifyState, setSpotifyState] = useState(initialState);

  useEffect(() => {
    setSpotifyState(initialState);
  }, [initialState]);

  useEffect(() => {
    if (!introReady) return;
    let cancelled = false;
    let timeoutId;

    async function poll() {
      if (cancelled) return;
      try {
        const res = await fetch("/api/spotify/currently-playing");
        if (!res.ok) throw new Error("Failed to get Spotify currently playing");
        const data = await res.json();
        if (!cancelled) setSpotifyState(data);
      } catch {
        // keep last known state on transient failures
      }
      if (!cancelled) {
        timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    // Delay first poll so bootstrap fetch isn't duplicated on intro unlock.
    timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [introReady]);

  return (
    <SpotifyContext.Provider value={spotifyState}>
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify() {
  return useContext(SpotifyContext);
}
