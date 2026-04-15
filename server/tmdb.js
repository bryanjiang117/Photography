const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_PAGES = 10; // cap at 200 items per type when fetching all rated

export async function registerTmdbRoutes(app, supabase) {
  const API_KEY = process.env.TMDB_API_KEY;

  let sessionId = null;
  let accountId = null;

  let ratedCache = null;
  let ratedCacheExpiresAtMs = 0;
  let ratedInFlightPromise = null;

  async function loadFromDb(name) {
    const { data } = await supabase
      .from("tokens")
      .select("value")
      .eq("name", name)
      .single();
    return data?.value ?? null;
  }

  async function saveToDb(name, value) {
    const { error } = await supabase.from("tokens").upsert({
      name,
      value,
      updated_at: new Date(),
    });
    if (error)
      throw new Error(`DB write failed for "${name}": ${error.message}`);
  }

  async function ensureAccountId() {
    if (accountId) return accountId;
    accountId = await loadFromDb("tmdb_account_id");
    if (accountId) return accountId;

    const r = await fetch(
      `https://api.themoviedb.org/3/account?api_key=${API_KEY}&session_id=${sessionId}`,
    );
    const data = await r.json();
    if (!r.ok) throw new Error(`TMDB account error: ${data.status_message}`);

    accountId = String(data.id);
    await saveToDb("tmdb_account_id", accountId);
    return accountId;
  }

  // Fetch all pages of a rated endpoint (movies or tv), up to MAX_PAGES
  async function fetchAllPages(path) {
    const results = [];
    let page = 1;
    while (page <= MAX_PAGES) {
      const url =
        `https://api.themoviedb.org/3/account/${accountId}/${path}` +
        `?api_key=${API_KEY}&session_id=${sessionId}&sort_by=created_at.desc&page=${page}`;
      const r = await fetch(url);
      const data = await r.json();
      if (!r.ok) throw new Error(`TMDB error: ${data.status_message}`);
      results.push(...data.results);
      if (page >= data.total_pages) break;
      page++;
    }
    return results;
  }

  async function fetchRated() {
    if (!sessionId) throw new Error("Not authenticated. Visit /api/tmdb/login");
    await ensureAccountId();

    const [movies, shows] = await Promise.all([
      fetchAllPages("rated/movies"),
      fetchAllPages("rated/tv"),
    ]);

    const combined = [
      ...movies.map((m) => ({ ...m, media_type: "movie" })),
      ...shows.map((s) => ({ ...s, media_type: "tv" })),
    ];

    combined.sort(
      (a, b) =>
        b.rating - a.rating ||
        (a.title ?? a.name).localeCompare(b.title ?? b.name),
    );

    return combined.slice(0, 10).map((item) => ({
      id: item.id,
      media_type: item.media_type,
      title: item.title ?? item.name,
      rating: item.rating,
      year: (item.release_date ?? item.first_air_date ?? "").slice(0, 4),
    }));
  }

  async function getCachedRated() {
    const now = Date.now();
    if (ratedCache && now < ratedCacheExpiresAtMs) return ratedCache;
    if (ratedInFlightPromise) return ratedInFlightPromise;

    ratedInFlightPromise = (async () => {
      try {
        const data = await fetchRated();
        ratedCache = data;
        ratedCacheExpiresAtMs = Date.now() + CACHE_TTL_MS;
        return data;
      } finally {
        ratedInFlightPromise = null;
      }
    })();

    return ratedInFlightPromise;
  }

  // Pending request token (in-memory, only needed during the login flow)
  let pendingRequestToken = null;

  // Step 1: get a request token and redirect to TMDB's approval page.
  // After approving on TMDB, visit /api/tmdb/session to finish.
  app.get("/api/tmdb/login", async (req, res) => {
    try {
      if (!API_KEY) return res.status(500).send("Missing TMDB_API_KEY in env");

      const r = await fetch(
        `https://api.themoviedb.org/3/authentication/token/new?api_key=${API_KEY}`,
      );
      const data = await r.json();
      if (!r.ok) {
        return res
          .status(r.status)
          .send(
            `TMDB token request failed (${r.status}): ${data.status_message ?? JSON.stringify(data)}`,
          );
      }

      pendingRequestToken = data.request_token;
      return res.redirect(
        `https://www.themoviedb.org/authenticate/${pendingRequestToken}`,
      );
    } catch (e) {
      return res.status(500).send(e?.message ?? "Unknown error");
    }
  });

  // Step 2: visit this after approving on TMDB to exchange the token for a session.
  app.get("/api/tmdb/session", async (req, res) => {
    try {
      if (!API_KEY) return res.status(500).send("Missing TMDB_API_KEY in env");
      if (!pendingRequestToken)
        return res
          .status(400)
          .send("No pending login — visit /api/tmdb/login first");

      const r = await fetch(
        `https://api.themoviedb.org/3/authentication/session/new?api_key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ request_token: pendingRequestToken }),
        },
      );
      const data = await r.json();
      if (!r.ok) {
        return res
          .status(r.status)
          .send(
            `TMDB session creation failed (${r.status}): ${data.status_message ?? JSON.stringify(data)}`,
          );
      }

      pendingRequestToken = null;
      sessionId = data.session_id;

      const { error: dbError } = await supabase.from("tokens").upsert({
        name: "tmdb_session_id",
        value: sessionId,
        updated_at: new Date(),
      });
      if (dbError) {
        return res
          .status(500)
          .send(`Failed to save session: ${dbError.message}`);
      }

      await ensureAccountId();
      return res.send("TMDB logged in. You can now call /api/tmdb/rated.");
    } catch (e) {
      return res.status(500).send(e?.message ?? "Unknown error");
    }
  });

  app.get("/api/tmdb/rated", async (req, res) => {
    try {
      const data = await getCachedRated();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Load persisted session at startup
  sessionId = await loadFromDb("tmdb_session_id");
  if (sessionId) {
    accountId = await loadFromDb("tmdb_account_id");
    console.log("Loaded TMDB session from database.");
  } else {
    console.log(
      "No TMDB session in database. Login at http://127.0.0.1:3001/api/tmdb/login",
    );
  }
}
