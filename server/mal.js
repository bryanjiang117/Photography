import crypto from "crypto";

const CACHE_TTL_MS = 30000; // 30 seconds

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

  let accessToken = null;
  let refreshToken = null;
  let expiresAtMs = 0;

  let animeListCache;
  let animeListCacheExpiresAtMs = 0;
  let animeListInFlightPromise;

  app.get("/api/mal/login", (req, res) => {
    if (!CLIENT_ID || !REDIRECT_URI) {
      return res
        .status(500)
        .send("Missing MAL_CLIENT_ID or MAL_REDIRECT_URI in server env");
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
  });

  app.get("/api/mal/callback", async (req, res) => {
    if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
      return res
        .status(500)
        .send(
          "Missing MAL_CLIENT_ID / MAL_CLIENT_SECRET / MAL_REDIRECT_URI in server env",
        );
    }

    const authCode = req.query.code;
    const codeVerifier = req.cookies.mal_verifier;

    if (!authCode) return res.status(400).send("Missing ?code");
    if (!codeVerifier)
      return res
        .status(400)
        .send("Missing verifier cookie. Go to /mal/login again.");

    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      code: String(authCode),
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    });

    const r = await fetch("https://myanimelist.net/v1/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const data = await r.json();

    if (!r.ok) return res.status(r.status).json(data);

    accessToken = data.access_token;
    refreshToken = data.refresh_token;
    expiresAtMs = Date.now() + data.expires_in * 1000;

    const { error } = await supabase.from("tokens").upsert({
      name: "mal_refresh_token",
      value: refreshToken,
      updated_at: new Date(),
    });

    if (error) {
      console.error("Insert failed:", error.message);
      return;
    }

    return res.send("Logged in. You can now call the API.");
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

  async function getCachedAnimeList() {
    const now = Date.now();

    if (animeListCache && now < animeListCacheExpiresAtMs) {
      return animeListCache;
    }

    if (animeListInFlightPromise) {
      return animeListInFlightPromise;
    }

    console.log("API call to fetch anime list");
    animeListInFlightPromise = (async () => {
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
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(`Error getting list from MAL: ${response.statusText}`);
        }

        const animeList = data.data;
        animeListCache = animeList;
        animeListCacheExpiresAtMs = Date.now() + CACHE_TTL_MS;

        return animeList;
      } finally {
        animeListInFlightPromise = null;
      }
    })();

    return animeListInFlightPromise;
  }

  app.get("/api/mal/anime-list", async (req, res) => {
    try {
      const data = await getCachedAnimeList();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Load MAL refresh token at startup
  refreshToken = await loadRefreshTokenFromDb();

  if (refreshToken) {
    console.log("Loaded MAL refresh token from database.");
  } else {
    console.log(
      "No MAL refresh token in database. Login at http://127.0.0.1:3001/api/mal/login",
    );
  }
}
