import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TRAY_THUMB_SHORT, trayThumbSize } from "./trayThumb.mjs";

describe("trayThumbSize", () => {
  it("falls back to a square when size is unknown", () => {
    assert.deepEqual(trayThumbSize(null), {
      width: TRAY_THUMB_SHORT,
      height: TRAY_THUMB_SHORT,
    });
    assert.deepEqual(trayThumbSize({ w: 2400 }), {
      width: TRAY_THUMB_SHORT,
      height: TRAY_THUMB_SHORT,
    });
  });

  it("keeps landscape 56px tall and wider than tall", () => {
    assert.deepEqual(trayThumbSize({ w: 2400, h: 1600 }), {
      width: "calc(3.5rem * 2400 / 1600)",
      height: TRAY_THUMB_SHORT,
    });
  });

  it("keeps portrait 56px wide so it stays readable", () => {
    assert.deepEqual(trayThumbSize({ w: 1600, h: 2400 }), {
      width: TRAY_THUMB_SHORT,
      height: "calc(3.5rem * 2400 / 1600)",
    });
  });

  it("keeps squares square", () => {
    assert.deepEqual(trayThumbSize({ w: 2000, h: 2000 }), {
      width: "calc(3.5rem * 2000 / 2000)",
      height: TRAY_THUMB_SHORT,
    });
  });
});
