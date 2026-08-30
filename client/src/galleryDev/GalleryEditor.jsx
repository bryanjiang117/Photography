import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { flattenGalleryItems, galleryFullUrl } from "../galleryImages";
import {
  fetchPhotos,
  importPhoto,
  saveGallery,
  deleteUnusedPhoto,
  waitForVariants,
} from "./api";
import { setGalleryDimensionOverride } from "../galleryDimensions";
import {
  browserCanDisplayFile,
  clearGalleryPreviewUrl,
  galleryDevPreviewUrl,
  galleryDisplayUrl,
  getGalleryPreviewVersion,
  promotePreviewToFull,
  setGalleryPreviewUrl,
  subscribeGalleryPreview,
} from "../galleryPreview";
import {
  ColumnInsert,
  EditBlank,
  EditGroup,
  EditPhoto,
  EditRow,
} from "./EditCells";
import { selectionFromDragSource } from "./dropUtils.mjs";
import EditPanel from "./EditPanel";
import EditTray from "./EditTray";
import {
  addBlankColumn,
  addRow,
  applyDrop,
  collectNames,
  deleteBlank,
  deletePhoto,
  deleteRow,
  moveRow,
  moveRowTo,
  namesOnDiskMinusItems,
  parseEntry,
  setColumnFlex,
  setPhotoField,
  setRowField,
} from "./layout.mjs";

function snapshot(items) {
  return JSON.stringify(items);
}

function draftKey(region) {
  return `gallery-dev-draft:${region}`;
}

function readDraft(region) {
  try {
    const raw = sessionStorage.getItem(draftKey(region));
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data?.items)) return null;
    return {
      items: data.items,
      pendingDeletes: Array.isArray(data.pendingDeletes)
        ? data.pendingDeletes
        : [],
    };
  } catch {
    return null;
  }
}

function writeDraft(region, items, pendingDeletes) {
  try {
    sessionStorage.setItem(
      draftKey(region),
      JSON.stringify({ items, pendingDeletes }),
    );
  } catch {
    /* ignore quota / private mode */
  }
}

function clearDraft(region) {
  try {
    sessionStorage.removeItem(draftKey(region));
  } catch {
    /* ignore */
  }
}

function entryAt(items, path) {
  const col = items[path.row]?.columns?.[path.col];
  if (!col) return null;
  if (path.sub != null) return col[path.entry]?.[path.sub];
  return col[path.entry];
}

export default function GalleryEditor({
  region,
  sourceItems,
  photos: _sourcePhotos,
  onLightbox,
  children,
}) {
  const [editing, setEditing] = useState(false);
  const [items, setItems] = useState(
    () => readDraft(region)?.items ?? sourceItems,
  );
  const [diskNames, setDiskNames] = useState([]);
  const [pendingDeletes, setPendingDeletes] = useState(
    () => readDraft(region)?.pendingDeletes ?? [],
  );
  const [selected, setSelected] = useState(null);
  const [drag, setDrag] = useState(null);
  const [hover, setHover] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const dragRef = useRef(null);
  const hoverRef = useRef(null);
  const itemsRef = useRef(items);
  const pendingDeletesRef = useRef(pendingDeletes);
  const skipClickRef = useRef(false);
  const savedSnap = useRef(snapshot(sourceItems));
  itemsRef.current = items;
  pendingDeletesRef.current = pendingDeletes;
  hoverRef.current = hover;
  useSyncExternalStore(subscribeGalleryPreview, getGalleryPreviewVersion);

  useEffect(() => {
    const incoming = snapshot(sourceItems);
    if (incoming === savedSnap.current) return;
    const dirtyNow =
      snapshot(itemsRef.current) !== savedSnap.current ||
      pendingDeletesRef.current.length > 0;
    if (dirtyNow) return;
    setItems(sourceItems);
    savedSnap.current = incoming;
  }, [sourceItems]);

  useEffect(() => {
    const isDirty =
      snapshot(items) !== savedSnap.current || pendingDeletes.length > 0;
    if (isDirty) writeDraft(region, items, pendingDeletes);
    else clearDraft(region);
  }, [region, items, pendingDeletes]);

  useEffect(() => {
    const used = new Set(collectNames(itemsRef.current));
    setPendingDeletes((prev) => prev.filter((n) => used.has(n)));
  }, []);

  const dirty =
    snapshot(items) !== savedSnap.current || pendingDeletes.length > 0;

  const unused = useMemo(
    () => namesOnDiskMinusItems(diskNames, items, pendingDeletes),
    [diskNames, items, pendingDeletes],
  );

  const loadDisk = useCallback(async () => {
    try {
      const { names } = await fetchPhotos(region);
      setDiskNames(names);
      const used = new Set(collectNames(itemsRef.current));
      setPendingDeletes((prev) => prev.filter((n) => used.has(n)));
    } catch (err) {
      setError(err.message);
    }
  }, [region]);

  useEffect(() => {
    if (editing) loadDisk();
  }, [editing, loadDisk]);

  const onSelect = useCallback((sel) => {
    setSelected(sel);
    setConfirmDelete(null);
  }, []);

  const finishDrag = useCallback((dest) => {
    const source = dragRef.current?.source;
    dragRef.current = null;
    setDrag(null);
    setHover(null);
    if (!source || !dest) return;
    if (source.kind === "row") {
      const insertBefore =
        dest.kind === "row" || dest.kind === "new-row" ? dest.row : null;
      if (insertBefore == null) return;
      setItems((prev) => moveRowTo(prev, source.row, insertBefore));
      const to = source.row < insertBefore ? insertBefore - 1 : insertBefore;
      if (to !== source.row && to >= 0) {
        setSelected({ type: "row", row: to });
      }
      return;
    }
    setItems((prev) => applyDrop(prev, { source, dest }));
  }, []);

  const onPhotoPointerDown = useCallback(
    (e, source) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      const onMove = (ev) => {
        if (
          !dragRef.current &&
          Math.hypot(ev.clientX - startX, ev.clientY - startY) < 6
        ) {
          return;
        }
        if (!dragRef.current) dragRef.current = { source };
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        let nextHover = null;
        if (source.kind === "row") {
          const rowEl = el?.closest("[data-edit-row]");
          if (rowEl?.dataset.rowIndex != null) {
            const row = Number(rowEl.dataset.rowIndex);
            const rect = rowEl.getBoundingClientRect();
            const insertAt =
              ev.clientY > rect.top + rect.height / 2 ? row + 1 : row;
            nextHover = { kind: "row", row: insertAt };
          } else {
            const zone = el?.closest("[data-drop]");
            if (zone) {
              try {
                const dest = JSON.parse(zone.getAttribute("data-drop"));
                if (dest.kind === "new-row") {
                  nextHover = { kind: "row", row: dest.row };
                }
              } catch {
                nextHover = null;
              }
            }
          }
        } else {
          const zone = el?.closest("[data-drop]");
          if (zone) {
            try {
              nextHover = JSON.parse(zone.getAttribute("data-drop"));
            } catch {
              nextHover = null;
            }
          }
        }
        hoverRef.current = nextHover;
        setHover(nextHover);
        const name =
          source.kind === "tray"
            ? source.name
            : source.kind === "photo"
              ? parseEntry(entryAt(itemsRef.current, source))?.name
              : null;
        setDrag({ source, x: ev.clientX, y: ev.clientY, name });
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        const didDrag = Boolean(dragRef.current);
        if (didDrag) {
          skipClickRef.current = true;
          finishDrag(hoverRef.current);
          return;
        }
        const sel = selectionFromDragSource(source);
        if (sel) onSelect(sel);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp, { once: true });
    },
    [finishDrag, onSelect],
  );

  const liveItems = items;

  const edit = {
    editing,
    items: liveItems,
    photos: flattenGalleryItems(items),
    dirty,
    unused,
    selected,
    drag,
    hover,
    status,
    error,
    busy,
    confirmDelete,
    setConfirmDelete,
    region,
    onSelect,
    onPhotoPointerDown,
    setRowField: (row, field, value) =>
      setItems((prev) => setRowField(prev, row, field, value)),
    setPhotoField: (path, field, value) =>
      setItems((prev) => setPhotoField(prev, path, field, value)),
    setFlex: (row, flex) => setItems((prev) => setColumnFlex(prev, row, flex)),
    onAddBlank: (row) => {
      setItems((prev) => addBlankColumn(prev, row, prev[row].columns.length));
    },
    onInsertBlank: (row, col) => {
      setItems((prev) => addBlankColumn(prev, row, col));
    },
    onAddRow: (at) => {
      setItems((prev) => addRow(prev, at));
      setSelected({ type: "row", row: at });
    },
    onDeleteRow: (row) => {
      setItems((prev) => deleteRow(prev, row));
      setSelected(null);
    },
    onMoveRow: (from, dir) => {
      const to = from + dir;
      if (to < 0 || to >= items.length) return;
      setItems((prev) => moveRow(prev, from, to));
      setSelected({ type: "row", row: to });
    },
    onDeleteBlank: (path) => {
      setItems((prev) => deleteBlank(prev, path));
      setSelected({ type: "row", row: path.row });
    },
    onDeletePhoto: (path) => {
      const { items: next, name } = deletePhoto(items, path);
      if (name) setPendingDeletes((prev) => [...prev, name]);
      setItems(next);
      setSelected(null);
      setConfirmDelete(null);
    },
    onDeleteUnused: async (name) => {
      setBusy(true);
      setError("");
      try {
        await deleteUnusedPhoto(region, name);
        clearGalleryPreviewUrl(region, name);
        setDiskNames((prev) => prev.filter((n) => n !== name));
        setPendingDeletes((prev) => prev.filter((n) => n !== name));
      } catch (err) {
        setError(err.message);
      } finally {
        setBusy(false);
      }
    },
    onImport: async (fileOrFiles) => {
      const files = [...(fileOrFiles?.length != null ? fileOrFiles : [fileOrFiles])].filter(
        (f) => f instanceof File,
      );
      if (files.length === 0) return;
      setBusy(true);
      setError("");
      const added = [];
      const failures = [];
      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setStatus(
            files.length === 1
              ? `Importing ${file.name}…`
              : `Importing ${i + 1}/${files.length} ${file.name}…`,
          );
          try {
            const result = await importPhoto(region, file);
            added.push(result.name);
            setGalleryDimensionOverride(region, result.name, result);
            const preview = browserCanDisplayFile(file)
              ? URL.createObjectURL(file)
              : galleryDevPreviewUrl(region, result.name);
            setGalleryPreviewUrl(region, result.name, preview);
            setPendingDeletes((prev) => prev.filter((n) => n !== result.name));
            setDiskNames((prev) => [
              result.name,
              ...prev.filter((n) => n !== result.name),
            ]);
            setStatus(`${result.name} ready — drag it onto the grid`);
            void waitForVariants(region, result.name)
              .then(() => promotePreviewToFull(region, result.name))
              .catch((err) => {
                console.warn("gallery-dev variants:", err.message);
              });
          } catch (err) {
            failures.push(`${file.name}: ${err.message}`);
          }
        }
        if (added.length && !failures.length) {
          setStatus(
            added.length === 1
              ? `${added[0]} ready — drag it onto the grid`
              : `${added.length} photos ready — drag them onto the grid`,
          );
        } else if (added.length && failures.length) {
          setStatus(`${added.length} imported, ${failures.length} failed`);
          setError(failures.join(" · "));
        } else {
          setStatus("");
          setError(failures.join(" · "));
        }
      } finally {
        setBusy(false);
      }
    },
    onSave: async () => {
      setBusy(true);
      setError("");
      setStatus("Saving…");
      try {
        await saveGallery(region, items, pendingDeletes);
        savedSnap.current = snapshot(items);
        setPendingDeletes([]);
        setStatus("Saved");
        await loadDisk();
      } catch (err) {
        setError(err.message);
        setStatus("");
      } finally {
        setBusy(false);
      }
    },
    onDiscard: () => {
      clearDraft(region);
      setItems(sourceItems);
      setPendingDeletes([]);
      savedSnap.current = snapshot(sourceItems);
      setSelected(null);
      setError("");
      setStatus("");
    },
    setEditing,
    consumeClickSkip: () => {
      if (!skipClickRef.current) return false;
      skipClickRef.current = false;
      return true;
    },
    onFlexPointerDown: (e, rowIndex, leftCol) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const root = e.currentTarget.closest("[data-edit-row]");
      const cols = root ? [...root.querySelectorAll("[data-gallery-col]")] : [];
      const a = cols[leftCol];
      const b = cols[leftCol + 1];
      if (!a || !b) return;
      const startA = a.getBoundingClientRect().width;
      const startB = b.getBoundingClientRect().width;
      const startX = e.clientX;
      const startFlex =
        itemsRef.current[rowIndex].flex ??
        itemsRef.current[rowIndex].columns.map(() => 1);
      const pair = (startFlex[leftCol] ?? 1) + (startFlex[leftCol + 1] ?? 1);
      const onMove = (ev) => {
        const totalW = startA + startB;
        if (totalW <= 0) return;
        const ratio = Math.min(
          0.9,
          Math.max(0.1, (startA + (ev.clientX - startX)) / totalW),
        );
        const next = [...startFlex];
        next[leftCol] = Math.round(ratio * pair * 10) / 10;
        next[leftCol + 1] = Math.round((pair - next[leftCol]) * 10) / 10;
        setItems((prev) => setColumnFlex(prev, rowIndex, next));
      };
      const onUp = () => window.removeEventListener("pointermove", onMove);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp, { once: true });
    },
    onGapPointerDown: (e, rowIndex) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const startY = e.clientY;
      const startGap = itemsRef.current[rowIndex].gap ?? 20;
      const onMove = (ev) => {
        const gap = Math.min(
          40,
          Math.max(0, Math.round(startGap + (ev.clientY - startY) / 4)),
        );
        setItems((prev) => setRowField(prev, rowIndex, "gap", gap));
      };
      const onUp = () => window.removeEventListener("pointermove", onMove);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp, { once: true });
    },
  };

  edit.grid = editing
    ? {
        Photo: EditPhoto,
        Blank: EditBlank,
        Group: EditGroup,
        Row: EditRow,
        ColumnInsert,
        selected,
        drag,
        hover,
        items: liveItems,
        onSelect,
        onPhotoPointerDown,
        onAddBlank: edit.onAddBlank,
        onInsertBlank: edit.onInsertBlank,
        onFlexPointerDown: edit.onFlexPointerDown,
        onGapPointerDown: edit.onGapPointerDown,
        consumeClickSkip: edit.consumeClickSkip,
        onLightbox: (path) => {
          const parsed = parseEntry(entryAt(items, path));
          if (parsed) onLightbox?.(parsed.name);
        },
      }
    : null;

  edit.panel = editing ? <EditPanel edit={edit} /> : null;
  edit.tray = editing ? (
    <EditTray region={region} unused={unused} edit={edit} />
  ) : null;

  return (
    <>
      {children(edit)}
      {editing && drag?.name
        ? createPortal(
            <img
              src={galleryDisplayUrl(region, drag.name, "sm")}
              alt=""
              className="pointer-events-none fixed z-[300] h-16 w-16 object-cover opacity-80"
              style={{ left: drag.x + 12, top: drag.y + 12 }}
              onError={(e) => {
                e.currentTarget.src = galleryFullUrl(region, drag.name);
              }}
            />,
            document.body,
          )
        : null}
    </>
  );
}

export function EditToggle({
  editing,
  dirty,
  busy,
  status,
  error,
  onToggle,
  onSave,
  onDiscard,
}) {
  return (
    <div className="flex flex-col items-start gap-2 [font-family:system-ui,sans-serif]">
      <button
        type="button"
        onClick={onToggle}
        className="text-sm tracking-wide text-white/90 hover:text-white cursor-pointer bg-transparent border-0 p-0"
      >
        {editing ? "Done" : "Edit"}
      </button>
      {editing || dirty ? (
        <div className="flex flex-col items-start gap-1.5">
          <button
            type="button"
            disabled={!dirty || busy}
            onClick={onSave}
            className="text-sm tracking-wide text-white/90 hover:text-white disabled:opacity-30 cursor-pointer bg-transparent border-0 p-0"
          >
            Save
          </button>
          <button
            type="button"
            disabled={!dirty || busy}
            onClick={onDiscard}
            className="text-sm tracking-wide text-white/75 hover:text-white disabled:opacity-30 cursor-pointer bg-transparent border-0 p-0"
          >
            Discard
          </button>
          {status ? (
            <span className="max-w-[9rem] text-xs leading-snug text-white/75">
              {status}
            </span>
          ) : null}
          {error ? (
            <span className="max-w-[9rem] text-xs leading-snug text-red-200">
              {error}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
