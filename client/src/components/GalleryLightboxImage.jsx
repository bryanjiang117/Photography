import { useLayoutEffect, useRef, useState } from "react";
import { galleryDisplayUrl } from "../galleryPreview";
import { galleryFullUrl, gallerySrcFallbackToFull } from "../galleryImages";
import { photoDimensions } from "../galleryDimensions";

/** Matches lightbox overlay `p-8` (2rem × 2). */
const PAD = "4rem";

/** Survives remounts so peeked slides don't skeleton-flash when they become current. */
const decodedSrcs = new Set();

/**
 * Explicit width + height from viewport — never depends on % of a flex parent.
 * Width fills to lightbox padding (`p-8` → 4rem total).
 * @param {{ w: number; h: number } | null} dims
 * @param {string} maxHeight
 */
function frameStyle(dims, maxHeight) {
  if (!dims) {
    return {
      width: `calc(100vw - ${PAD})`,
      height: maxHeight,
      minWidth: "16rem",
      minHeight: "16rem",
    };
  }
  const { w, h } = dims;
  return {
    width: `min(calc(100vw - ${PAD}), calc((${maxHeight}) * ${w} / ${h}))`,
    height: `min(${maxHeight}, calc((100vw - ${PAD}) * ${h} / ${w}))`,
  };
}

/**
 * Lightbox image using the `lg` tier.
 * On name change, shows a skeleton immediately (sized to the incoming photo)
 * until the new image is loaded + decoded — never keeps the previous frame.
 */
export default function GalleryLightboxImage({
  region,
  name,
  onClick,
  maxHeight = "calc(100vh - 4rem)",
}) {
  const preferred = galleryDisplayUrl(region, name, "lg");
  const fullSrc = galleryFullUrl(region, name);
  const [failedSrc, setFailedSrc] = useState(null);
  const src =
    failedSrc === preferred
      ? gallerySrcFallbackToFull(region, name, preferred)
      : preferred;
  const dimensions = photoDimensions(region, name);
  const requestIdRef = useRef(0);

  const [request, setRequest] = useState({
    id: 0,
    src,
    dimensions,
  });
  if (request.src !== src || request.dimensions !== dimensions) {
    requestIdRef.current += 1;
    setRequest({ id: requestIdRef.current, src, dimensions });
  }

  /** Decoded src currently painted; null / mismatch → skeleton. */
  const [paintSrc, setPaintSrc] = useState(
    /** @type {string | null} */ (decodedSrcs.has(src) ? src : null),
  );
  if (paintSrc !== null && paintSrc !== request.src) {
    setPaintSrc(decodedSrcs.has(request.src) ? request.src : null);
  }
  const ready = paintSrc === request.src;
  const loading = !ready;

  useLayoutEffect(() => {
    const id = request.id;
    const nextSrc = request.src;
    if (decodedSrcs.has(nextSrc)) {
      setPaintSrc(nextSrc);
      return;
    }
    let cancelled = false;
    /** @type {HTMLImageElement | null} */
    let preloader = null;

    preloader = new Image();
    preloader.decoding = "async";

    const commit = () => {
      if (cancelled || id !== requestIdRef.current) return;
      decodedSrcs.add(nextSrc);
      setPaintSrc(nextSrc);
    };

    const afterLoad = () => {
      if (cancelled || id !== requestIdRef.current) return;
      if (typeof preloader.decode === "function") {
        preloader.decode().then(commit).catch(commit);
      } else {
        commit();
      }
    };

    preloader.onload = afterLoad;
    preloader.onerror = () => {
      if (nextSrc !== fullSrc) {
        setFailedSrc(nextSrc);
        return;
      }
      commit();
    };
    preloader.src = nextSrc;
    if (preloader.complete && preloader.naturalWidth > 0) {
      afterLoad();
    }

    return () => {
      cancelled = true;
      if (preloader) {
        preloader.onload = null;
        preloader.onerror = null;
      }
    };
  }, [request]);

  const box = frameStyle(request.dimensions, maxHeight);

  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={box}
      onClick={onClick}
      aria-busy={loading}
      data-lightbox-content
    >
      {loading ? (
        <div className="absolute inset-0 lightbox-shimmer" aria-hidden="true" />
      ) : null}
      {ready ? (
        <img
          src={paintSrc}
          alt=""
          width={request.dimensions?.w}
          height={request.dimensions?.h}
          decoding="sync"
          className="absolute inset-0 h-full w-full object-contain"
          draggable={false}
        />
      ) : null}
    </div>
  );
}
