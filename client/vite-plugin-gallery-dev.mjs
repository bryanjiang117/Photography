import fs from "fs";
import {
  importOriginal,
  listPhotoNames,
  listMasterNames,
  deletePhotoFiles,
  generateImportVariants,
  importPreviewPath,
  findOriginalPath,
  BROWSER_IMAGE_EXT,
  REGIONS,
  saveRegionItems,
} from "./scripts/galleryDevPipeline.mjs";

const PREVIEW_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/** @type {Map<string, { promise: Promise<unknown>; cancelled: { value: boolean } }>} */
const variantJobs = new Map();

function jobKey(region, name) {
  return `${region}/${name}`;
}

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(json);
}

function sendFile(res, filePath, contentType) {
  res.statusCode = 200;
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "no-cache");
  fs.createReadStream(filePath).pipe(res);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function query(url) {
  const q = new URL(url, "http://localhost").searchParams;
  return Object.fromEntries(q.entries());
}

function validName(name) {
  return typeof name === "string" && name && !/[\\/]/.test(name) && !name.includes("..");
}

export default function galleryDevPlugin() {
  return {
    name: "gallery-dev",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const raw = req.url || "";
        const pathname = raw.split("?")[0];
        if (!pathname.startsWith("/__gallery-dev")) return next();

        try {
          if (req.method === "GET" && pathname === "/__gallery-dev/photos") {
            const region = query(raw).region;
            if (!REGIONS.includes(region)) {
              return send(res, 400, { error: "Unknown region" });
            }
            return send(res, 200, { names: listPhotoNames(region) });
          }

          if (req.method === "GET" && pathname === "/__gallery-dev/preview") {
            const { region, name } = query(raw);
            if (!REGIONS.includes(region) || !validName(name)) {
              return send(res, 400, { error: "Unknown region or name" });
            }
            const preview = importPreviewPath(region, name);
            if (fs.existsSync(preview)) {
              return sendFile(res, preview, "image/jpeg");
            }
            const original = findOriginalPath(region, name);
            if (!original) {
              return send(res, 404, { error: "Not found" });
            }
            const ext = original.slice(original.lastIndexOf(".")).toLowerCase();
            if (!BROWSER_IMAGE_EXT.has(ext)) {
              return send(res, 404, { error: "Preview not ready" });
            }
            return sendFile(res, original, PREVIEW_TYPES[ext] || "application/octet-stream");
          }

          if (req.method === "GET" && pathname === "/__gallery-dev/variants-ready") {
            const { region, name } = query(raw);
            if (!REGIONS.includes(region) || !validName(name)) {
              return send(res, 400, { error: "Unknown region or name" });
            }
            const job = variantJobs.get(jobKey(region, name));
            if (job) {
              try {
                await job.promise;
              } catch (err) {
                return send(res, 500, { error: err.message || "Variant generation failed" });
              }
              return send(res, 200, { ready: true });
            }
            if (listMasterNames(region).includes(name)) {
              return send(res, 200, { ready: true });
            }
            return send(res, 404, { error: "Unknown photo" });
          }

          if (req.method === "POST" && pathname === "/__gallery-dev/import") {
            const region = req.headers["x-gallery-region"];
            const filename = req.headers["x-gallery-filename"];
            const name = req.headers["x-gallery-name"];
            if (typeof region !== "string" || typeof filename !== "string") {
              return send(res, 400, {
                error: "Missing region or filename headers",
              });
            }
            const buffer = await readBody(req);
            if (!buffer.length) {
              return send(res, 400, { error: "Empty file" });
            }
            const result = await importOriginal({
              region,
              buffer,
              filename: decodeURIComponent(filename),
              name: typeof name === "string" ? decodeURIComponent(name) : "",
            });
            const key = jobKey(region, result.name);
            const cancelled = { value: false };
            const promise = generateImportVariants(region, result.name, {
              buffer,
              cancelled,
            }).catch((err) => {
              console.error("gallery-dev variants:", err);
              throw err;
            });
            variantJobs.set(key, { promise, cancelled });
            return send(res, 200, result);
          }

          if (req.method === "POST" && pathname === "/__gallery-dev/delete") {
            const body = JSON.parse((await readBody(req)).toString("utf8"));
            const region = body.region;
            const name = body.name;
            if (!REGIONS.includes(region) || typeof name !== "string") {
              return send(res, 400, { error: "Missing region or name" });
            }
            const job = variantJobs.get(jobKey(region, name));
            if (job) job.cancelled.value = true;
            const removed = deletePhotoFiles(region, name);
            return send(res, 200, { name, removed: removed.length });
          }

          if (req.method === "POST" && pathname === "/__gallery-dev/save") {
            const body = JSON.parse((await readBody(req)).toString("utf8"));
            const result = await saveRegionItems(
              body.region,
              body.items,
              body.deleteNames ?? [],
            );
            return send(res, 200, result);
          }

          return send(res, 404, { error: "Not found" });
        } catch (err) {
          const status = err.status || 500;
          console.error("gallery-dev:", err);
          return send(res, status, { error: err.message || "Server error" });
        }
      });
    },
  };
}
