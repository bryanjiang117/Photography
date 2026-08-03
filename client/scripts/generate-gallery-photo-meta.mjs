/**
 * Extract EXIF (and related) metadata from local originals into galleryPhotoMeta.js.
 *
 *   npm run photos:meta
 *   node scripts/generate-gallery-photo-meta.mjs --region=japan
 *
 * Expects originals at client/originals/{region}/{name}.jpeg (basename = gallery name).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import exifr from "exifr";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ORIGINALS_ROOT = path.join(__dirname, "../originals");
const OUT = path.join(__dirname, "../src/constants/galleryPhotoMeta.js");
const REGIONS = ["mexico", "canada", "china", "japan"];
const IMAGE_EXT = new Set([
  ".jpeg",
  ".jpg",
  ".tif",
  ".tiff",
  ".heic",
  ".heif",
  ".png",
  ".webp",
  ".nef",
  ".raf",
  ".dng",
  ".cr2",
  ".cr3",
  ".arw",
]);

/** @param {number} t seconds */
function formatShutter(t) {
  if (t == null || !Number.isFinite(t) || t <= 0) return undefined;
  if (t >= 1) {
    const s = Number.isInteger(t) ? String(t) : t.toFixed(1).replace(/\.0$/, "");
    return `${s}s`;
  }
  const denom = Math.round(1 / t);
  return `1/${denom}`;
}

/** @param {Record<string, unknown>} raw */
function inferCamera(raw) {
  const make = typeof raw.Make === "string" ? raw.Make.trim() : "";
  const model = typeof raw.Model === "string" ? raw.Model.trim() : "";
  if (make || model) {
    const makeNorm = make.replace(/\s+corporation$/i, "").trim();
    if (model && makeNorm && model.toUpperCase().includes(makeNorm.toUpperCase())) {
      return model;
    }
    if (makeNorm && model) return `${makeNorm} ${model}`.replace(/\s+/g, " ").trim();
    return model || makeNorm || undefined;
  }
  const software = typeof raw.Software === "string" ? raw.Software.trim() : "";
  if (!software) return undefined;
  // "NIKON D3400 Ver.1.12" / "Digital Camera X-S20 Ver3.10"
  const nikon = software.match(/\b(NIKON\s+D\d+)\b/i);
  if (nikon) return nikon[1].toUpperCase().replace(/\s+/g, " ");
  const fuji = software.match(/Digital Camera\s+(\S+)/i);
  if (fuji) return `FUJIFILM ${fuji[1]}`;
  const verStrip = software.replace(/\s+Ver\.?\s*[\d.]+$/i, "").trim();
  return verStrip || software;
}

/** @param {string} takenAt @param {string | undefined} offset e.g. "-04:00" */
function toIsoWithOffset(takenAt, offset) {
  if (!(takenAt instanceof Date) && typeof takenAt !== "string") return undefined;
  const d = takenAt instanceof Date ? takenAt : new Date(takenAt);
  if (Number.isNaN(d.getTime())) return undefined;
  if (!offset || !/^[+-]\d{2}:\d{2}$/.test(offset)) return d.toISOString();
  // DateTimeOriginal from exifr is often UTC-shifted already; prefer ISO from the Date
  // and attach offset only as informational — store UTC ISO for stable parsing.
  return d.toISOString();
}

/** @param {string} filePath */
async function metaForFile(filePath) {
  const raw = await exifr.parse(filePath, {
    gps: true,
    pick: [
      "Make",
      "Model",
      "LensModel",
      "LensMake",
      "FocalLength",
      "FocalLengthIn35mmFormat",
      "FNumber",
      "ExposureTime",
      "ISO",
      "PhotographicSensitivity",
      "DateTimeOriginal",
      "OffsetTimeOriginal",
      "CreateDate",
      "ExposureCompensation",
      "Software",
      "ImageWidth",
      "ImageHeight",
      "ExifImageWidth",
      "ExifImageHeight",
    ],
  });
  if (!raw) return null;

  /** @type {Record<string, unknown>} */
  const out = {};
  const taken =
    raw.DateTimeOriginal ?? raw.CreateDate ?? undefined;
  const takenAt = toIsoWithOffset(taken, raw.OffsetTimeOriginal);
  if (takenAt) out.takenAt = takenAt;

  const camera = inferCamera(raw);
  if (camera) out.camera = camera;

  if (typeof raw.LensModel === "string" && raw.LensModel.trim()) {
    out.lens = raw.LensModel.trim();
  }

  if (typeof raw.FocalLength === "number") out.focalLengthMm = raw.FocalLength;
  if (typeof raw.FocalLengthIn35mmFormat === "number") {
    out.focalLength35mm = raw.FocalLengthIn35mmFormat;
  }
  if (typeof raw.FNumber === "number") out.aperture = raw.FNumber;

  const shutter = formatShutter(raw.ExposureTime);
  if (shutter) out.shutter = shutter;

  const iso = raw.ISO ?? raw.PhotographicSensitivity;
  if (typeof iso === "number") out.iso = iso;

  if (typeof raw.ExposureCompensation === "number") {
    out.exposureComp = raw.ExposureCompensation;
  }

  const width = raw.ExifImageWidth ?? raw.ImageWidth;
  const height = raw.ExifImageHeight ?? raw.ImageHeight;
  if (typeof width === "number") out.width = width;
  if (typeof height === "number") out.height = height;

  return Object.keys(out).length ? out : null;
}

function listOriginals(regionDir) {
  if (!fs.existsSync(regionDir)) return [];
  return fs
    .readdirSync(regionDir)
    .filter((f) => !f.startsWith(".") && IMAGE_EXT.has(path.extname(f).toLowerCase()))
    .sort();
}

async function metaForRegion(region) {
  const dir = path.join(ORIGINALS_ROOT, region);
  /** @type {Record<string, Record<string, unknown>>} */
  const out = {};
  for (const file of listOriginals(dir)) {
    const name = file.replace(/\.[^.]+$/, "");
    try {
      const meta = await metaForFile(path.join(dir, file));
      if (meta) out[name] = meta;
    } catch (err) {
      console.warn(`  skip ${region}/${file}:`, err.message);
    }
  }
  return out;
}

const regionArg = process.argv
  .find((a) => a.startsWith("--region="))
  ?.split("=")[1];
const regions = regionArg ? [regionArg] : REGIONS;

/** @type {Record<string, Record<string, Record<string, unknown>>>} */
let data = {};
if (regionArg && fs.existsSync(OUT)) {
  const prev = fs.readFileSync(OUT, "utf8");
  const match = prev.match(
    /export const GALLERY_PHOTO_META = (\{[\s\S]*?\});\s*\n/,
  );
  if (match) data = JSON.parse(match[1]);
}

for (const region of regions) {
  console.log(region);
  data[region] = await metaForRegion(region);
  console.log(`  ${Object.keys(data[region]).length} photos with meta`);
}

const content = `/** Auto-generated by scripts/generate-gallery-photo-meta.mjs — do not edit */
export const GALLERY_PHOTO_META = ${JSON.stringify(data, null, 2)};

/** @returns {import('../galleryPhotoMetaFormat.js').GalleryPhotoMeta | null} */
export function galleryPhotoMeta(region, name) {
  return GALLERY_PHOTO_META[region]?.[name] ?? null;
}
`;

fs.writeFileSync(OUT, content);
console.log(`\nWrote ${OUT}`);
