import { createContext, useContext, useEffect, useState } from "react";

const SpotifyContext = createContext(null);

const POLL_INTERVAL_MS = 10_000;

export function SpotifyProvider({ children }) {
  const [spotifyState, setSpotifyState] = useState(null);

  useEffect(() => {
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

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <SpotifyContext.Provider value={spotifyState}>
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify() {
  return useContext(SpotifyContext);
}
