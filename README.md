# 姜昊周 · Photography & Portfolio

A personal site that pairs film photography with software work — horizontal scroll through intro, regional galleries, and projects, with live Spotify, MyAnimeList, and TMDB widgets woven in.

**[jianghaozhou.studio](https://jianghaozhou.studio)**

<p align="center">
  <img src="client/public/assets/preview.png" alt="Portfolio preview" width="720" />
</p>

<p align="center">
  <a href="https://jianghaozhou.studio"><img src="https://img.shields.io/badge/live-jianghaozhou.studio-1a1a1a?style=for-the-badge&labelColor=374151" alt="Live site" /></a>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 7" />
  <img src="https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind 4" />
</p>

---

## Highlights

- **Infinite horizontal home** — Intro, photography panels, projects, and extras on a looping scroll track
- **Regional galleries** — Mexico City, Canada, Japan, and more to come with editorial grid layouts
- **Responsive AVIF** — `sm` / `md` / full variants with `srcset`, sized by longest edge for portraits and landscapes
- **Motion-driven UI** — Panel transitions, gallery overlays, and intro reveal via [Motion](https://motion.dev/)
- **Live integrations** — Currently playing (Spotify), anime list (MAL), rated films (TMDB)
- **Mobile layouts** — Dedicated gallery and panel components with touch-friendly lightboxes

---

## Tech stack

| Layer | Tools |
|--------|--------|
| **Frontend** | React 19, Vite 7, Tailwind CSS 4, Sass, Motion |
| **Backend** | Express 5, Supabase (session storage) |
| **Media** | AVIF photos by me, subset CJK fonts (Source Han, Tsukuhou Shogo Min) |
| **Deploy** | Vercel (client) · Render (API) |

---

## Project structure

```
Photography/
├── client/                 # Vite + React app
│   ├── public/assets/      # Photos, fonts, video
│   ├── scripts/            # AVIF variant generator (sharp)
│   └── src/
│       ├── constants/      # Gallery grids (data.js)
│       ├── panels/         # Desktop views
│       └── mobile/         # Mobile views
├── server/                 # Express API (Spotify, MAL, TMDB)
└── CLAUDE.md               # Font subsetting & maintainer notes
```

---

## Getting started

### Prerequisites

- Node.js 20+
- API keys for optional live widgets (see [Environment variables](#environment-variables))

### Frontend

```bash
cd client
npm install
npm run dev          # http://127.0.0.1:3000
```

`vite.config.mjs` proxies `/api/*` to `http://127.0.0.1:3001`.

### Backend

```bash
cd server
npm install
# Create server/.env from the table below
npm start              # http://127.0.0.1:3001
```

The site (galleries, layout, intro) runs locally without any API credentials. Spotify / MAL / TMDB need keys in `server/.env` and provider OAuth apps configured for your redirect URIs.

### Production build

```bash
cd client && npm run build && npm run preview
```

---

## Gallery workflow

Photos live in `client/public/assets/photos/{mexico,canada,japan}/`.

| File | Longest side |
|------|----------------|
| `name.avif` | original |
| `name-md.avif` | 1400px |
| `name-sm.avif` | 800px |

**Add or update a photo**

1. Place the master AVIF at `{region}/{name}.avif`
2. Add it to the grid in `client/src/constants/data.js` (`MEXICO_ITEMS`, `CANADA_ITEMS`, …)
3. Regenerate variants:

```bash
cd client && npm run photos:variants
```

Per region:

```bash
node scripts/generate-gallery-variants.mjs --region=mexico
```

**Row `size` in `data.js`** (optional — smart defaults apply)

| `size` | When to use |
|--------|-------------|
| `full` | Hero / single full-width row |
| `md` | Default for 1–2 column rows |
| `sm` | Dense rows (3+ columns), or set explicitly |

Per-image override: `{ name: "windmill", size: "full" }`. See comments at the top of `data.js` for column layout syntax (`flex`, `fit`, spacers).

---

## Environment variables

Server (`server/.env`).

### Local development

You do **not** need `FRONTEND_ORIGIN` or `BACKEND_ORIGIN` for day-to-day work. The Vite dev server proxies `/api` to port 3001, and the server defaults CORS to `http://127.0.0.1:3000` and OAuth base URLs to `http://127.0.0.1:3001` when those are unset.

### Production (Render)

| Variable | Value |
|----------|--------|
| `FRONTEND_ORIGIN` | `https://jianghaozhou.studio` |
| `BACKEND_ORIGIN` | `https://photography-28rz.onrender.com` |

Set these on Render so CORS and OAuth callbacks match [jianghaozhou.studio](https://jianghaozhou.studio/) and the hosted API.

### Integrations (local + production)

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SECRET_KEY` | Supabase service key |
| `SPOTIFY_CLIENT_ID` / `SECRET` / `REDIRECT_URI` | Spotify OAuth |
| `MAL_CLIENT_ID` / `SECRET` / `REDIRECT_URI` | MyAnimeList OAuth |
| `TMDB_API_KEY` | The Movie Database API |

---

## Deployment

- **Client** — [Vercel](https://jianghaozhou.studio/) (`client/vercel.json` rewrites `/api` → `https://photography-28rz.onrender.com`)
- **Server** — [Render](https://photography-28rz.onrender.com) with production `FRONTEND_ORIGIN` / `BACKEND_ORIGIN` plus integration keys

---

## License

Client assets and photography are personal work. See [`client/LICENSE`](client/LICENSE) where applicable.

---

<p align="center">
  <sub>Built by <a href="https://jianghaozhou.studio">Bryan Jiang</a> · <a href="https://github.com/bryanjiang117">GitHub</a></sub>
</p>
