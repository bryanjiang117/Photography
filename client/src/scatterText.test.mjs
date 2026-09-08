import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  letterTraits,
  rand01,
  scatterTarget,
  SCATTER_RADIUS,
} from "./scatterText.mjs";

describe("scatterTarget", () => {
  const traits = letterTraits(0);

  it("leaves letters outside the radius alone", () => {
    const out = scatterTarget(0, 0, SCATTER_RADIUS + 1, 0, traits);
    assert.deepEqual(out, { x: 0, y: 0, rotate: 0 });
  });

  it("pushes a letter away from the cursor", () => {
    const out = scatterTarget(0, 0, 40, 0, traits);
    assert.ok(out.x > 0);
    assert.notEqual(out.y, 0);
    assert.notEqual(out.rotate, 0);
  });

  it("pushes harder when the cursor is closer", () => {
    const near = scatterTarget(0, 0, 20, 0, traits);
    const far = scatterTarget(0, 0, 90, 0, traits);
    assert.ok(Math.hypot(near.x, near.y) > Math.hypot(far.x, far.y));
  });

  it("sends nearby letters different distances", () => {
    const a = scatterTarget(0, 0, 24, 0, letterTraits(0));
    const b = scatterTarget(0, 0, 24, 0, letterTraits(1));
    assert.notEqual(Math.hypot(a.x, a.y), Math.hypot(b.x, b.y));
  });

  it("uses a stable escape angle when the cursor is on the letter", () => {
    const onTop = scatterTarget(10, 10, 10, 10, traits);
    const beside = scatterTarget(10, 10, 40, 10, traits);
    assert.ok(Math.hypot(onTop.x, onTop.y) > 0);
    assert.ok(
      Math.abs(Math.cos(Math.atan2(onTop.y, onTop.x)) - Math.cos(traits.escapeAngle)) <
        1e-10,
    );
    assert.ok(
      Math.abs(Math.sin(Math.atan2(onTop.y, onTop.x)) - Math.sin(traits.escapeAngle)) <
        1e-10,
    );
    assert.notEqual(Math.atan2(beside.y, beside.x), traits.escapeAngle);
  });
});

describe("rand01", () => {
  it("stays in 0–1 and is deterministic", () => {
    assert.equal(rand01(3), rand01(3));
    assert.ok(rand01(3) >= 0 && rand01(3) < 1);
    assert.notEqual(rand01(3), rand01(4));
  });
});
