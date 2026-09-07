import crypto from "crypto";
import { createJsonCache } from "./cacheStore.js";
import { nextRateLimitedUntilMs } from "./spotifyRateLimit.js";
import {
  parseCurrentlyPlaying,
  parseRecentlyPlayed,
  nextCachedNowPlaying,
  needsRecentlyPlayedFallback,
} from "./spotifyNowPlaying.js";

const EXPIRY_BUFFER_MS = 30_000; // 30 seconds
const SPOTIFY_POLL_PRODUCTION_MS = 60_000; // 1 minute in production
const SPOTIFY_POLL_LOCAL_MS = 15 * 60_000; // 15 minutes on localhost — spare the API
const isLocalDev =
  /localhost|127\.0\.0\.1/.test(process.env.FRONTEND_ORIGIN ?? "") ||
  /localhost|127\.0\.0\.1/.test(process.env.BACKEND_ORIGIN ?? "") ||
  (!process.env.BACKEND_ORIGIN && !process.env.RENDER && !process.env.RENDER_EXTERNAL_URL);
const SPOTIFY_POLL_INTERVAL_MS = isLocalDev
  ? SPOTIFY_POLL_LOCAL_MS
  : SPOTIFY_POLL_PRODUCTION_MS;
/** Fallback wait when Spotify 429 omits Retry-After */
const SPOTIFY_RATE_LIMIT_FALLBACK_MS = SPOTIFY_POLL_INTERVAL_MS * 2;

/*
PKCE helpers
*/
function base64UrlEncode(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function makeCodeVerifier() {
  return base64UrlEncode(crypto.randomBytes(32));
}

function makeCodeChallenge(verifier) {
  const hash = crypto.createHash("sha256").update(verifier).digest();
  return base64UrlEncode(hash);
}

export async function registerSpotifyRoutes(app, supabase) {
  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

  const nowPlayingCache = createJsonCache(supabase, "cache_spotify_now");

  // In-memory token cache (resets when server restarts)
  let cachedAccessToken = null;
  let accessTokenExpiresAtMs = 0;
  let refreshToken = null;

  // PKCE verifiers keyed by OAuth `state` (survives cookie loss on Safe Browsing interstitials)
  const pendingPkce = new Map();

  // In-memory "now playing" cache (shared by ALL users); hydrated from DB on boot
  let cachedNowPlaying = null;
  let cachedNowPlayingUpdatedAt = 0;
  let isRefreshingNowPlaying = false;
  /** Skip Spotify API calls until this time after a 429 */
  let rateLimitedUntilMs = 0;

  async function persistNowPlaying() {
    await nowPlayingCache.save({
      data: cachedNowPlaying,
      updatedAt: cachedNowPlayingUpdatedAt,
    });
  }

  /*
  1) One-time route: you visit this in browser to connect your Spotify account
  */
  app.get("/api/spotify/login", (req, res) => {
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_REDIRECT_URI) {
      return res
        .status(500)
        .send(
          "Missing SPOTIFY_CLIENT_ID or SPOTIFY_REDIRECT_URI in server env",
        );
    }

    const codeVerifier = makeCodeVerifier();
    const codeChallenge = makeCodeChallenge(codeVerifier);

    // Prefer HTTPS Secure cookies in production so Chrome keeps the PKCE
    // verifier across the Spotify redirect (esp. after Safe Browsing interstitials).
    const isHttps =
      process.env.BACKEND_ORIGIN?.startsWith("https") ||
      req.secure ||
      req.headers["x-forwarded-proto"] === "https";

    const state = base64UrlEncode(crypto.randomBytes(16));
    pendingPkce.set(state, {
      verifier: codeVerifier,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    res.cookie("spotify_code_verifier", codeVerifier, {
      httpOnly: true,
      sameSite: "lax",
      secure: Boolean(isHttps),
      maxAge: 10 * 60 * 1000, // 10 min
    });

    const scope = [
      "user-read-currently-playing",
      "user-read-recently-played",
    ].join(" ");

    const params = new URLSearchParams({
      response_type: "code",
      client_id: SPOTIFY_CLIENT_ID,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
      state,
      scope,
      // Force consent so a stale/revoked grant is replaced on re-login
      show_dialog: "true",
    });

    res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
  });

  /*
  2) Callback: Spotify redirects here with ?code=...
  */
  app.get("/api/spotify/callback", async (req, res) => {
    try {
      if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REDIRECT_URI) {
        return res.status(500).send(
          "Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET / SPOTIFY_REDIRECT_URI in server env",
        );
      }

      const code = req.query.code;
      const state = typeof req.query.state === "string" ? req.query.state : null;
      const pending = state ? pendingPkce.get(state) : null;
      if (state) pendingPkce.delete(state);

      const codeVerifier =
        (pending && pending.expiresAt > Date.now() && pending.verifier) ||
        req.cookies.spotify_code_verifier;

      if (!code || typeof code !== "string") {
        return res.status(400).send("Missing ?code in callback");
      }
      if (!codeVerifier) {
        return res.status(400).send(
          "Missing PKCE verifier (cookie/state) — go to /api/spotify/login again",
        );
      }

      const basic = Buffer.from(
        `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`,
      ).toString("base64");

      const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basic}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: SPOTIFY_REDIRECT_URI,
          code_verifier: codeVerifier,
        }),
      });

      const tokenJson = await tokenRes.json();
      if (!tokenRes.ok) {
        return res.status(tokenRes.status).send(
          `Spotify token exchange failed (${tokenRes.status}): ${tokenJson.error_description ?? tokenJson.error ?? JSON.stringify(tokenJson)}`,
        );
      }

      refreshToken = tokenJson.refresh_token;
      if (!refreshToken) {
        return res.status(500).send(
          "No refresh_token in Spotify response — try /api/spotify/login again",
        );
      }

      const { error: dbError } = await supabase.from("tokens").upsert({
        name: "spotify_refresh_token",
        value: refreshToken,
        updated_at: new Date(),
      });

      if (dbError) {
        return res.status(500).send(`Failed to save refresh token: ${dbError.message}`);
      }

      res.clearCookie("spotify_code_verifier");
      return res.status(200).send("Spotify logged in.");
    } catch (e) {
      return res.status(500).send(e?.message ?? "Unknown error");
    }
  });

  async function loadRefreshTokenFromDb() {
    const { data, error } = await supabase
      .from("tokens")
      .select("value")
      .eq("name", "spotify_refresh_token")
      .single();

    if (error) {
      console.log("No refresh token found in DB at startup.");
      return null;
    }

    return data.value;
  }

  async function refreshAccessToken() {
    if (!refreshToken) {
      refreshToken = await loadRefreshTokenFromDb();
    }

    if (!refreshToken) {
      throw new Error("Missing SPOTIFY_REFRESH_TOKEN");
    }

    const basic = Buffer.from(
      `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`,
    ).toString("base64");

    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basic}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const tokenJson = await tokenRes.json();

    if (!tokenRes.ok) {
      throw new Error(
        `Refresh failed: ${tokenRes.status} ${JSON.stringify(tokenJson)}`,
      );
    }

    cachedAccessToken = tokenJson.access_token;
    accessTokenExpiresAtMs = Date.now() + tokenJson.expires_in * 1000;

    // Spotify often omits refresh_token on refresh — keep the existing one.
    // Writing undefined/null here used to wipe the DB token and cause 401s.
    if (tokenJson.refresh_token) {
      refreshToken = tokenJson.refresh_token;

      const { error } = await supabase.from("tokens").upsert({
        name: "spotify_refresh_token",
        value: refreshToken,
        updated_at: new Date(),
      });

      if (error) {
        console.error("Insert failed:", error.message);
      }
    }

    return cachedAccessToken;
  }

  async function getAccessToken() {
    const tokenStillValid =
      cachedAccessToken &&
      Date.now() < accessTokenExpiresAtMs - EXPIRY_BUFFER_MS;

    if (tokenStillValid) {
      return cachedAccessToken;
    }

    return await refreshAccessToken();
  }

  function applyRateLimit(retryAfterHeader, endpoint) {
    const now = Date.now();
    rateLimitedUntilMs = nextRateLimitedUntilMs(
      retryAfterHeader,
      now,
      SPOTIFY_RATE_LIMIT_FALLBACK_MS,
    );
    const waitSec = Math.ceil((rateLimitedUntilMs - now) / 1000);
    console.warn(
      `[spotify] rate limited (${endpoint}). Waiting ${waitSec}s before next poll (Retry-After=${retryAfterHeader ?? "none"}).`,
    );
  }

  async function refreshNowPlayingCache() {
    if (isRefreshingNowPlaying) return;
    if (Date.now() < rateLimitedUntilMs) return;
    isRefreshingNowPlaying = true;

    try {
      const accessToken = await getAccessToken();

      const currentlyPlayingRes = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      let currentJson = null;
      if (
        currentlyPlayingRes.status !== 204 &&
        currentlyPlayingRes.status !== 429 &&
        currentlyPlayingRes.status !== 401
      ) {
        try {
          currentJson = await currentlyPlayingRes.json();
        } catch (parseErr) {
          console.error(
            "[spotify] currently-playing parse error:",
            parseErr?.message ?? parseErr,
          );
        }
      }

      const currentResult = parseCurrentlyPlaying(
        currentlyPlayingRes.status,
        currentJson,
      );

      if (currentResult.type === "rate-limited") {
        applyRateLimit(
          currentlyPlayingRes.headers.get("Retry-After"),
          "currently-playing",
        );
      }

      if (currentResult.type === "unauthorized") {
        cachedAccessToken = null;
        accessTokenExpiresAtMs = 0;
      }

      let recentResult = null;
      if (needsRecentlyPlayedFallback(currentResult)) {
        const lastPlayedRes = await fetch(
          "https://api.spotify.com/v1/me/player/recently-played?limit=1",
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );

        let recentJson = null;
        if (lastPlayedRes.status !== 429) {
          try {
            recentJson = await lastPlayedRes.json();
          } catch (parseErr) {
            console.error(
              "[spotify] recently-played parse error:",
              parseErr?.message ?? parseErr,
            );
          }
        }

        recentResult = parseRecentlyPlayed(lastPlayedRes.status, recentJson);

        if (recentResult.type === "rate-limited") {
          applyRateLimit(
            lastPlayedRes.headers.get("Retry-After"),
            "recently-played",
          );
        } else if (recentResult.type === "error") {
          throw new Error(`recently-played failed: ${recentResult.status}`);
        }
      }

      const next = nextCachedNowPlaying(
        cachedNowPlaying,
        currentResult,
        recentResult,
      );
      if (next === cachedNowPlaying) return;

      cachedNowPlaying = next;
      cachedNowPlayingUpdatedAt = Date.now();
      await persistNowPlaying();
    } catch (err) {
      console.error("[spotify] refresh error:", err?.message ?? err);
      if (err?.stack) console.error(err.stack);
      // Keep serving last-known (incl. DB hydrate) on transient failures
    } finally {
      isRefreshingNowPlaying = false;
    }
  }

  app.get("/api/spotify/currently-playing", (req, res) => {
    res.set("Cache-Control", "no-store");
    return res.json(
      cachedNowPlaying
        ? { ...cachedNowPlaying, cachedAt: cachedNowPlayingUpdatedAt }
        : null,
    );
  });

  const stored = await nowPlayingCache.load();
  if (stored && "data" in stored) {
    cachedNowPlaying = stored.data ?? null;
    cachedNowPlayingUpdatedAt = stored.updatedAt ?? 0;
    console.log("Hydrated Spotify now-playing from cache.");
  }

  refreshNowPlayingCache();
  setInterval(refreshNowPlayingCache, SPOTIFY_POLL_INTERVAL_MS);
  console.log(
    `[spotify] poll interval ${SPOTIFY_POLL_INTERVAL_MS / 1000}s${isLocalDev ? " (local)" : ""}`,
  );
}
