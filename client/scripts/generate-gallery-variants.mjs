/**
 * Generate -sm.avif (800px longest side) and -md.avif (1400px longest side).
 * Re-runs overwrite existing variants. Stale variants are removed when no longer applicable.
 *
 *   npm run photos:variants
 *   node scripts/generate-gallery-variants.mjs --region=mexico
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PHOTOS_ROOT = path.join(__dirname, "../public/assets/photos");
const REGIONS = ["mexico", "canada", "japan"];
/** Max longest edge (px) per tier. */
const LONGEST = { sm: 800, md: 1400 };

function listFullAvifs(regionDir) {
  return fs
    .readdirSync(regionDir)
    .filter(
      (f) =>
        f.endsWith(".avif") &&
        !f.endsWith("-sm.avif") &&
        !f.endsWith("-md.avif"),
    )
    .map((f) => f.replace(/\.avif$/, ""));
}

function longestSide(meta) {
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  return Math.max(w, h);
}

function shouldGenerateVariant(sourceLongest) {
  if (!sourceLongest) return true;
  return sourceLongest > LONGEST.sm;
}

async function writeVariant(inputPath, outputPath, maxLongest) {
  await sharp(inputPath)
    .resize({
      width: maxLongest,
      height: maxLongest,
      fit: "inside",
      withoutEnlargement: true,
    })
    .avif({ quality: 50, effort: 6 })
    .toFile(outputPath);
}

async function generateForRegion(region) {
  const dir = path.join(PHOTOS_ROOT, region);
  if (!fs.existsSync(dir)) return { written: 0, removed: 0 };

  const names = listFullAvifs(dir);
  let written = 0;
  let removed = 0;

  for (const name of names) {
    const fullPath = path.join(dir, `${name}.avif`);
    const meta = await sharp(fullPath).metadata();
    const sourceLongest = longestSide(meta);

    for (const variant of ["sm", "md"]) {
      const outPath = path.join(dir, `${name}-${variant}.avif`);

      if (!shouldGenerateVariant(sourceLongest)) {
        if (fs.existsSync(outPath)) {
          fs.unlinkSync(outPath);
          console.log(`${region}/${name}-${variant}.avif (removed)`);
          removed++;
        }
        continue;
      }

      const cap = Math.min(LONGEST[variant], sourceLongest);
      await writeVariant(fullPath, outPath, cap);
      const outMeta = await sharp(outPath).metadata();
      const kb = Math.round(fs.statSync(outPath).size / 1024);
      console.log(
        `${region}/${name}-${variant}.avif (${kb} KB, ${outMeta.width}×${outMeta.height}, longest ${Math.max(outMeta.width ?? 0, outMeta.height ?? 0)})`,
      );
      written++;
    }
  }

  return { written, removed };
}

const regionArg = process.argv
  .find((a) => a.startsWith("--region="))
  ?.split("=")[1];
const regions = regionArg ? [regionArg] : REGIONS;

let totalWritten = 0;
let totalRemoved = 0;
for (const region of regions) {
  console.log(`\n${region}`);
  const { written, removed } = await generateForRegion(region);
  totalWritten += written;
  totalRemoved += removed;
}

console.log(
  `\nDone. Wrote ${totalWritten} variant files, removed ${totalRemoved} stale files.`,
);
