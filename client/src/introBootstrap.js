export const MOUNTAIN_VIDEO_SRC = "/assets/photos/mountain-view.mp4";

const API_TIMEOUT_MS = 15_000;

function loadIntroFonts() {
  return Promise.all([
    document.fonts.load('400 10rem "TSM"'),
    document.fonts.load('400 1rem "Source Han"'),
  ]).catch(() => {});
}

async function fetchApi(url, { expectArray = false } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const data = await res.json();
    if (expectArray && !Array.isArray(data)) return null;
    return data;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Fetches Spotify / MAL / TMDB without blocking the intro animation. */
export function fetchBootstrapApis() {
  return Promise.all([
    fetchApi("/api/spotify/currently-playing"),
    fetchApi("/api/mal/anime-list", { expectArray: true }),
    fetchApi("/api/tmdb/rated", { expectArray: true }),
  ]).then(([spotify, mal, tmdb]) => ({
    spotify: spotify ?? null,
    mal: mal ?? [],
    tmdb: tmdb ?? [],
  }));
}

/** Resolves when intro-critical assets are ready. APIs and mountain video are deferred. */
export async function runIntroBootstrap() {
  const minDelay = new Promise((r) => setTimeout(r, 300));
  await Promise.all([loadIntroFonts(), minDelay]);
}
