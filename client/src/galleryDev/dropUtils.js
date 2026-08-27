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
