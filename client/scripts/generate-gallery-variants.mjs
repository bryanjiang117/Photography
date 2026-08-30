/**
 * Generate sized AVIF variants from master `name.avif`:
 *   -sm.avif (800px longest side)
 *   -md.avif (1400px longest side)
 *   -lg.avif (2400px longest side)
 *
 * By default re-runs overwrite existing variants. Stale variants are removed when
 * no longer applicable (unless --missing, which never deletes).
 *
 *   npm run photos:variants
 *   node scripts/generate-gallery-variants.mjs --region=china
 *   node scripts/generate-gallery-variants.mjs --only=lg
 *   node scripts/generate-gallery-variants.mjs --missing
 *   node scripts/generate-gallery-variants.mjs --missing --region=japan
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PHOTOS_ROOT = path.join(__dirname, "../public/assets/photos");
const REGIONS = ["mexico", "canada", "china", "japan"];
/** Max longest edge (px) per sized tier. */
const LONGEST = { sm: 800, md: 1400, lg: 2400 };
const ALL_VARIANTS = /** @type {const} */ (["sm", "md", "lg"]);

export { PHOTOS_ROOT, REGIONS, LONGEST, ALL_VARIANTS };

export function listFullAvifs(regionDir) {
  return fs
    .readdirSync(regionDir)
    .filter(
      (f) =>
        f.endsWith(".avif") &&
        !f.endsWith("-sm.avif") &&
        !f.endsWith("-md.avif") &&
        !f.endsWith("-lg.avif"),
    )
    .map((f) => f.replace(/\.avif$/, ""));
}

export function longestSide(meta) {
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  return Math.max(w, h);
}

export function shouldGenerateVariant(sourceLongest) {
  if (!sourceLongest) return true;
  return sourceLongest > LONGEST.sm;
}

export async function writeVariant(inputPath, outputPath, maxLongest) {
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

export async function generateVariantsForName(
  region,
  name,
  { missingOnly = false, variants = ALL_VARIANTS, photosRoot = PHOTOS_ROOT } = {},
) {
  const dir = path.join(photosRoot, region);
  const fullPath = path.join(dir, `${name}.avif`);
  if (!fs.existsSync(fullPath)) {
    return { written: 0, skipped: 0, removed: 0 };
  }
  const meta = await sharp(fullPath).metadata();
  const sourceLongest = longestSide(meta);
  let written = 0;
  let skipped = 0;
  let removed = 0;

  for (const variant of variants) {
    const outPath = path.join(dir, `${name}-${variant}.avif`);

    if (!shouldGenerateVariant(sourceLongest)) {
      if (!missingOnly && fs.existsSync(outPath)) {
        fs.unlinkSync(outPath);
        removed++;
      }
      continue;
    }

    if (missingOnly && fs.existsSync(outPath)) {
      skipped++;
      continue;
    }

    const cap = Math.min(LONGEST[variant], sourceLongest);
    await writeVariant(fullPath, outPath, cap);
    written++;
  }

  return { written, skipped, removed };
}

async function generateForRegion(
  region,
  { missingOnly = false, variants = ALL_VARIANTS } = {},
) {
  const dir = path.join(PHOTOS_ROOT, region);
  if (!fs.existsSync(dir)) return { written: 0, skipped: 0, removed: 0 };

  const names = listFullAvifs(dir);
  let written = 0;
  let skipped = 0;
  let removed = 0;

  for (const name of names) {
    const fullPath = path.join(dir, `${name}.avif`);
    const meta = await sharp(fullPath).metadata();
    const sourceLongest = longestSide(meta);

    for (const variant of variants) {
      const outPath = path.join(dir, `${name}-${variant}.avif`);

      if (!shouldGenerateVariant(sourceLongest)) {
        if (!missingOnly && fs.existsSync(outPath)) {
          fs.unlinkSync(outPath);
          console.log(`${region}/${name}-${variant}.avif (removed)`);
          removed++;
        }
        continue;
      }

      if (missingOnly && fs.existsSync(outPath)) {
        skipped++;
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

  return { written, skipped, removed };
}

async function main() {
  const onlyArg = process.argv
    .find((a) => a.startsWith("--only="))
    ?.split("=")[1];
  const variants = onlyArg
    ? onlyArg.split(",").filter((a) => a in LONGEST)
    : [...ALL_VARIANTS];
  if (variants.length === 0) {
    console.error("No valid variants in --only= (use sm, md, and/or lg)");
    process.exit(1);
  }
  const missingOnly = process.argv.includes("--missing");
  const regionArg = process.argv
    .find((a) => a.startsWith("--region="))
    ?.split("=")[1];
  const regions = regionArg ? [regionArg] : REGIONS;

  if (missingOnly) console.log("Mode: missing variants only");

  let totalWritten = 0;
  let totalSkipped = 0;
  let totalRemoved = 0;
  for (const region of regions) {
    console.log(`\n${region}`);
    const { written, skipped, removed } = await generateForRegion(region, {
      missingOnly,
      variants,
    });
    totalWritten += written;
    totalSkipped += skipped;
    totalRemoved += removed;
  }

  console.log(
    `\nDone. Wrote ${totalWritten} variant files` +
      (missingOnly ? `, skipped ${totalSkipped} existing` : "") +
      `, removed ${totalRemoved} stale files.`,
  );
}

const isCli =
  Boolean(process.argv[1]) &&
  path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);
if (isCli) await main();
