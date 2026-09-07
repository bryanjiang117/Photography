/** Short side of a tray thumb. Matches Tailwind `h-14` / `w-14`. */
export const TRAY_THUMB_SHORT = "3.5rem";

/**
 * Landscape stays 56px tall and grows wide.
 * Portrait stays 56px wide and grows tall, so it isn’t a skinny strip.
 */
export function trayThumbSize(dim) {
  const short = TRAY_THUMB_SHORT;
  if (!dim?.w || !dim?.h) return { width: short, height: short };
  if (dim.w >= dim.h) {
    return {
      width: `calc(${short} * ${dim.w} / ${dim.h})`,
      height: short,
    };
  }
  return {
    width: short,
    height: `calc(${short} * ${dim.h} / ${dim.w})`,
  };
}
