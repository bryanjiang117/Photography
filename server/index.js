import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createClient } from "@supabase/supabase-js";
import { registerSpotifyRoutes } from "./spotify.js";
import { registerMalRoutes } from "./mal.js";
import { registerTmdbRoutes } from "./tmdb.js";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 3001;

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  }),
);

registerSpotifyRoutes(app, supabase);
await registerMalRoutes(app, supabase);
await registerTmdbRoutes(app, supabase);

const baseUrl = BACKEND_ORIGIN || `http://127.0.0.1:${PORT}`;

app.listen(PORT, () => {
  console.log(`Server running on ${baseUrl}`);
  console.log(`Spotify login: ${baseUrl}/api/spotify/login`);
  console.log(`MAL login: ${baseUrl}/api/mal/login`);
});
