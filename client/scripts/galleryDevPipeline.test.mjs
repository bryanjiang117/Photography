import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import os from "os";
import path from "path";
import sharp from "sharp";
import {
  importOriginal,
  listPhotoNames,
  generateImportVariants,
  orientedSize,
} from "./galleryDevPipeline.mjs";

const PNG_RED = await sharp({
  create: {
    width: 12,
    height: 8,
    channels: 3,
    background: { r: 200, g: 40, b: 40 },
  },
})
  .png()
  .toBuffer();

let tmp;
let originalsRoot;
let photosRoot;

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "gallery-import-"));
  originalsRoot = path.join(tmp, "originals");
  photosRoot = path.join(tmp, "photos");
});

afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe("orientedSize", () => {
  it("swaps width and height for EXIF orientations 5–8", () => {
    assert.deepEqual(orientedSize({ width: 4000, height: 3000, orientation: 1 }), {
      w: 4000,
      h: 3000,
    });
    assert.deepEqual(orientedSize({ width: 4000, height: 3000, orientation: 6 }), {
      w: 3000,
      h: 4000,
    });
  });
});

describe("importOriginal", () => {
  it("returns the photo as soon as the original is on disk, before AVIF variants", async () => {
    const result = await importOriginal({
      region: "japan",
      buffer: PNG_RED,
      filename: "Cedar Grove.png",
      originalsRoot,
      photosRoot,
    });

    assert.equal(result.name, "cedar-grove");
    assert.equal(result.w, 12);
    assert.equal(result.h, 8);
    assert.equal(
      fs.existsSync(path.join(originalsRoot, "japan", "cedar-grove.png")),
      true,
    );
    assert.equal(
      fs.existsSync(path.join(photosRoot, "japan", "cedar-grove.avif")),
      false,
    );
    assert.equal(
      fs.existsSync(path.join(photosRoot, "japan", "cedar-grove-sm.avif")),
      false,
    );
  });

  it("lists originals that do not have a master AVIF yet", async () => {
    await importOriginal({
      region: "japan",
      buffer: PNG_RED,
      filename: "Cedar Grove.png",
      originalsRoot,
      photosRoot,
    });
    assert.deepEqual(listPhotoNames("japan", { originalsRoot, photosRoot }), [
      "cedar-grove",
    ]);
  });

  it("does not reuse a name that only exists as an original", async () => {
    await importOriginal({
      region: "japan",
      buffer: PNG_RED,
      filename: "Cedar Grove.png",
      originalsRoot,
      photosRoot,
    });
    const second = await importOriginal({
      region: "japan",
      buffer: PNG_RED,
      filename: "Cedar Grove.png",
      originalsRoot,
      photosRoot,
    });
    assert.equal(second.name, "cedar-grove-2");
  });
});

describe("generateImportVariants", () => {
  it("writes the master AVIF from the original", async () => {
    const { name } = await importOriginal({
      region: "japan",
      buffer: PNG_RED,
      filename: "Cedar Grove.png",
      originalsRoot,
      photosRoot,
    });
    await generateImportVariants("japan", name, {
      buffer: PNG_RED,
      originalsRoot,
      photosRoot,
    });
    assert.equal(
      fs.existsSync(path.join(photosRoot, "japan", `${name}.avif`)),
      true,
    );
  });

  it("does not write a master if the import was cancelled", async () => {
    const { name } = await importOriginal({
      region: "japan",
      buffer: PNG_RED,
      filename: "Cedar Grove.png",
      originalsRoot,
      photosRoot,
    });
    await generateImportVariants("japan", name, {
      buffer: PNG_RED,
      cancelled: { value: true },
      originalsRoot,
      photosRoot,
    });
    assert.equal(
      fs.existsSync(path.join(photosRoot, "japan", `${name}.avif`)),
      false,
    );
  });
});
