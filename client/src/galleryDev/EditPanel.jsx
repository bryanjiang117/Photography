import { useEffect, useRef, useState } from "react";

const SIZES = ["", "sm", "md", "lg", "full"];

const fieldClass =
  "w-full bg-transparent border-0 border-b border-white/35 px-0 py-1.5 text-base text-white outline-none focus:border-white/80 placeholder:text-white/40 [font-family:system-ui,sans-serif]";
const labelClass =
  "block text-xs tracking-wide text-white/75 mb-1.5 [font-family:system-ui,sans-serif]";
const btnClass =
  "text-sm text-white/85 hover:text-white cursor-pointer bg-transparent border-0 p-0 [font-family:system-ui,sans-serif]";
const headingClass =
  "text-sm tracking-wide text-white/85 [font-family:system-ui,sans-serif]";

function FlexWidthInput({ value, onCommit, className }) {
  const [draft, setDraft] = useState(String(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setDraft(String(value));
  }, [value]);

  return (
    <input
      type="text"
      inputMode="decimal"
      className={className}
      value={draft}
      onFocus={() => {
        focused.current = true;
      }}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return;
        setDraft(raw);
        if (raw === "" || raw === ".") return;
        const n = Number(raw);
        if (Number.isFinite(n) && n > 0) onCommit(n);
      }}
      onBlur={() => {
        focused.current = false;
        const n = Number(draft);
        if (!Number.isFinite(n) || n <= 0) {
          setDraft(String(value));
          return;
        }
        onCommit(n);
        setDraft(String(n));
      }}
    />
  );
}

export default function EditPanel({ edit }) {
  const { selected, items } = edit;
  if (!selected) {
    return (
      <div className="flex h-full flex-col justify-end px-6 pb-6 text-white">
        <p className={headingClass}>
          Select a row or photo
        </p>
      </div>
    );
  }

  if (selected.type === "row") {
    const row = items[selected.row];
    if (!row) return null;
    const flex = row.flex ?? row.columns.map(() => 1);
    return (
      <div className="flex h-full flex-col gap-5 overflow-y-auto px-6 py-6 text-white scrollbar-hide">
        <p className={headingClass}>
          Row {selected.row + 1}
        </p>
        <label>
          <span className={labelClass}>Location</span>
          <input
            className={fieldClass}
            value={row.location ?? ""}
            onChange={(e) =>
              edit.setRowField(selected.row, "location", e.target.value)
            }
          />
        </label>
        <label>
          <span className={labelClass}>Size</span>
          <select
            className={`${fieldClass} cursor-pointer`}
            value={row.size ?? ""}
            onChange={(e) =>
              edit.setRowField(selected.row, "size", e.target.value)
            }
          >
            <option value="">default</option>
            {SIZES.filter(Boolean).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-white/90 [font-family:system-ui,sans-serif]">
          <input
            type="checkbox"
            checked={row.fit === "contain"}
            onChange={(e) =>
              edit.setRowField(
                selected.row,
                "fit",
                e.target.checked ? "contain" : "",
              )
            }
          />
          Fit contain
        </label>
        <label>
          <span className={labelClass}>Gap above ({row.gap ?? 20})</span>
          <input
            type="range"
            min={0}
            max={40}
            value={row.gap ?? 20}
            onChange={(e) =>
              edit.setRowField(selected.row, "gap", Number(e.target.value))
            }
            className="w-full accent-white"
          />
        </label>
        <div>
          <span className={labelClass}>Column widths</span>
          <div className="flex flex-col gap-2">
            {flex.map((n, i) => (
              <label key={i} className="flex items-center gap-2 text-sm text-white/80 [font-family:system-ui,sans-serif]">
                <span className="w-6">{i + 1}</span>
                <FlexWidthInput
                  value={n}
                  className={fieldClass}
                  onCommit={(width) => {
                    const next = [...flex];
                    next[i] = width;
                    edit.setFlex(selected.row, next);
                  }}
                />
              </label>
            ))}
          </div>
        </div>
        <div className="mt-auto flex flex-col items-start gap-3 pt-4">
          <button type="button" className={btnClass} onClick={() => edit.onAddBlank(selected.row)}>
            Add blank
          </button>
          <button
            type="button"
            className={btnClass}
            onClick={() => edit.onAddRow(selected.row + 1)}
          >
            Add row below
          </button>
          <button
            type="button"
            className={`${btnClass} disabled:opacity-30`}
            disabled={selected.row === 0}
            onClick={() => edit.onMoveRow(selected.row, -1)}
          >
            Move up
          </button>
          <button
            type="button"
            className={`${btnClass} disabled:opacity-30`}
            disabled={selected.row === items.length - 1}
            onClick={() => edit.onMoveRow(selected.row, 1)}
          >
            Move down
          </button>
          <button
            type="button"
            className={`${btnClass} text-red-300/80 hover:text-red-200`}
            onClick={() => edit.onDeleteRow(selected.row)}
          >
            Delete row
          </button>
        </div>
      </div>
    );
  }

  if (selected.type === "blank") {
    return (
      <div className="flex h-full flex-col gap-5 px-6 py-6 text-white">
        <p className={headingClass}>
          Blank
        </p>
        <p className="text-sm text-white/80 [font-family:system-ui,sans-serif]">
          Drop a photo here, or remove the space.
        </p>
        <button
          type="button"
          className={`${btnClass} text-red-300/80 hover:text-red-200`}
          onClick={() => edit.onDeleteBlank(selected)}
        >
          Remove blank
        </button>
      </div>
    );
  }

  if (selected.type === "photo") {
    const col = items[selected.row]?.columns?.[selected.col];
    const entry =
      selected.sub != null
        ? col?.[selected.entry]?.[selected.sub]
        : col?.[selected.entry];
    const parsed = entry && typeof entry === "object" && !Array.isArray(entry)
      ? entry
      : { name: typeof entry === "string" ? entry : "" };
    if (!parsed.name) return null;
    const confirming = edit.confirmDelete === parsed.name;
    return (
      <div className="flex h-full flex-col gap-5 overflow-y-auto px-6 py-6 text-white scrollbar-hide">
        <p className={`${headingClass} break-all`}>
          {parsed.name}
        </p>
        <label>
          <span className={labelClass}>Location override</span>
          <input
            className={fieldClass}
            placeholder="row location"
            value={parsed.location ?? ""}
            onChange={(e) =>
              edit.setPhotoField(selected, "location", e.target.value)
            }
          />
        </label>
        <label>
          <span className={labelClass}>Size override</span>
          <select
            className={`${fieldClass} cursor-pointer`}
            value={parsed.size ?? ""}
            onChange={(e) =>
              edit.setPhotoField(selected, "size", e.target.value)
            }
          >
            <option value="">row default</option>
            {SIZES.filter(Boolean).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-auto pt-4">
          {confirming ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-white/85 [font-family:system-ui,sans-serif]">
                Remove from the gallery. The original and AVIFs are deleted when
                you save.
              </p>
              <div className="flex gap-4">
                <button
                  type="button"
                  className={`${btnClass} text-red-300 hover:text-red-200`}
                  onClick={() => edit.onDeletePhoto(selected)}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className={btnClass}
                  onClick={() => edit.setConfirmDelete(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className={`${btnClass} text-red-300/80 hover:text-red-200`}
              onClick={() => edit.setConfirmDelete(parsed.name)}
            >
              Delete photo
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
