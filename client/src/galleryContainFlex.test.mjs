import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { containFitFlex } from "./galleryContainFlex.mjs";

describe("containFitFlex", () => {
  it("sizes a photo column from aspect ratio when contain is on and flex is unset", () => {
    assert.equal(
      containFitFlex({ fit: "contain" }, 6240, 3512),
      `${6240 / 3512} 1 0%`,
    );
  });

  it("does not override explicit column widths", () => {
    assert.equal(
      containFitFlex({ fit: "contain", flex: [1, 9, 1, 4] }, 6240, 3512),
      null,
    );
  });

  it("does nothing when contain is off", () => {
    assert.equal(containFitFlex({ flex: [1, 9] }, 1000, 500), null);
    assert.equal(containFitFlex({}, 1000, 500), null);
  });
});
