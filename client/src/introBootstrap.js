import { GALLERY_PREFETCH_URLS } from "./constants/data";
import { warmGalleryImages } from "./galleryPrefetch";

export const MOUNTAIN_VIDEO_SRC = "/assets/photos/mountain-view.mp4";

const INTRO_GALLERY_HEAD_COUNT = 16;

const API_TIMEOUT_MS = 15_000;
const VIDEO_TIMEOUT_MS = 20_000;

function loadIntroFonts() {
  return Promise.all([
    document.fonts.load('400 10rem "TSM"'),
    document.fonts.load('400 1rem "Source Han"'),
    document.fonts.load('400 1rem "Bodoni"'),
  ]).catch(() => {});
}

export function preloadMountainVideo(src = MOUNTAIN_VIDEO_SRC) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const timeoutId = setTimeout(finish, VIDEO_TIMEOUT_MS);
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.addEventListener(
      "canplaythrough",
      () => {
        clearTimeout(timeoutId);
        finish();
      },
      { once: true },
    );
    video.addEventListener(
      "error",
      () => {
        clearTimeout(timeoutId);
        finish();
      },
      { once: true },
    );
    video.src = src;
    video.load();
  });
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

/** Resolves after fonts, min delay, video preload, and all API attempts (failures ignored). */
export async function runIntroBootstrap() {
  const minDelay = new Promise((r) => setTimeout(r, 300));

  // Warm first gallery images during the intro (do not block on full set).
  warmGalleryImages(GALLERY_PREFETCH_URLS.slice(0, INTRO_GALLERY_HEAD_COUNT), {
    concurrency: 6,
  });

  const [, , , spotify, mal, tmdb] = await Promise.all([
    loadIntroFonts(),
    minDelay,
    preloadMountainVideo(),
    fetchApi("/api/spotify/currently-playing"),
    fetchApi("/api/mal/anime-list", { expectArray: true }),
    fetchApi("/api/tmdb/rated", { expectArray: true }),
  ]);

  return {
    spotify: spotify ?? null,
    mal: mal ?? [],
    tmdb: tmdb ?? [],
  };
}
