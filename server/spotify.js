import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const PORT = 3001;

dotenv.config();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

// In-memory token cache (resets when server restarts)
let cachedAccessToken = null; // string | null
let accessTokenExpiresAtMs = 0; // number (ms since epoch)
let refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
const EXPIRY_BUFFER_MS = 60 * 1000; // 60 seconds

// In-memory "now playing" cache (shared by ALL users)
let cachedNowPlaying = null; // object | null (what you return to clients)
let isRefreshingNowPlaying = false; // boolean (prevents overlapping refreshes)
const SPOTIFY_POLL_INTERVAL_MS = 15_000; // 15 seconds between Spotify fetches

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

const app = express();
app.use(cookieParser());

/*
PKCE helpers
- code_verifier: random string kept secret (we store in cookie)
- code_challenge: hashed version sent to Spotify
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

/*
1) One-time route: you visit this in browser to connect your Spotify account
*/
app.get("/spotify/login", (req, res) => {
  const codeVerifier = makeCodeVerifier();
  const codeChallenge = makeCodeChallenge(codeVerifier);

  // store verifier in a cookie so /callback can use it
  res.cookie("spotify_code_verifier", codeVerifier, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // set true in production (https)
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
    scope,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

/*
2) Callback: Spotify redirects here with ?code=...
This exchanges code + verifier for access_token + refresh_token.
*/
app.get("/spotify/callback", async (req, res) => {
  try {
    const code = req.query.code;
    const codeVerifier = req.cookies.spotify_code_verifier;

    if (!code || typeof code !== "string") {
      return res.status(400).send("Missing code");
    }
    if (!codeVerifier) {
      return res.status(400).send("Missing code verifier cookie");
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

    const tokenText = await tokenRes.text();
    if (!tokenRes.ok) {
      return res
        .status(500)
        .send(`Token exchange failed: ${tokenRes.status} ${tokenText}`);
    }

    const tokenJson = JSON.parse(tokenText);

    refreshToken = tokenJson.refresh_token;

    if (!refreshToken) {
      return res
        .status(500)
        .send(
          "No refresh_token returned. Did you already authorize without 'show_dialog'? Try again.",
        );
    }

    // store in db
    const { _, error } = await supabase.from("tokens").upsert({
      name: "spotify_refresh_token",
      value: refreshToken,
      updated_at: new Date(),
    });

    if (error) {
      console.error("Insert failed:", error.message);
      return;
    }

    // Clear the verifier cookie after use
    res.clearCookie("spotify_code_verifier");

    // Show token once, copy into .env, then you can lock this route down.
    return res
      .status(200)
      .send(
        `Success. Copy this refresh token into server .env as SPOTIFY_REFRESH_TOKEN:\n\n${refreshToken}\n`,
      );
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

/*
Refresh access token using refresh_token (this is what runs forever)
*/
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
  refreshToken = tokenJson.refresh_token;

  // store in db
  const { _, error } = await supabase.from("tokens").upsert({
    name: "spotify_refresh_token",
    value: refreshToken,
    updated_at: new Date(),
  });

  if (error) {
    console.error("Insert failed:", error.message);
    return;
  }

  return cachedAccessToken;
}

async function getAccessToken() {
  const tokenStillValid =
    cachedAccessToken && Date.now() < accessTokenExpiresAtMs - EXPIRY_BUFFER_MS;

  if (tokenStillValid) {
    return cachedAccessToken;
  }

  return await refreshAccessToken();
}

async function refreshNowPlayingCache() {
  if (isRefreshingNowPlaying) return;
  isRefreshingNowPlaying = true;

  try {
    const accessToken = await getAccessToken();

    const currentlyPlayingRes = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (currentlyPlayingRes.status === 429) {
      const retryAfter = currentlyPlayingRes.headers.get("Retry-After");
      throw new Error(
        `Spotify rate limited (currently-playing). Retry-After=${retryAfter}s`,
      );
    }

    if (currentlyPlayingRes.status === 401) {
      throw new Error(
        "Spotify returned 401 (currently-playing). Refresh token invalid or expired.",
      );
    }

    if (!currentlyPlayingRes.ok && currentlyPlayingRes.status !== 204) {
      const text = await currentlyPlayingRes.text();
      throw new Error(
        `currently-playing failed: ${currentlyPlayingRes.status} ${text}`,
      );
    }

    // If something is playing
    if (currentlyPlayingRes.status !== 204) {
      const data = await currentlyPlayingRes.json();
      const item = data?.item;

      cachedNowPlaying = item
        ? {
            track: item.name,
            artists: item.artists?.map((a) => a.name) ?? [],
            album: item.album?.name,
            albumImage: item.album?.images?.[0]?.url,
            isPlaying: data.is_playing ?? true,
          }
        : null;

      cachedNowPlayingUpdatedAtMs = Date.now();
      lastSpotifyError = null;
      return;
    }

    // Nothing playing → fallback
    const lastPlayedRes = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played?limit=1",
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (lastPlayedRes.status === 429) {
      const retryAfter = lastPlayedRes.headers.get("Retry-After");
      throw new Error(
        `Spotify rate limited (recently-played). Retry-After=${retryAfter}s`,
      );
    }

    if (!lastPlayedRes.ok) {
      const text = await lastPlayedRes.text();
      throw new Error(
        `recently-played failed: ${lastPlayedRes.status} ${text}`,
      );
    }

    const data = await lastPlayedRes.json();
    const item = data?.items?.[0];

    cachedNowPlaying = item
      ? {
          track: item.track.name,
          artists: item.track.artists.map((a) => a.name) ?? [],
          album: item.track.album.name,
          albumImage: item.track.album?.images?.[0]?.url,
          playedAt: item.played_at,
        }
      : null;

    cachedNowPlayingUpdatedAtMs = Date.now();
    lastSpotifyError = null;
  } catch (err) {
    lastSpotifyError = err?.message ?? "Unknown error";
    console.error("[spotify refresh error]");
    console.error(err);
  } finally {
    isRefreshingNowPlaying = false;
  }
}

/*
3) Public endpoint: anyone can hit your site, and it returns YOUR current song
*/
app.get("/api/spotify/currently-playing", async (req, res) => {
  return res.json(cachedNowPlaying);
});

refreshNowPlayingCache();
setInterval(refreshNowPlayingCache, SPOTIFY_POLL_INTERVAL_MS);

app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
  console.log(`One-time login: http://127.0.0.1:${PORT}/spotify/login`);
});
