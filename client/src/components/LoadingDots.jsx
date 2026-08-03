/**
 * Centers the word "loading" in the nearest `relative` ancestor.
 * Ellipsis is out of flow so it doesn't shift the center point.
 */
export default function LoadingDots({ className = "" }) {
  return (
    <div
      className={`absolute inset-0 z-10 flex items-center justify-center pointer-events-none ${className}`.trim()}
      aria-live="polite"
    >
      <span className="relative text-xl bodoni-small text-black tracking-wide">
        loading
        <span
          className="loading-dots absolute top-0 left-full"
          aria-hidden="true"
        />
      </span>
    </div>
  );
}
