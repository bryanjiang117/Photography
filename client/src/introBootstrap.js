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

/** Fetches Spotify / MAL / TMDB / GitHub without blocking the intro animation. */
export function fetchBootstrapApis() {
  return Promise.all([
    fetchApi("/api/spotify/currently-playing"),
    fetchApi("/api/mal/anime-list", { expectArray: true }),
    fetchApi("/api/tmdb/rated", { expectArray: true }),
    fetchApi("/api/github/repo"),
  ]).then(([spotify, mal, tmdb, github]) => ({
    spotify: spotify ?? null,
    mal: mal ?? null,
    tmdb: tmdb ?? null,
    github: github ?? null,
  }));
}

const INTRO_SQUARE_TIMEOUT_MS = 8_000;
const MIN_LOADER_MS = 600;

/** Preload the home chunk so IntroPanel (and data-intro-square) can mount during the loader. */
export function preloadHomeChunk() {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  return isMobile
    ? import("./mobile/MobileHome")
    : import("./panels/HomePanel");
}

function findVisibleIntroSquare() {
  const squares = document.querySelectorAll("[data-intro-square]");
  return (
    Array.from(squares).find((el) => {
      const r = el.getBoundingClientRect();
      return (
        r.width > 0 &&
        r.height > 0 &&
        r.left < window.innerWidth &&
        r.right > 0
      );
    }) ?? null
  );
}

/** Wait until IntroPanel has painted its target square (lazy home chunk may load first). */
export function waitForIntroSquare(timeoutMs = INTRO_SQUARE_TIMEOUT_MS) {
  return new Promise((resolve) => {
    const found = findVisibleIntroSquare();
    if (found) {
      resolve(found);
      return;
    }

    const start = Date.now();
    const tick = () => {
      const el = findVisibleIntroSquare();
      if (el) {
        resolve(el);
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        resolve(null);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

export function introSquareTarget(el) {
  const r = el.getBoundingClientRect();
  return {
    x: r.left + r.width / 2 - window.innerWidth / 2,
    y: r.top + r.height / 2 - window.innerHeight / 2,
  };
}

/** Resolves after min display time + intro fonts (does not block on home chunk). */
export async function runIntroBootstrap() {
  const minDelay = new Promise((r) => setTimeout(r, MIN_LOADER_MS));
  await Promise.all([loadIntroFonts(), minDelay]);
}
