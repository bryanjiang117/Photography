import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  getResolvedGallery,
  loadGalleryChunk,
} from "./galleryChunkPrefetch";
import { gallerySlideMotion } from "./galleryMotion";

const REGION_BG = {
  china: "bg-china-primary",
  mexico: "bg-mexico-primary",
  canada: "bg-canada-primary",
  japan: "bg-japan-primary",
};

function GallerySlideShell({ region, isMobile }) {
  const axis = isMobile ? "x" : "y";
  return (
    <motion.div
      {...gallerySlideMotion(true, axis)}
      className={`fixed inset-0 z-50 ${REGION_BG[region] ?? "bg-background"}`}
    />
  );
}

/**
 * Mounts a gallery overlay immediately on open. If the JS chunk is not ready yet,
 * a colored slide-in shell appears while the chunk loads in the background.
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
          <GallerySlideShell
            key="gallery-shell"
            region={region}
            isMobile={isMobile}
          />
        ))}
    </AnimatePresence>
  );
}
