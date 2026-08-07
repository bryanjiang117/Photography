/**
 * Extract EXIF (and related) metadata from local originals into galleryPhotoMeta.js.
 *
 *   npm run photos:meta
 *   node scripts/generate-gallery-photo-meta.mjs --region=japan
 *
 * Expects originals at client/originals/{region}/{name}.ext (basename = gallery name).
 * Uses exifr, then enriches with exiftool when available (Nikon MakerNotes: lens, shutter count).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
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
const RAW_EXT = new Set([".nef", ".raf", ".dng", ".cr2", ".cr3", ".arw"]);

function hasExiftool() {
  try {
    execFileSync("exiftool", ["-ver"], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Batch-read MakerNote-friendly fields via exiftool.
 * @param {string[]} filePaths absolute paths
 * @returns {Map<string, Record<string, unknown>>} keyed by absolute path
 */
function exiftoolEnrichment(filePaths) {
  /** @type {Map<string, Record<string, unknown>>} */
  const map = new Map();
  if (!filePaths.length || !hasExiftool()) return map;
  try {
    const json = execFileSync(
      "exiftool",
      [
        "-json",
        "-Lens",
        "-LensModel",
        "-ShutterCount",
        "-ImageWidth",
        "-ImageHeight",
        ...filePaths,
      ],
      { maxBuffer: 64 * 1024 * 1024 },
    ).toString("utf8");
    const rows = JSON.parse(json);
    for (const row of rows) {
      if (row?.SourceFile) map.set(path.resolve(row.SourceFile), row);
    }
  } catch (err) {
    console.warn("  exiftool enrichment failed:", err.message);
  }
  return map;
}

/** Prefer LensModel; fall back to Nikon/Fuji Lens string. */
function pickLens(exifrRaw, toolRow) {
  for (const v of [
    exifrRaw?.LensModel,
    toolRow?.LensModel,
    toolRow?.Lens,
    exifrRaw?.Lens,
  ]) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

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

/**
 * @param {string} filePath
 * @param {Record<string, unknown> | undefined} toolRow
 */
async function metaForFile(filePath, toolRow) {
  const raw = await exifr.parse(filePath, {
    gps: true,
    pick: [
      "Make",
      "Model",
      "Lens",
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
  if (!raw && !toolRow) return null;

  /** @type {Record<string, unknown>} */
  const out = {};
  const taken =
    raw?.DateTimeOriginal ?? raw?.CreateDate ?? undefined;
  const takenAt = toIsoWithOffset(taken, raw?.OffsetTimeOriginal);
  if (takenAt) out.takenAt = takenAt;

  const camera = raw ? inferCamera(raw) : undefined;
  if (camera) out.camera = camera;

  const lens = pickLens(raw, toolRow);
  if (lens) out.lens = lens;

  const shutterCount = toolRow?.ShutterCount;
  if (typeof shutterCount === "number" && Number.isFinite(shutterCount)) {
    out.shutterCount = shutterCount;
  }

  if (typeof raw?.FocalLength === "number") out.focalLengthMm = raw.FocalLength;
  if (typeof raw?.FocalLengthIn35mmFormat === "number") {
    out.focalLength35mm = raw.FocalLengthIn35mmFormat;
  }
  if (typeof raw?.FNumber === "number") out.aperture = raw.FNumber;

  const shutter = formatShutter(raw?.ExposureTime);
  if (shutter) out.shutter = shutter;

  const iso = raw?.ISO ?? raw?.PhotographicSensitivity;
  if (typeof iso === "number") out.iso = iso;

  if (typeof raw?.ExposureCompensation === "number") {
    out.exposureComp = raw.ExposureCompensation;
  }

  // RAW IFD0 width/height is often the thumbnail (e.g. 160×120); prefer exiftool.
  const ext = path.extname(filePath).toLowerCase();
  let width = raw?.ExifImageWidth ?? raw?.ImageWidth;
  let height = raw?.ExifImageHeight ?? raw?.ImageHeight;
  if (
    RAW_EXT.has(ext) &&
    typeof toolRow?.ImageWidth === "number" &&
    typeof toolRow?.ImageHeight === "number"
  ) {
    width = toolRow.ImageWidth;
    height = toolRow.ImageHeight;
  }
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
  const files = listOriginals(dir);
  const absPaths = files.map((f) => path.join(dir, f));
  const toolByPath = exiftoolEnrichment(absPaths);
  if (toolByPath.size) {
    console.log(`  exiftool: ${toolByPath.size}/${files.length} files`);
  }
  /** @type {Record<string, Record<string, unknown>>} */
  const out = {};
  for (const file of files) {
    const name = file.replace(/\.[^.]+$/, "");
    const abs = path.join(dir, file);
    try {
      const meta = await metaForFile(abs, toolByPath.get(path.resolve(abs)));
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
