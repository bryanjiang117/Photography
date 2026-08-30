import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { selectionFromDragSource } from "./dropUtils.mjs";

describe("selectionFromDragSource", () => {
  it("selects a row from a row handle press", () => {
    assert.deepEqual(selectionFromDragSource({ kind: "row", row: 2 }), {
      type: "row",
      row: 2,
    });
  });

  it("selects a photo from a photo press", () => {
    assert.deepEqual(
      selectionFromDragSource({
        kind: "photo",
        row: 1,
        col: 0,
        entry: 0,
      }),
      { type: "photo", row: 1, col: 0, entry: 0 },
    );
  });

  it("does not select after a drag or from the tray", () => {
    assert.equal(
      selectionFromDragSource({ kind: "row", row: 0 }, true),
      null,
    );
    assert.equal(
      selectionFromDragSource({ kind: "tray", name: "foo" }),
      null,
    );
  });
});
