function artistsOf(artists) {
  return artists?.map((a) => a.name) ?? [];
}

export function parseCurrentlyPlaying(status, json) {
  if (status === 429) return { type: "rate-limited" };
  if (status === 401) return { type: "unauthorized" };
  if (status === 204) return { type: "idle" };
  if (status < 200 || status >= 300) return { type: "error", status };

  const item = json?.item;
  if (!item) return { type: "idle" };

  return {
    type: "track",
    track: {
      track: item.name,
      artists: artistsOf(item.artists),
      album: item.album?.name,
      albumImage: item.album?.images?.[0]?.url,
      trackUrl: item.external_urls?.spotify ?? null,
      isPlaying: json.is_playing ?? true,
    },
  };
}

export function parseRecentlyPlayed(status, json) {
  if (status === 429) return { type: "rate-limited" };
  if (status < 200 || status >= 300) return { type: "error", status };

  const item = json?.items?.[0];
  if (!item) return { type: "empty" };

  return {
    type: "track",
    track: {
      track: item.track.name,
      artists: artistsOf(item.track.artists),
      album: item.track.album?.name,
      albumImage: item.track.album?.images?.[0]?.url,
      trackUrl: item.track.external_urls?.spotify ?? null,
      isPlaying: false,
      playedAt: item.played_at,
    },
  };
}

/** Prefer currently-playing; otherwise recently-played; otherwise last known. */
export function nextCachedNowPlaying(previous, currentResult, recentResult) {
  if (currentResult.type === "track") return currentResult.track;
  if (recentResult?.type === "track") return recentResult.track;
  return previous;
}

export function needsRecentlyPlayedFallback(currentResult) {
  return currentResult.type !== "track";
}
