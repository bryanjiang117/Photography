export const SCATTER_RADIUS = 150;
export const SCATTER_MAX_FORCE = 78;

/** Deterministic 0–1 from an integer seed. */
export function rand01(n) {
  let t = (n + 0x9e3779b9) >>> 0;
  t = Math.imul(t ^ (t >>> 16), 0x21f0aaad);
  t = Math.imul(t ^ (t >>> 15), 0x735a2d97);
  return ((t ^ (t >>> 15)) >>> 0) / 4294967296;
}

export function letterTraits(index) {
  return {
    jitter: (rand01(index) - 0.5) * 1.15,
    dist: 0.38 + rand01(index + 19) * 1.42,
    spin: (rand01(index + 41) - 0.5) * 80,
    escapeAngle: rand01(index + 73) * Math.PI * 2,
  };
}

export function scatterTarget(
  mx,
  my,
  lx,
  ly,
  traits,
  { radius = SCATTER_RADIUS, maxForce = SCATTER_MAX_FORCE } = {},
) {
  const dx = lx - mx;
  const dy = ly - my;
  const dist = Math.hypot(dx, dy);
  if (dist >= radius) {
    return { x: 0, y: 0, rotate: 0 };
  }

  const t = 1 - dist / radius;
  const strength = t * t;
  const angle =
    dist < 2
      ? traits.escapeAngle
      : Math.atan2(dy, dx) + traits.jitter * (0.45 + 0.55 * strength);
  const force = maxForce * strength * traits.dist;

  return {
    x: Math.cos(angle) * force,
    y: Math.sin(angle) * force,
    rotate: traits.spin * strength,
  };
}
