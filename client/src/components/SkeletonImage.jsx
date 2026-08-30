import { useLayoutEffect, useRef, useState } from "react";

/**
 * Image with a shimmer skeleton placeholder. Reserves space when `aspectRatio` is set.
 *
 * @param {{
 *   src: string;
 *   srcSet?: string;
 *   sizes?: string;
 *   alt?: string;
 *   className?: string;
 *   wrapperClassName?: string;
 *   aspectRatio?: { w: number; h: number } | null;
 *   decoding?: "async" | "auto" | "sync";
 *   loading?: "eager" | "lazy";
 *   fetchPriority?: "high" | "low" | "auto";
 *   onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
 *   onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
 *   onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
 *   style?: React.CSSProperties;
 *   overlay?: React.ReactNode;
 * }} props
 */
export default function SkeletonImage({
  src,
  srcSet,
  sizes,
  alt = "",
  className = "",
  wrapperClassName = "w-full",
  aspectRatio = null,
  decoding = "async",
  loading,
  fetchPriority,
  onLoad,
  onError,
  onClick,
  style,
  overlay,
}) {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  // If this src is already decoded, stay solid. Do not set loaded to false on
  // src change — that blanks a photo that was already on screen.
  useLayoutEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  const wrapperStyle = aspectRatio
    ? { aspectRatio: `${aspectRatio.w} / ${aspectRatio.h}`, ...style }
    : style;

  return (
    <span
      className={`relative block overflow-hidden ${wrapperClassName}`}
      style={wrapperStyle}
    >
      {!loaded && (
        <span className="absolute inset-0 skeleton-shimmer" aria-hidden="true" />
      )}
      <img
        ref={imgRef}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        decoding={decoding}
        loading={loading}
        fetchPriority={fetchPriority}
        className={`block transition-opacity duration-300 ease-out ${
          loaded || !aspectRatio ? "opacity-100" : "opacity-0"
        } ${aspectRatio ? "h-full w-full" : "h-auto w-full"} ${className}`}
        onLoad={(e) => {
          if (e.currentTarget.naturalWidth === 0) {
            onError?.(e);
            return;
          }
          setLoaded(true);
          onLoad?.(e);
        }}
        onError={onError}
        onClick={onClick}
      />
      {overlay}
    </span>
  );
}
