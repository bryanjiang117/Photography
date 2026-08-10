/**
 * Parse Spotify/HTTP Retry-After into a wait duration in ms.
 * Supports delta-seconds and HTTP-date forms.
 */
export function parseRetryAfterMs(retryAfterHeader, nowMs = Date.now()) {
  if (retryAfterHeader == null || retryAfterHeader === "") return null;

  const asSeconds = Number(retryAfterHeader);
  if (Number.isFinite(asSeconds) && asSeconds >= 0) {
    return Math.ceil(asSeconds * 1000);
  }

  const asDate = Date.parse(retryAfterHeader);
  if (!Number.isNaN(asDate)) {
    return Math.max(0, asDate - nowMs);
  }

  return null;
}

/**
 * Absolute timestamp until which Spotify polls should be skipped.
 */
export function nextRateLimitedUntilMs(
  retryAfterHeader,
  nowMs,
  defaultWaitMs,
) {
  const waitMs = parseRetryAfterMs(retryAfterHeader, nowMs) ?? defaultWaitMs;
  return nowMs + waitMs;
}
