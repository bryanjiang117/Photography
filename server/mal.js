import crypto from "crypto";
import { createJsonCache } from "./cacheStore.js";

const POLL_INTERVAL_MS = 60 * 60 * 1000; // 1 hour — list rarely changes

function makeCodeVerifier() {
  return crypto.randomBytes(32).toString("hex");
}

function makeCodeChallenge(codeVerifier) {
  return codeVerifier;
}

export async function registerMalRoutes(app, supabase) {
  const CLIENT_ID = process.env.MAL_CLIENT_ID;
  const CLIENT_SECRET = process.env.MAL_CLIENT_SECRET;
  const REDIRECT_URI = process.env.MAL_REDIRECT_URI;

  const listCache = createJsonCache(supabase, "cache_mal_list");

  let accessToken = null;
  let refreshToken = null;
  let expiresAtMs = 0;

  let animeListCache = null;
  let isRefreshing = false;

  app.get("/api/mal/login", (req, res) => {
    try {
      if (!CLIENT_ID || !REDIRECT_URI) {
        return res.status(500).send("Missing MAL_CLIENT_ID or MAL_REDIRECT_URI in server env");
      }

      const codeVerifier = makeCodeVerifier();
      const codeChallenge = makeCodeChallenge(codeVerifier);

      res.cookie("mal_verifier", codeVerifier, { httpOnly: true, sameSite: "lax" });

      const params = new URLSearchParams({
        response_type: "code",
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code_challenge: codeChallenge,
        code_challenge_method: "plain",
      });

      return res.redirect(
        `https://myanimelist.net/v1/oauth2/authorize?${params.toString()}`,
      );
    } catch (e) {
      return res.status(500).send(e?.message ?? "Unknown error");
    }
  });

  app.get("/api/mal/callback", async (req, res) => {
    try {
      if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
        return res.status(500).send(
          "Missing MAL_CLIENT_ID / MAL_CLIENT_SECRET / MAL_REDIRECT_URI in server env",
        );
      }

      const authCode = req.query.code;
      const codeVerifier = req.cookies.mal_verifier;

      if (!authCode) return res.status(400).send("Missing ?code in callback");
      if (!codeVerifier)
        return res.status(400).send("Missing verifier cookie — go to /api/mal/login again");

      const r = await fetch("https://myanimelist.net/v1/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: "authorization_code",
          code: String(authCode),
          redirect_uri: REDIRECT_URI,
          code_verifier: codeVerifier,
        }),
      });

      const data = await r.json();
      if (!r.ok) {
        return res.status(r.status).send(
          `MAL token exchange failed (${r.status}): ${data.error ?? data.message ?? JSON.stringify(data)}`,
        );
      }

      accessToken = data.access_token;
      refreshToken = data.refresh_token;
      expiresAtMs = Date.now() + data.expires_in * 1000;

      const { error: dbError } = await supabase.from("tokens").upsert({
        name: "mal_refresh_token",
        value: refreshToken,
        updated_at: new Date(),
      });

      if (dbError) {
        return res.status(500).send(`Failed to save refresh token: ${dbError.message}`);
      }

      refreshAnimeListCache();
      return res.send("MAL logged in. You can now call the API.");
    } catch (e) {
      return res.status(500).send(e?.message ?? "Unknown error");
    }
  });

  async function loadRefreshTokenFromDb() {
    const { data, error } = await supabase
      .from("tokens")
      .select("value")
      .eq("name", "mal_refresh_token")
      .single();

    if (error) {
      console.log("No refresh token found in DB at startup.");
      return null;
    }

    return data.value;
  }

  async function getAccessToken() {
    if (accessToken && Date.now() < expiresAtMs - 5000) {
      return accessToken;
    }

    if (!refreshToken) {
      refreshToken = await loadRefreshTokenFromDb();
    }

    if (!refreshToken) {
      throw new Error("Not authenticated. Visit /mal/login");
    }

    const response = await fetch("https://myanimelist.net/v1/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error("Failed to refresh token");

    accessToken = data.access_token;
    expiresAtMs = Date.now() + data.expires_in * 1000;

    if (data.refresh_token) {
      refreshToken = data.refresh_token;

      const { error } = await supabase.from("tokens").upsert({
        name: "mal_refresh_token",
        value: refreshToken,
        updated_at: new Date(),
      });

      if (error) {
        console.error("Insert failed:", error.message);
      }
    }

    return accessToken;
  }

  async function refreshAnimeListCache() {
    if (isRefreshing) return;
    isRefreshing = true;

    try {
      const token = await getAccessToken();

      const params = new URLSearchParams({
        status: "completed",
        sort: "list_score",
        limit: 10,
        fields: "alternative_titles",
      });
      const response = await fetch(
        `https://api.myanimelist.net/v2/users/@me/animelist?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Error getting list from MAL: ${response.statusText}`);
      }

      animeListCache = data.data;
      await listCache.save({ data: animeListCache, updatedAt: Date.now() });
    } catch (err) {
      console.error("[mal] refresh error:", err?.message ?? err);
    } finally {
      isRefreshing = false;
    }
  }

  // Always serve memory (hydrated from DB on boot). Never block on upstream.
  app.get("/api/mal/anime-list", (req, res) => {
    res.status(200).json(animeListCache ?? []);
  });

  refreshToken = await loadRefreshTokenFromDb();

  if (refreshToken) {
    console.log("Loaded MAL refresh token from database.");
  } else {
    console.log(
      "No MAL refresh token in database. Login at http://127.0.0.1:3001/api/mal/login",
    );
  }

  const stored = await listCache.load();
  if (Array.isArray(stored?.data)) {
    animeListCache = stored.data;
    console.log("Hydrated MAL anime list from cache.");
  }

  refreshAnimeListCache();
  setInterval(refreshAnimeListCache, POLL_INTERVAL_MS);
}
