import {
  importOriginal,
  listMasterNames,
  REGIONS,
  saveRegionItems,
} from "./scripts/galleryDevPipeline.mjs";

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(json);
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
            return send(res, 200, { names: listMasterNames(region) });
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
            return send(res, 200, result);
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
