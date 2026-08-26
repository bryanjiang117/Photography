import crypto from "crypto";
import { createJsonCache } from "./cacheStore.js";

const POLL_INTERVAL_MS = 60 * 60 * 1000;
const STATS_RETRIES = 10;
const STATS_RETRY_MS = 3000;
const WEBHOOK_STATS_RETRY_MS = [5_000, 20_000, 60_000];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseLastPage(linkHeader) {
  if (!linkHeader) return null;
  const match = linkHeader.match(/[&?]page=(\d+)>;\s*rel="last"/);
  return match ? Number(match[1]) : null;
}

function firstLine(message) {
  return (message ?? "").split(/\r?\n/)[0].trim();
}

function verifyGithubSignature(rawBody, signatureHeader, secret) {
  if (!rawBody || !signatureHeader || !secret) return false;
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signatureHeader, "utf8");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function registerGithubRoutes(app, supabase) {
  const TOKEN = process.env.GITHUB_TOKEN;
  const OWNER = process.env.GITHUB_OWNER || "bryanjiang117";
  const REPO = process.env.GITHUB_REPO || "Photography";
  const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

  const cacheStore = createJsonCache(supabase, "cache_github_repo");
  let repoCache = null;
  let refreshPromise = null;

  function headers() {
    const h = {
      Accept: "application/vnd.github+json",
      "User-Agent": "photography-site",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (TOKEN) h.Authorization = `Bearer ${TOKEN}`;
    return h;
  }

  async function githubFetch(path) {
    const res = await fetch(`https://api.github.com${path}`, {
      headers: headers(),
    });
    return res;
  }

  async function fetchCodeFrequency(owner, repo) {
    const path = `/repos/${owner}/${repo}/stats/code_frequency`;
    for (let i = 0; i < STATS_RETRIES; i++) {
      const res = await githubFetch(path);
      if (res.status === 202) {
        const retryAfterSec = Number(res.headers.get("retry-after"));
        const waitMs = Number.isFinite(retryAfterSec)
          ? retryAfterSec * 1000
          : STATS_RETRY_MS;
        await sleep(waitMs);
        continue;
      }
      if (!res.ok) {
        console.error(`[github] code_frequency ${res.status}`);
        return null;
      }
      const weeks = await res.json();
      if (!Array.isArray(weeks)) return null;
      let additions = 0;
      let deletions = 0;
      for (const week of weeks) {
        additions += Math.abs(Number(week?.[1]) || 0);
        deletions += Math.abs(Number(week?.[2]) || 0);
      }
      return { additions, deletions };
    }
    console.warn("[github] code_frequency still computing after retries");
    return null;
  }

  async function refreshStats() {
    const freq = await fetchCodeFrequency(OWNER, REPO);
    if (!freq || !repoCache) return freq;
    repoCache = { ...repoCache, ...freq };
    await cacheStore.save({ data: repoCache });
    console.log(
      `[github] contributions +${freq.additions} −${freq.deletions}`,
    );
    return freq;
  }

  async function refreshRepoCache() {
    if (refreshPromise) return refreshPromise;
    refreshPromise = (async () => {
      try {
        const repoRes = await githubFetch(`/repos/${OWNER}/${REPO}`);
        if (!repoRes.ok) {
          throw new Error(`repo ${repoRes.status}`);
        }
        const repo = await repoRes.json();
        const branch = repo.default_branch || "main";

        const commitsRes = await githubFetch(
          `/repos/${OWNER}/${REPO}/commits?sha=${encodeURIComponent(branch)}&per_page=1`,
        );
        if (!commitsRes.ok) {
          throw new Error(`commits ${commitsRes.status}`);
        }
        const commits = await commitsRes.json();
        const latest = Array.isArray(commits) ? commits[0] : null;
        const lastPage = parseLastPage(commitsRes.headers.get("link"));
        const commitCount = lastPage ?? (latest ? 1 : 0);

        const payload = {
          name: repo.name,
          url: repo.html_url,
          commitCount,
          latestMessage: firstLine(latest?.commit?.message),
          latestUrl: latest?.html_url ?? repo.html_url,
          latestDate:
            latest?.commit?.committer?.date ??
            latest?.commit?.author?.date ??
            null,
          additions: repoCache?.additions ?? null,
          deletions: repoCache?.deletions ?? null,
        };

        repoCache = payload;
        await cacheStore.save({ data: payload });

        await refreshStats();

        console.log("[github] refreshed repo stats");
      } catch (err) {
        console.error("[github] refresh error:", err?.message ?? err);
      }
    })().finally(() => {
      refreshPromise = null;
    });
    return refreshPromise;
  }

  function scheduleStatsRetries() {
    for (const delayMs of WEBHOOK_STATS_RETRY_MS) {
      setTimeout(() => {
        refreshStats();
      }, delayMs);
    }
  }

  app.get("/api/github/repo", async (req, res) => {
    if (!repoCache) await refreshRepoCache();
    else if (repoCache.additions == null) await refreshStats();
    res.json(repoCache ?? null);
  });

  app.post("/api/github/webhook", async (req, res) => {
    if (!WEBHOOK_SECRET) {
      console.error(
        "[github] webhook received but GITHUB_WEBHOOK_SECRET is unset",
      );
      return res.status(503).send("Webhook secret not configured");
    }

    const signature = req.get("x-hub-signature-256");
    const rawBody = req.rawBody;
    if (!verifyGithubSignature(rawBody, signature, WEBHOOK_SECRET)) {
      return res.status(401).send("Invalid signature");
    }

    const event = req.get("x-github-event");
    if (event === "ping") {
      return res.status(200).json({ ok: true, event: "ping" });
    }
    if (event !== "push") {
      return res.status(200).json({ ok: true, ignored: event ?? "unknown" });
    }

    const fullName = req.body?.repository?.full_name;
    const expected = `${OWNER}/${REPO}`.toLowerCase();
    if (fullName && fullName.toLowerCase() !== expected) {
      return res.status(200).json({ ok: true, ignored: "other-repo" });
    }

    // Respond quickly; refresh in the background.
    res.status(202).json({ ok: true, refreshing: true });
    refreshRepoCache()
      .then(() => scheduleStatsRetries())
      .catch((err) => {
        console.error("[github] webhook refresh failed:", err?.message ?? err);
      });
  });

  const stored = await cacheStore.load();
  if (stored?.data && typeof stored.data === "object") {
    repoCache = stored.data;
    console.log("Hydrated GitHub repo stats from cache.");
  }

  if (!WEBHOOK_SECRET) {
    console.log(
      "[github] GITHUB_WEBHOOK_SECRET unset — push webhooks disabled; hourly poll only.",
    );
  } else {
    console.log("[github] push webhook enabled at /api/github/webhook");
  }

  refreshRepoCache();
  setInterval(refreshRepoCache, POLL_INTERVAL_MS);
  for (const delayMs of [15_000, 45_000]) {
    setTimeout(() => {
      if (repoCache?.additions == null) refreshStats();
    }, delayMs);
  }
}
