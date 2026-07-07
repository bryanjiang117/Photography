import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Wraps one gallery row. Unmounts its children when the row is more than
 * `overscan` away from the scroll viewport, freeing the browser's decoded-image
 * memory so scrolled-past photos don't get purged/re-decoded unpredictably.
 *
 * The row's measured height is locked while inactive, so the total scroll height
 * (and scroll position) stays stable — children reserve the same space via their
 * aspect-ratio boxes when they remount.
 *
 * @param {{
 *   rootRef?: React.RefObject<HTMLElement>;
 *   overscan?: string;
 *   children: React.ReactNode;
 * }} props
 */
export default function VirtualGalleryRow({
  rootRef,
  overscan = "300%",
  children,
}) {
  const ref = useRef(null);
  const heightRef = useRef(0);
  const [active, setActive] = useState(true);

  useLayoutEffect(() => {
    if (active && ref.current) {
      const h = ref.current.offsetHeight;
      if (h > 0) heightRef.current = h;
    }
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

  const style =
    !active && heightRef.current > 0
      ? { height: `${heightRef.current}px` }
      : undefined;

  return (
    <div ref={ref} className="w-full shrink-0" style={style}>
      {active ? children : null}
    </div>
  );
}
