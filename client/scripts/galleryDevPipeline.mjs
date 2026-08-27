import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import {
  collectNames,
  replaceItemsExport,
  slugify,
  uniqueSlug,
} from "../src/galleryDev/layout.mjs";
import {
  generateVariantsForName,
  listFullAvifs,
  PHOTOS_ROOT,
  REGIONS,
} from "./generate-gallery-variants.mjs";
import {
  loadAspectRatios,
  ratiosForRegion,
  writeAspectRatios,
} from "./generate-gallery-aspect-ratios.mjs";
import {
  IMAGE_EXT,
  ORIGINALS_ROOT,
  RAW_EXT,
  loadPhotoMeta,
  metaForRegion,
  writePhotoMeta,
} from "./generate-gallery-photo-meta.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_JS = path.join(__dirname, "../src/constants/data.js");

export const REGION_EXPORTS = {
  canada: "CANADA_ITEMS",
  mexico: "MEXICO_ITEMS",
  china: "CHINA_ITEMS",
  japan: "JAPAN_ITEMS",
};

/** Originals the editor will convert. RAW files are rejected. */
export const IMPORT_EXT = new Set([
  ".jpeg",
  ".jpg",
  ".tif",
  ".tiff",
  ".heic",
  ".heif",
  ".png",
  ".webp",
]);

export { REGIONS };

export function assertRegion(region) {
  if (!REGIONS.includes(region)) {
    const err = new Error(`Unknown region: ${region}`);
    err.status = 400;
    throw err;
  }
}

export function listMasterNames(region) {
  assertRegion(region);
  const dir = path.join(PHOTOS_ROOT, region);
  if (!fs.existsSync(dir)) return [];
  return listFullAvifs(dir);
}

function fail(status, message) {
  const err = new Error(message);
  err.status = status;
  throw err;
}

export async function importOriginal({
  region,
  buffer,
  filename,
  name: requestedName,
}) {
  assertRegion(region);
  const ext = path.extname(filename || "").toLowerCase();
  if (RAW_EXT.has(ext)) {
    fail(
      400,
      "RAW files cannot be imported here. Export a JPEG, TIFF, HEIC, PNG, or WebP first.",
    );
  }
  if (!IMPORT_EXT.has(ext)) {
    fail(
      400,
      `Unsupported file type ${ext || "(none)"}. Use JPEG, TIFF, HEIC, PNG, or WebP.`,
    );
  }
  if (!IMAGE_EXT.has(ext)) {
    fail(400, `Unsupported file type ${ext}.`);
  }

  const existing = listMasterNames(region);
  const slug = uniqueSlug(
    requestedName?.trim() ? slugify(requestedName) : slugify(filename),
    existing,
  );

  const originalsDir = path.join(ORIGINALS_ROOT, region);
  const photosDir = path.join(PHOTOS_ROOT, region);
  fs.mkdirSync(originalsDir, { recursive: true });
  fs.mkdirSync(photosDir, { recursive: true });

  const originalPath = path.join(originalsDir, `${slug}${ext}`);
  const masterPath = path.join(photosDir, `${slug}.avif`);
  fs.writeFileSync(originalPath, buffer);

  await sharp(buffer).rotate().avif({ quality: 50, effort: 6 }).toFile(masterPath);

  await generateVariantsForName(region, slug);

  const meta = await sharp(masterPath).metadata();
  // Do not rewrite galleryAspectRatios.js / galleryPhotoMeta.js here — that HMR
  // remounts the gallery and dumps edit mode. Client keeps {w,h}; Save refreshes.
  console.log(`gallery-dev: imported ${region}/${slug}`);

  return {
    name: slug,
    w: meta.width ?? 0,
    h: meta.height ?? 0,
  };
}

export function deletePhotoFiles(region, name) {
  assertRegion(region);
  if (!name || /[\\/]/.test(name) || name.includes("..")) {
    fail(400, "Invalid photo name");
  }
  const removed = [];
  const photosDir = path.join(PHOTOS_ROOT, region);
  for (const file of [
    `${name}.avif`,
    `${name}-sm.avif`,
    `${name}-md.avif`,
    `${name}-lg.avif`,
  ]) {
    const p = path.join(photosDir, file);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      removed.push(p);
    }
  }
  const originalsDir = path.join(ORIGINALS_ROOT, region);
  if (fs.existsSync(originalsDir)) {
    for (const file of fs.readdirSync(originalsDir)) {
      if (file.replace(/\.[^.]+$/, "") === name) {
        const p = path.join(originalsDir, file);
        fs.unlinkSync(p);
        removed.push(p);
      }
    }
  }
  return removed;
}

export async function refreshRegionDerived(region) {
  assertRegion(region);
  const ratios = loadAspectRatios();
  ratios[region] = await ratiosForRegion(region);
  writeAspectRatios(ratios);
  const meta = loadPhotoMeta();
  meta[region] = await metaForRegion(region);
  writePhotoMeta(meta);
}

export async function saveRegionItems(region, items, deleteNames = []) {
  assertRegion(region);
  if (!Array.isArray(items)) fail(400, "items must be an array");
  const exportName = REGION_EXPORTS[region];
  const source = fs.readFileSync(DATA_JS, "utf8");
  const next = replaceItemsExport(source, exportName, items);
  fs.writeFileSync(DATA_JS, next);
  const deleted = [];
  for (const name of deleteNames) {
    deleted.push(...deletePhotoFiles(region, name));
  }
  await refreshRegionDerived(region);
  return { exportName, names: collectNames(items), deleted };
}
