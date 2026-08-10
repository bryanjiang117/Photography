import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseRetryAfterMs,
  nextRateLimitedUntilMs,
} from "./spotifyRateLimit.js";

describe("parseRetryAfterMs", () => {
  it("parses Retry-After seconds into milliseconds", () => {
    assert.equal(parseRetryAfterMs("120"), 120_000);
  });

  it("parses HTTP-date Retry-After relative to now", () => {
    const now = Date.parse("Thu, 10 Aug 2026 20:00:00 GMT");
    const header = "Thu, 10 Aug 2026 20:05:00 GMT";
    assert.equal(parseRetryAfterMs(header, now), 300_000);
  });

  it("returns null for missing or invalid values", () => {
    assert.equal(parseRetryAfterMs(null), null);
    assert.equal(parseRetryAfterMs(""), null);
    assert.equal(parseRetryAfterMs("nope"), null);
  });
});

describe("nextRateLimitedUntilMs", () => {
  it("uses Retry-After when present", () => {
    const now = 1_000_000;
    assert.equal(nextRateLimitedUntilMs("180", now, 90_000), now + 180_000);
  });

  it("falls back to the default wait when header is missing", () => {
    const now = 1_000_000;
    assert.equal(nextRateLimitedUntilMs(null, now, 90_000), now + 90_000);
  });
});
