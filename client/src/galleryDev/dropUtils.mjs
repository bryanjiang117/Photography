export function samePath(a, b) {
  if (!a || !b) return false;
  return (
    a.row === b.row &&
    a.col === b.col &&
    a.entry === b.entry &&
    a.sub === b.sub
  );
}

export function dropKey(dest) {
  return JSON.stringify(dest);
}

export function isHover(hover, dest) {
  return hover && dropKey(hover) === dropKey(dest);
}

/** Selection after a press that did not become a drag. */
export function selectionFromDragSource(source, didDrag = false) {
  if (didDrag || !source) return null;
  if (source.kind === "row") return { type: "row", row: source.row };
  if (source.kind === "photo") {
    return {
      type: "photo",
      row: source.row,
      col: source.col,
      entry: source.entry,
      ...(source.sub != null ? { sub: source.sub } : {}),
    };
  }
  return null;
}
