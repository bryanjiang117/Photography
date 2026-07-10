/**
 * Compare grid photos vs on-disk AVIFs and aspect ratios.
 *   node scripts/audit-gallery-photos.mjs --region=china
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const ratiosSrc = fs.readFileSync(
  path.join(ROOT, "src/constants/galleryAspectRatios.js"),
  "utf8",
);
const ratiosMatch = ratiosSrc.match(
  /export const GALLERY_ASPECT_RATIOS = (\{[\s\S]*?\});/,
);
const GALLERY_ASPECT_RATIOS = ratiosMatch
  ? JSON.parse(ratiosMatch[1])
  : {};
function galleryPhotoDimensions(region, name) {
  return GALLERY_ASPECT_RATIOS[region]?.[name] ?? null;
}

function parseImageEntry(entry, rowSize, rowLocation) {
  if (typeof entry === "string") {
    if (!entry) return null;
    return {
      name: entry,
      size: rowSize ?? "md",
      ...(rowLocation ? { location: rowLocation } : {}),
    };
  }
  if (entry && typeof entry === "object" && "name" in entry && entry.name) {
    const location = entry.location ?? rowLocation;
    return {
      name: entry.name,
      size: entry.size ?? rowSize ?? "md",
      ...(location ? { location } : {}),
    };
  }
  return null;
}

function rowDefaultSize(row) {
  if (row.size) return row.size;
  if (
    row.columns.length === 1 &&
    row.columns[0].length === 1 &&
    parseImageEntry(row.columns[0][0])
  ) {
    return "full";
  }
  if (row.columns.length >= 4) return "sm";
  return "md";
}

function flattenGalleryItems(items) {
  const out = [];
  for (const row of items) {
    const rowSize = rowDefaultSize(row);
    const rowLocation = row.location;
    for (const col of row.columns) {
      for (const entry of col) {
        if (Array.isArray(entry)) {
          for (const sub of entry) {
            const parsed = parseImageEntry(sub, rowSize, rowLocation);
            if (parsed) out.push(parsed);
          }
        } else {
          const parsed = parseImageEntry(entry, rowSize, rowLocation);
          if (parsed) out.push(parsed);
        }
      }
    }
  }
  return out;
}

const regionArg =
  process.argv.find((a) => a.startsWith("--region="))?.split("=")[1] ??
  "china";

const dataPath = path.join(ROOT, "src/constants/data.js");
const src = fs.readFileSync(dataPath, "utf8");
const itemsMatch = src.match(
  new RegExp(
    `export const ${regionArg.toUpperCase()}_ITEMS = (\\[[\\s\\S]*?\\]);\\n\\nexport const ${regionArg.toUpperCase()}_GALLERY_PHOTOS`,
  ),
);
if (!itemsMatch) {
  console.error(`Could not parse ${regionArg.toUpperCase()}_ITEMS`);
  process.exit(1);
}

const items = Function(`"use strict"; return (${itemsMatch[1]});`)();
const photos = flattenGalleryItems(items);

const dir = path.join(ROOT, "public/assets/photos", regionArg);
const missing = { full: [], sm: [], md: [], ratio: [] };

for (const p of photos) {
  if (!fs.existsSync(path.join(dir, `${p.name}.avif`))) missing.full.push(p.name);
  if (!fs.existsSync(path.join(dir, `${p.name}-sm.avif`)))
    missing.sm.push(p.name);
  if (!fs.existsSync(path.join(dir, `${p.name}-md.avif`)))
    missing.md.push(p.name);
  if (!galleryPhotoDimensions(regionArg, p.name)) missing.ratio.push(p.name);
}

console.log(`=== ${regionArg} (${photos.length} photos in grid) ===`);
for (const [kind, list] of Object.entries(missing)) {
  if (list.length) console.log(`MISSING ${kind}:`, list.join(", "));
}
if (Object.values(missing).every((l) => l.length === 0)) {
  console.log("All grid photos have full/sm/md variants and aspect ratios.");
}
