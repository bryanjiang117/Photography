import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  getResolvedGallery,
  loadGalleryChunk,
} from "./galleryChunkPrefetch";
import GalleryLoadingShell from "./GalleryLoadingShell";

/**
 * Mounts a gallery overlay immediately on open. If the JS chunk is not ready yet,
 * the loading shell shows title + skeletons while the chunk loads in the background.
 */
export default function GallerySlot({ show, region, isMobile }) {
  const usedShellRef = useRef(false);
  const [Comp, setComp] = useState(null);

  useEffect(() => {
    if (!show) {
      setComp(null);
      usedShellRef.current = false;
      return;
    }

    const cached = getResolvedGallery(region, isMobile);
    if (cached) {
      usedShellRef.current = false;
      setComp(() => cached);
      return;
    }

    usedShellRef.current = true;
    let cancelled = false;
    loadGalleryChunk(region, isMobile).then((Component) => {
      if (!cancelled) setComp(() => Component);
    });

    return () => {
      cancelled = true;
    };
  }, [show, region, isMobile]);

  return (
    <AnimatePresence>
      {show &&
        (Comp ? (
          <Comp key="gallery" entrance={!usedShellRef.current} />
        ) : (
          <GalleryLoadingShell
            key="gallery-shell"
            region={region}
            isMobile={isMobile}
          />
        ))}
    </AnimatePresence>
  );
}
