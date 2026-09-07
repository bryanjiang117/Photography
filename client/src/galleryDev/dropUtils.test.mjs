import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { selectionAfterDrop, selectionFromDragSource } from "./dropUtils.mjs";

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

describe("selectionAfterDrop", () => {
  it("selects the destination row after placing a photo", () => {
    assert.deepEqual(
      selectionAfterDrop(
        { kind: "tray", name: "x" },
        { kind: "insert-col", row: 2, col: 1 },
      ),
      { type: "row", row: 2 },
    );
    assert.deepEqual(
      selectionAfterDrop(
        { kind: "tray", name: "x" },
        { kind: "fill-blank", row: 0, col: 1 },
      ),
      { type: "row", row: 0 },
    );
    assert.deepEqual(
      selectionAfterDrop(
        { kind: "tray", name: "x" },
        { kind: "new-row", row: 3 },
      ),
      { type: "row", row: 3 },
    );
  });

  it("keeps the source row selected when a photo is unplaced", () => {
    assert.deepEqual(
      selectionAfterDrop(
        { kind: "photo", row: 1, col: 0, entry: 0 },
        { kind: "tray" },
      ),
      { type: "row", row: 1 },
    );
  });

  it("returns null when there is no dest", () => {
    assert.equal(selectionAfterDrop({ kind: "tray", name: "x" }, null), null);
  });
});

