import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseCurrentlyPlaying,
  parseRecentlyPlayed,
  nextCachedNowPlaying,
  needsRecentlyPlayedFallback,
} from "./spotifyNowPlaying.js";

const previous = {
  track: "Old Track",
  artists: ["Old Artist"],
  album: "Old Album",
  albumImage: "https://example.com/old.jpg",
  trackUrl: "https://open.spotify.com/track/old",
  isPlaying: false,
};

const playingJson = {
  is_playing: true,
  item: {
    name: "Now Track",
    artists: [{ name: "Now Artist" }],
    album: {
      name: "Now Album",
      images: [{ url: "https://example.com/now.jpg" }],
    },
    external_urls: { spotify: "https://open.spotify.com/track/now" },
  },
};

const recentJson = {
  items: [
    {
      played_at: "2026-09-07T12:00:00.000Z",
      track: {
        name: "Recent Track",
        artists: [{ name: "Recent Artist" }],
        album: {
          name: "Recent Album",
          images: [{ url: "https://example.com/recent.jpg" }],
        },
        external_urls: { spotify: "https://open.spotify.com/track/recent" },
      },
    },
  ],
};

describe("parseCurrentlyPlaying", () => {
  it("treats 204 as idle so recently-played can fill in", () => {
    assert.equal(parseCurrentlyPlaying(204, null).type, "idle");
  });

  it("parses a playing track", () => {
    const result = parseCurrentlyPlaying(200, playingJson);
    assert.equal(result.type, "track");
    assert.equal(result.track.track, "Now Track");
    assert.equal(result.track.isPlaying, true);
    assert.deepEqual(result.track.artists, ["Now Artist"]);
  });

  it("treats 429 as rate-limited", () => {
    assert.equal(parseCurrentlyPlaying(429, null).type, "rate-limited");
  });
});

describe("parseRecentlyPlayed", () => {
  it("parses the most recent track", () => {
    const result = parseRecentlyPlayed(200, recentJson);
    assert.equal(result.type, "track");
    assert.equal(result.track.track, "Recent Track");
    assert.equal(result.track.isPlaying, false);
    assert.equal(result.track.playedAt, "2026-09-07T12:00:00.000Z");
  });

  it("treats 429 as rate-limited", () => {
    assert.equal(parseRecentlyPlayed(429, null).type, "rate-limited");
  });
});

describe("nextCachedNowPlaying", () => {
  it("keeps last known track when nothing is playing and recently-played is rate-limited", () => {
    const next = nextCachedNowPlaying(
      previous,
      parseCurrentlyPlaying(204, null),
      parseRecentlyPlayed(429, null),
    );
    assert.equal(next, previous);
  });

  it("keeps last known track when currently-playing is 429", () => {
    const next = nextCachedNowPlaying(
      previous,
      parseCurrentlyPlaying(429, null),
      null,
    );
    assert.equal(next, previous);
  });

  it("uses the currently playing track", () => {
    const next = nextCachedNowPlaying(
      previous,
      parseCurrentlyPlaying(200, playingJson),
      null,
    );
    assert.equal(next.track, "Now Track");
    assert.equal(next.isPlaying, true);
  });

  it("uses recently played when currently-playing is idle", () => {
    const next = nextCachedNowPlaying(
      previous,
      parseCurrentlyPlaying(204, null),
      parseRecentlyPlayed(200, recentJson),
    );
    assert.equal(next.track, "Recent Track");
    assert.equal(next.isPlaying, false);
  });

  it("keeps last known track when recently-played is empty", () => {
    const next = nextCachedNowPlaying(
      previous,
      parseCurrentlyPlaying(204, null),
      parseRecentlyPlayed(200, { items: [] }),
    );
    assert.equal(next, previous);
  });

  it("uses recently played when currently-playing is rate-limited", () => {
    const next = nextCachedNowPlaying(
      previous,
      parseCurrentlyPlaying(429, null),
      parseRecentlyPlayed(200, recentJson),
    );
    assert.equal(next.track, "Recent Track");
  });

  it("uses recently played when currently-playing errors", () => {
    const next = nextCachedNowPlaying(
      previous,
      parseCurrentlyPlaying(500, null),
      parseRecentlyPlayed(200, recentJson),
    );
    assert.equal(next.track, "Recent Track");
  });
});

describe("needsRecentlyPlayedFallback", () => {
  it("is true whenever currently-playing did not return a track", () => {
    assert.equal(needsRecentlyPlayedFallback(parseCurrentlyPlaying(204, null)), true);
    assert.equal(needsRecentlyPlayedFallback(parseCurrentlyPlaying(429, null)), true);
    assert.equal(needsRecentlyPlayedFallback(parseCurrentlyPlaying(401, null)), true);
    assert.equal(needsRecentlyPlayedFallback(parseCurrentlyPlaying(500, null)), true);
    assert.equal(
      needsRecentlyPlayedFallback(parseCurrentlyPlaying(200, playingJson)),
      false,
    );
  });
});
