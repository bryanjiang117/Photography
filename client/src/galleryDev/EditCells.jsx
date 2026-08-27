import { dropKey, isHover, samePath } from "./dropUtils";

const zoneBase = "absolute z-20 pointer-events-auto";

export function DropZone({ dest, hover, className = "" }) {
  const active = isHover(hover, dest);
  return (
    <div
      data-drop={dropKey(dest)}
      className={`${zoneBase} ${className} ${
        active ? "bg-white/25" : "bg-transparent"
      }`}
    />
  );
}

export function EditPhoto({ path, edit, children }) {
  const selected =
    edit.selected?.type === "photo" && samePath(edit.selected, path);
  const dragging =
    edit.drag?.source?.kind === "photo" && samePath(edit.drag.source, path);
  const photoDrag = edit.drag && edit.drag.source?.kind !== "row";
  const left = { kind: "insert-col", row: path.row, col: path.col };
  const right = { kind: "insert-col", row: path.row, col: path.col + 1 };
  const below = {
    kind: "stack-below",
    row: path.row,
    col: path.col,
    entry: path.entry ?? 0,
  };

  return (
    <div
      className={`relative min-w-0 w-full h-full ${selected ? "outline-solid outline-1 outline-white/80" : ""} ${
        dragging ? "opacity-35" : ""
      }`}
      onClick={(e) => {
        e.stopPropagation();
        if (edit.consumeClickSkip?.()) return;
        edit.onSelect({ type: "photo", ...path });
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        edit.onLightbox?.(path);
      }}
      onPointerDown={(e) => edit.onPhotoPointerDown(e, { kind: "photo", ...path })}
      onDragStart={(e) => e.preventDefault()}
    >
      {children}
      {photoDrag ? (
        <>
          <DropZone dest={left} hover={edit.hover} className="inset-y-0 left-0 w-1/4" />
          <DropZone dest={right} hover={edit.hover} className="inset-y-0 right-0 w-1/4" />
          <DropZone dest={below} hover={edit.hover} className="inset-x-[15%] bottom-0 h-1/3" />
        </>
      ) : null}
    </div>
  );
}

export function EditBlank({ path, edit }) {
  const selected =
    edit.selected?.type === "blank" && samePath(edit.selected, path);
  const dest =
    path.entry == null
      ? { kind: "fill-blank", row: path.row, col: path.col }
      : { kind: "fill-blank", row: path.row, col: path.col, entry: path.entry };
  const active = isHover(edit.hover, dest);
  return (
    <button
      type="button"
      data-drop={dropKey(dest)}
      className={`min-h-24 w-full min-w-0 border border-dashed ${
        active
          ? "border-white/80 bg-white/15"
          : selected
            ? "border-white/70 bg-white/10"
            : "border-white/25 bg-white/5"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        edit.onSelect({ type: "blank", ...path });
      }}
    >
      <span className="block text-center text-xs tracking-wide text-white/70 [font-family:system-ui,sans-serif]">
        blank
      </span>
    </button>
  );
}

export function EditGroup({ path, edit, children }) {
  const dest = { kind: "into-group", row: path.row, col: path.col, entry: path.entry };
  const active = isHover(edit.hover, dest);
  return (
    <div
      className={`relative flex gap-4 outline-solid outline-1 ${
        active ? "outline-white/70" : "outline-white/20"
      } outline-offset-2`}
      data-drop={edit.drag ? dropKey(dest) : undefined}
    >
      {children}
    </div>
  );
}

export function EditRow({ rowIndex, edit, children, style }) {
  const selected = edit.selected?.type === "row" && edit.selected.row === rowIndex;
  const draggingRow = edit.drag?.source?.kind === "row";
  const draggingThis = draggingRow && edit.drag.source.row === rowIndex;
  const last = rowIndex === (edit.items?.length ?? 0) - 1;
  const showBefore =
    draggingRow && edit.hover?.kind === "row" && edit.hover.row === rowIndex;
  const showAfter =
    draggingRow &&
    last &&
    edit.hover?.kind === "row" &&
    edit.hover.row === rowIndex + 1;
  return (
    <div
      data-edit-row=""
      data-row-index={rowIndex}
      className={`relative w-full shrink-0 ${selected ? "outline-solid outline-1 outline-white/35 outline-offset-8" : ""} ${
        draggingThis ? "opacity-35" : ""
      }`}
      style={style}
      onClick={(e) => {
        if (e.target === e.currentTarget) edit.onSelect({ type: "row", row: rowIndex });
      }}
    >
      {draggingRow ? (
        <>
          {showBefore ? (
            <div className="pointer-events-none absolute -top-1 left-0 right-0 z-30 h-0.5 bg-white" />
          ) : null}
          {showAfter ? (
            <div className="pointer-events-none absolute -bottom-1 left-0 right-0 z-30 h-0.5 bg-white" />
          ) : null}
        </>
      ) : edit.drag ? (
        <DropZone
          dest={{ kind: "new-row", row: rowIndex }}
          hover={edit.hover}
          className="-top-3 left-0 right-0 h-6"
        />
      ) : (
        <div
          role="separator"
          aria-label="Adjust space above row"
          className="absolute left-8 right-8 -top-3 z-20 h-3 cursor-ns-resize"
          onPointerDown={(e) => {
            e.stopPropagation();
            edit.onGapPointerDown?.(e, rowIndex);
          }}
        />
      )}
      <button
        type="button"
        aria-label="Reorder row"
        className="absolute -left-11 top-1/2 z-20 -translate-y-1/2 cursor-grab rounded-sm bg-black/40 px-1.5 py-2 text-white/90 hover:bg-black/55 hover:text-white active:cursor-grabbing"
        onPointerDown={(e) => {
          e.stopPropagation();
          edit.onPhotoPointerDown(e, { kind: "row", row: rowIndex });
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (edit.consumeClickSkip?.()) return;
          edit.onSelect({ type: "row", row: rowIndex });
        }}
      >
        <span className="block text-lg leading-none tracking-[0.35em] [font-family:system-ui,sans-serif]">
          ::
        </span>
      </button>
      <button
        type="button"
        aria-label="Add blank column"
        className="absolute -right-10 top-1/2 z-20 -translate-y-1/2 rounded-sm bg-black/40 px-2 py-1 text-2xl leading-none text-white/90 hover:bg-black/55 hover:text-white [font-family:system-ui,sans-serif]"
        onClick={(e) => {
          e.stopPropagation();
          edit.onAddBlank(rowIndex);
        }}
      >
        +
      </button>
      {children}
    </div>
  );
}

export function ColumnInsert({ row, col, edit, plus = true }) {
  if (edit.drag && edit.drag.source?.kind !== "row") {
    const dest = { kind: "insert-col", row, col };
    const active = isHover(edit.hover, dest);
    return (
      <div
        data-drop={dropKey(dest)}
        className={`w-3 shrink-0 self-stretch ${active ? "bg-white/40" : "bg-white/10"}`}
      />
    );
  }
  if (!plus) return null;
  return (
    <div className="relative w-2 shrink-0 self-stretch">
      {col > 0 ? (
        <div
          role="separator"
          aria-label="Resize columns"
          className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize"
          onPointerDown={(e) => {
            e.stopPropagation();
            edit.onFlexPointerDown?.(e, row, col - 1);
          }}
        />
      ) : null}
      <button
        type="button"
        aria-label="Insert blank"
        className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-base text-white/55 hover:text-white [font-family:system-ui,sans-serif]"
        onClick={(e) => {
          e.stopPropagation();
          edit.onInsertBlank(row, col);
        }}
      >
        +
      </button>
    </div>
  );
}
