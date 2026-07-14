import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Parse rootMargin-like overscan ("300%", "200px") into CSS pixels.
 * Percentage is relative to the scroll root's height (viewport if none).
 * @param {string} overscan
 * @param {number} rootHeight
 */
function overscanPx(overscan, rootHeight) {
  const raw = String(overscan).trim();
  if (raw.endsWith("%")) {
    const pct = Number.parseFloat(raw);
    return Number.isFinite(pct) ? (pct / 100) * rootHeight : 0;
  }
  if (raw.endsWith("px")) {
    const px = Number.parseFloat(raw);
    return Number.isFinite(px) ? px : 0;
  }
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Sync intersection check (with overscan) so the first paint can skip
 * off-screen image mounts without waiting for IntersectionObserver.
 * @param {Element} el
 * @param {Element | null} root
 * @param {string} overscan
 */
function isNearViewport(el, root, overscan) {
  const rootRect = root
    ? root.getBoundingClientRect()
    : { top: 0, bottom: window.innerHeight, height: window.innerHeight };
  const margin = overscanPx(overscan, rootRect.height || window.innerHeight);
  const top = rootRect.top - margin;
  const bottom = rootRect.bottom + margin;
  const rect = el.getBoundingClientRect();
  return rect.bottom >= top && rect.top <= bottom;
}

/**
 * Wraps one gallery row. Unmounts its children when the row is more than
 * `overscan` away from the scroll viewport, freeing the browser's decoded-image
 * memory so scrolled-past photos don't get purged/re-decoded unpredictably.
 *
 * Starts inactive for off-screen rows (using `fallback` to reserve height) so
 * opening a gallery does not decode every image at once.
 *
 * @param {{
 *   rootRef?: React.RefObject<HTMLElement>;
 *   overscan?: string;
 *   style?: React.CSSProperties;
 *   fallback?: React.ReactNode;
 *   children: React.ReactNode;
 * }} props
 */
export default function VirtualGalleryRow({
  rootRef,
  overscan = "300%",
  style: styleProp,
  fallback = null,
  children,
}) {
  const ref = useRef(null);
  const heightRef = useRef(0);
  // null = not measured yet; show fallback to reserve layout before IO.
  const [active, setActive] = useState(/** @type {boolean | null} */ (null));

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = rootRef?.current ?? null;
    setActive(isNearViewport(el, root, overscan));
  }, [rootRef, overscan]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const h = el.offsetHeight;
    if (h > 0) heightRef.current = h;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      {
        root: rootRef?.current ?? null,
        rootMargin: `${overscan} 0px`,
        threshold: 0,
      },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootRef, overscan]);

  const showChildren = active === true;
  const measured = heightRef.current > 0;
  const style =
    !showChildren && measured
      ? { ...styleProp, height: `${heightRef.current}px` }
      : styleProp;

  // Reserve height with aspect-ratio placeholders until measured; then an empty
  // locked-height box for off-screen rows (no ongoing placeholder DOM).
  let body = null;
  if (showChildren) body = children;
  else if (!measured || active === null) body = fallback;

  return (
    <div ref={ref} className="w-full shrink-0" style={style}>
      {body}
    </div>
  );
}
