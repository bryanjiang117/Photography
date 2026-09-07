/**
 * Flex to apply after a photo loads when `fit: "contain"`.
 * Explicit `flex` widths always win — contain only auto-sizes when widths are unset.
 * @returns {string | null}
 */
export function containFitFlex(row, naturalWidth, naturalHeight) {
  if (row?.fit !== "contain" || row.flex) return null;
  if (!naturalWidth || !naturalHeight) return null;
  return `${naturalWidth / naturalHeight} 1 0%`;
}
