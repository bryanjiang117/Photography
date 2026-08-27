/** Pure gallery-layout helpers for the local-dev editor. */

const ROW_KEYS = ["columns", "size", "flex", "fit", "gap", "location"];
const PHOTO_KEYS = ["name", "size", "location"];

export function parseEntry(entry) {
  if (typeof entry === "string" && entry) return { name: entry };
  if (
    entry &&
    typeof entry === "object" &&
    !Array.isArray(entry) &&
    typeof entry.name === "string" &&
    entry.name
  ) {
    return {
      name: entry.name,
      ...(entry.size ? { size: entry.size } : {}),
      ...(entry.location ? { location: entry.location } : {}),
    };
  }
  return null;
}

export function isEmptyCell(entry) {
  return Array.isArray(entry) && entry.length === 0;
}

export function isGroup(entry) {
  return Array.isArray(entry) && entry.length > 0;
}

export function slugify(filename) {
  const base = String(filename).replace(/\.[^.]+$/, "");
  const slug = base
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "photo";
}

export function uniqueSlug(name, existing) {
  const set = new Set(existing);
  if (!set.has(name)) return name;
  let n = 2;
  while (set.has(`${name}-${n}`)) n++;
  return `${name}-${n}`;
}

export function collectNames(items) {
  const names = [];
  for (const row of items) {
    for (const col of row.columns) {
      for (const entry of col) {
        if (isGroup(entry)) {
          for (const sub of entry) {
            const parsed = parseEntry(sub);
            if (parsed) names.push(parsed.name);
          }
        } else {
          const parsed = parseEntry(entry);
          if (parsed) names.push(parsed.name);
        }
      }
    }
  }
  return names;
}

function clone(items) {
  return structuredClone(items);
}

function asPhotoEntry(source, taken) {
  if (source.kind === "tray") return source.name;
  return taken;
}

function getAt(items, path) {
  const col = items[path.row].columns[path.col];
  if (path.sub != null) return col[path.entry][path.sub];
  if (path.entry != null) return col[path.entry];
  return col;
}

export function removeAt(items, path) {
  const next = clone(items);
  const col = next[path.row].columns[path.col];
  let taken;
  if (path.sub != null) {
    const group = col[path.entry];
    taken = group[path.sub];
    group.splice(path.sub, 1);
    if (group.length === 0) col[path.entry] = [];
  } else {
    taken = col[path.entry];
    col.splice(path.entry, 1);
  }
  if (next[path.row].columns[path.col].length === 0) {
    next[path.row].columns[path.col] = [];
  }
  return { items: next, entry: taken, name: parseEntry(taken)?.name ?? null };
}

function adjustDest(source, dest) {
  if (!source || source.kind !== "photo") return dest;
  if (dest.kind === "tray" || dest.kind === "new-row") return dest;
  const d = { ...dest };
  if (d.row === source.row && d.col === source.col) {
    if (
      d.entry != null &&
      source.entry != null &&
      source.sub == null &&
      d.entry > source.entry
    ) {
      d.entry -= 1;
    } else if (
      d.entry === source.entry &&
      d.sub != null &&
      source.sub != null &&
      d.sub > source.sub
    ) {
      d.sub -= 1;
    }
  }
  return d;
}

function spliceFlex(row, index, inserted) {
  if (!row.flex) return;
  if (inserted) row.flex.splice(index, 0, 1);
  else row.flex.splice(index, 1);
}

function insertEntry(items, dest, entry) {
  const next = clone(items);
  if (dest.kind === "new-row") {
    const row = { columns: [[entry]] };
    const at = dest.row == null ? next.length : dest.row;
    next.splice(at, 0, row);
    return next;
  }
  const row = next[dest.row];
  if (dest.kind === "insert-col") {
    row.columns.splice(dest.col, 0, [entry]);
    spliceFlex(row, dest.col, true);
    return next;
  }
  if (dest.kind === "fill-blank") {
    if (dest.entry == null) {
      row.columns[dest.col] = [entry];
    } else {
      if (row.columns[dest.col].length === 0) row.columns[dest.col] = [];
      row.columns[dest.col][dest.entry] = [entry];
    }
    return next;
  }
  if (dest.kind === "stack-below") {
    const col = row.columns[dest.col];
    col.splice(dest.entry + 1, 0, entry);
    return next;
  }
  if (dest.kind === "into-group") {
    const group = row.columns[dest.col][dest.entry];
    if (!Array.isArray(group)) {
      row.columns[dest.col][dest.entry] = [group, entry];
    } else {
      group.push(entry);
    }
    return next;
  }
  throw new Error(`unknown dest ${dest.kind}`);
}

export function applyDrop(items, { source, dest }) {
  if (dest.kind === "tray") {
    if (source.kind !== "photo") return clone(items);
    return removeAt(items, source).items;
  }
  let working = items;
  let entry;
  if (source.kind === "tray") {
    entry = asPhotoEntry(source);
  } else {
    const removed = removeAt(working, source);
    working = removed.items;
    entry = removed.entry;
    dest = adjustDest(source, dest);
  }
  return insertEntry(working, dest, entry);
}

export function deletePhoto(items, path) {
  return removeAt(items, path);
}

export function deleteRow(items, row) {
  const next = clone(items);
  next.splice(row, 1);
  return next;
}

export function moveRow(items, from, to) {
  const next = clone(items);
  const [row] = next.splice(from, 1);
  next.splice(to, 0, row);
  return next;
}

/** `insertBefore` is an index in the current list (use `items.length` to move to the end). */
export function moveRowTo(items, from, insertBefore) {
  let to = insertBefore;
  if (from < to) to -= 1;
  if (to === from || to < 0 || to >= items.length) return clone(items);
  return moveRow(items, from, to);
}

export function addBlankColumn(items, row, col) {
  const next = clone(items);
  next[row].columns.splice(col, 0, []);
  spliceFlex(next[row], col, true);
  return next;
}

export function addRow(items, at) {
  const next = clone(items);
  next.splice(at, 0, { columns: [[]] });
  return next;
}

export function deleteBlank(items, { row, col, entry }) {
  const next = clone(items);
  if (entry == null) {
    next[row].columns.splice(col, 1);
    spliceFlex(next[row], col, false);
    if (next[row].columns.length === 0) next[row].columns = [[]];
  } else {
    next[row].columns[col].splice(entry, 1);
    if (next[row].columns[col].length === 0) next[row].columns[col] = [];
  }
  return next;
}

export function setRowField(items, row, field, value) {
  const next = clone(items);
  if (value == null || value === "") delete next[row][field];
  else next[row][field] = value;
  return next;
}

function collapsePhoto(obj) {
  if (!obj.size && !obj.location) return obj.name;
  return obj;
}

export function setPhotoField(items, path, field, value) {
  const next = clone(items);
  const col = next[path.row].columns[path.col];
  const setOn = (current) => {
    const parsed = parseEntry(current);
    if (!parsed) return current;
    const obj = { name: parsed.name };
    if (parsed.size) obj.size = parsed.size;
    if (parsed.location) obj.location = parsed.location;
    if (value == null || value === "") delete obj[field];
    else obj[field] = value;
    return collapsePhoto(obj);
  };
  if (path.sub != null) col[path.entry][path.sub] = setOn(col[path.entry][path.sub]);
  else col[path.entry] = setOn(col[path.entry]);
  return next;
}

export function setColumnFlex(items, row, flex) {
  const next = clone(items);
  next[row].flex = flex;
  return next;
}

export function namesOnDiskMinusItems(diskNames, items, pendingDeletes = []) {
  const used = new Set(collectNames(items));
  const gone = new Set(pendingDeletes);
  return diskNames.filter((n) => !used.has(n) && !gone.has(n));
}

function objectKeys(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    if ("columns" in value) return ROW_KEYS.filter((k) => value[k] !== undefined);
    if ("name" in value) return PHOTO_KEYS.filter((k) => value[k] !== undefined);
  }
  return Object.keys(value);
}

function serializeValue(value, indent) {
  const pad = " ".repeat(indent);
  const next = indent + 2;
  const inner = " ".repeat(next);
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value == null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const compact = value.every(
      (v) =>
        v == null ||
        typeof v !== "object" ||
        (Array.isArray(v) && v.length === 0),
    );
    if (compact) {
      return `[${value.map((v) => serializeValue(v, next)).join(", ")}]`;
    }
    const parts = value.map((v) => `${inner}${serializeValue(v, next)}`);
    return `[\n${parts.join(",\n")},\n${pad}]`;
  }
  const keys = objectKeys(value);
  const parts = keys
    .map((k) => {
      if (value[k] === undefined) return null;
      return `${inner}${k}: ${serializeValue(value[k], next)}`;
    })
    .filter(Boolean);
  return `{\n${parts.join(",\n")},\n${pad}}`;
}

export function serializeItems(items) {
  return serializeValue(items, 0);
}

function skipLineComment(source, i) {
  while (i < source.length && source[i] !== "\n") i++;
  return i;
}

function matchBracket(source, openIndex) {
  let depth = 0;
  let inString = false;
  let quote = null;
  let escape = false;
  for (let i = openIndex; i < source.length; i++) {
    const ch = source[i];
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === quote) inString = false;
      continue;
    }
    if (ch === "/" && source[i + 1] === "/") {
      i = skipLineComment(source, i);
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = true;
      quote = ch;
      continue;
    }
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) return i;
    }
  }
  throw new Error("unbalanced array in data.js");
}

export function replaceItemsExport(source, exportName, items) {
  const needle = `export const ${exportName} =`;
  const start = source.indexOf(needle);
  if (start === -1) throw new Error(`missing export ${exportName}`);
  const bracket = source.indexOf("[", start + needle.length);
  if (bracket === -1) throw new Error(`missing array for ${exportName}`);
  const between = source.slice(start + needle.length, bracket);
  if (!/^\s*$/.test(between)) {
    throw new Error(`unexpected tokens before ${exportName} array`);
  }
  const end = matchBracket(source, bracket);
  return source.slice(0, bracket) + serializeItems(items) + source.slice(end + 1);
}

export { getAt };
