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

/** Formats the browser can show in an <img> without conversion. */
export const BROWSER_IMAGE_EXT = new Set([".jpeg", ".jpg", ".png", ".webp"]);

export function assertRegion(region) {
  if (!REGIONS.includes(region)) {
    const err = new Error(`Unknown region: ${region}`);
    err.status = 400;
    throw err;
  }
}

export function orientedSize(meta) {
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const orientation = meta.orientation ?? 1;
  if (orientation >= 5 && orientation <= 8) return { w: h, h: w };
  return { w, h };
}

function rootsOf(roots = {}) {
  return {
    photosRoot: roots.photosRoot ?? PHOTOS_ROOT,
    originalsRoot: roots.originalsRoot ?? ORIGINALS_ROOT,
  };
}

export function listMasterNames(region, roots) {
  assertRegion(region);
  const { photosRoot } = rootsOf(roots);
  const dir = path.join(photosRoot, region);
  if (!fs.existsSync(dir)) return [];
  return listFullAvifs(dir);
}

export function listOriginalNames(region, roots) {
  assertRegion(region);
  const { originalsRoot } = rootsOf(roots);
  const dir = path.join(originalsRoot, region);
  if (!fs.existsSync(dir)) return [];
  const names = [];
  for (const file of fs.readdirSync(dir)) {
    if (file.startsWith(".")) continue;
    const ext = path.extname(file).toLowerCase();
    if (!IMPORT_EXT.has(ext)) continue;
    names.push(file.slice(0, -ext.length));
  }
  return names;
}

export function listPhotoNames(region, roots) {
  return [
    ...new Set([
      ...listMasterNames(region, roots),
      ...listOriginalNames(region, roots),
    ]),
  ];
}

export function importPreviewPath(region, name, roots) {
  const { originalsRoot } = rootsOf(roots);
  return path.join(originalsRoot, region, `.${name}.preview.jpg`);
}

export function findOriginalPath(region, name, roots) {
  const { originalsRoot } = rootsOf(roots);
  const dir = path.join(originalsRoot, region);
  if (!fs.existsSync(dir)) return null;
  for (const file of fs.readdirSync(dir)) {
    if (file.startsWith(".")) continue;
    const ext = path.extname(file);
    if (!ext) continue;
    if (file.slice(0, -ext.length) === name) return path.join(dir, file);
  }
  return null;
}

function fail(status, message) {
  const err = new Error(message);
  err.status = status;
  throw err;
}

const reservedSlugs = new Set();

function reservedKey(region, name) {
  return `${region}/${name}`;
}

function reserveImportSlug(region, base, roots) {
  const inFlight = [...reservedSlugs]
    .filter((key) => key.startsWith(`${region}/`))
    .map((key) => key.slice(region.length + 1));
  const slug = uniqueSlug(base, [...listPhotoNames(region, roots), ...inFlight]);
  reservedSlugs.add(reservedKey(region, slug));
  return slug;
}

function releaseImportSlug(region, name) {
  reservedSlugs.delete(reservedKey(region, name));
}

export async function writeImportPreview(buffer, destPath) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  await sharp(buffer)
    .rotate()
    .resize({
      width: 800,
      height: 800,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 70 })
    .toFile(destPath);
}

export async function importOriginal({
  region,
  buffer,
  filename,
  name: requestedName,
  originalsRoot,
  photosRoot,
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

  const roots = { originalsRoot, photosRoot };
  const slug = reserveImportSlug(
    region,
    requestedName?.trim() ? slugify(requestedName) : slugify(filename),
    roots,
  );

  try {
    const originalsDir = path.join(rootsOf(roots).originalsRoot, region);
    fs.mkdirSync(originalsDir, { recursive: true });
    fs.mkdirSync(path.join(rootsOf(roots).photosRoot, region), {
      recursive: true,
    });

    fs.writeFileSync(path.join(originalsDir, `${slug}${ext}`), buffer);

    const meta = await sharp(buffer).metadata();
    const { w, h } = orientedSize(meta);

    // HEIC/TIFF need a JPEG the browser can show before AVIFs exist.
    if (!BROWSER_IMAGE_EXT.has(ext)) {
      await writeImportPreview(
        buffer,
        importPreviewPath(region, slug, roots),
      );
    }

    // Do not rewrite galleryAspectRatios.js / galleryPhotoMeta.js here — that HMR
    // remounts the gallery and dumps edit mode. Client keeps {w,h}; Save refreshes.
    console.log(`gallery-dev: imported original ${region}/${slug}`);

    return { name: slug, w, h, ext };
  } finally {
    releaseImportSlug(region, slug);
  }
}

export async function generateImportVariants(
  region,
  name,
  {
    buffer,
    cancelled,
    originalsRoot,
    photosRoot,
  } = {},
) {
  assertRegion(region);
  if (!name || /[\\/]/.test(name) || name.includes("..")) {
    fail(400, "Invalid photo name");
  }
  const roots = { originalsRoot, photosRoot };
  const wanted = () =>
    !cancelled?.value && Boolean(findOriginalPath(region, name, roots));

  if (!wanted()) return { written: 0 };

  const photosDir = path.join(rootsOf(roots).photosRoot, region);
  fs.mkdirSync(photosDir, { recursive: true });
  const masterPath = path.join(photosDir, `${name}.avif`);

  let source = buffer;
  if (!source) {
    const originalPath = findOriginalPath(region, name, roots);
    if (!originalPath) return { written: 0 };
    source = fs.readFileSync(originalPath);
  }

  if (!wanted()) return { written: 0 };

  await sharp(source)
    .rotate()
    .avif({ quality: 50, effort: 6 })
    .toFile(masterPath);

  if (!wanted()) {
    deletePhotoFiles(region, name, roots);
    return { written: 0 };
  }

  await generateVariantsForName(region, name, {
    photosRoot: rootsOf(roots).photosRoot,
  });

  if (!wanted()) {
    deletePhotoFiles(region, name, roots);
    return { written: 0 };
  }

  // Leave any HEIC/TIFF jpeg preview on disk — the editor may still be
  // showing it. deletePhotoFiles removes it when the photo is deleted.
  console.log(`gallery-dev: variants ready ${region}/${name}`);
  return { written: 1 };
}

export function deletePhotoFiles(region, name, roots) {
  assertRegion(region);
  if (!name || /[\\/]/.test(name) || name.includes("..")) {
    fail(400, "Invalid photo name");
  }
  const { photosRoot, originalsRoot } = rootsOf(roots);
  const removed = [];
  const photosDir = path.join(photosRoot, region);
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
  const originalsDir = path.join(originalsRoot, region);
  if (fs.existsSync(originalsDir)) {
    for (const file of fs.readdirSync(originalsDir)) {
      const isPreview = file === `.${name}.preview.jpg`;
      const isOriginal =
        !file.startsWith(".") && file.replace(/\.[^.]+$/, "") === name;
      if (isPreview || isOriginal) {
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
