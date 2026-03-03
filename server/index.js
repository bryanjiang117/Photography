import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createClient } from "@supabase/supabase-js";
import { registerSpotifyRoutes } from "./spotify.js";
import { registerMalRoutes } from "./mal.js";

const PORT = 3001;

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

const app = express();
app.use(cookieParser());

registerSpotifyRoutes(app, supabase);
await registerMalRoutes(app, supabase);

app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
  console.log(`Spotify login: http://127.0.0.1:${PORT}/spotify/login`);
  console.log(`MAL login: http://127.0.0.1:${PORT}/mal/login`);
});
