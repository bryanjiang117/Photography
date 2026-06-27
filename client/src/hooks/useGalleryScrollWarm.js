import { useEffect, useRef } from "react";
import { warmGalleryImage } from "../galleryPrefetch";

/** Warm lazy images ~1.5 viewports ahead inside a gallery scroll container. */
export function useGalleryScrollWarm() {
  const scrollRef = useRef(null);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const img = entry.target;
          if (img instanceof HTMLImageElement) {
            warmGalleryImage(img.currentSrc || img.src);
          }
        }
      },
      { root, rootMargin: "150%", threshold: 0 },
    );

    const observed = new WeakSet();
    const observeImages = () => {
      root.querySelectorAll("img[src]").forEach((img) => {
        if (observed.has(img)) return;
        observed.add(img);
        io.observe(img);
      });
    };

    observeImages();
    const mo = new MutationObserver(observeImages);
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return scrollRef;
}
