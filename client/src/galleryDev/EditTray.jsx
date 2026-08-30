import { createPortal } from "react-dom";
import { galleryFullUrl } from "../galleryImages";
import { galleryDisplayUrl } from "../galleryPreview";

export default function EditTray({ region, unused, edit }) {
  return createPortal(
    <div
      data-drop='{"kind":"tray"}'
      className={`fixed bottom-0 left-32 right-[18rem] z-[200] border-t border-white/20 bg-black/75 px-6 py-3 backdrop-blur-sm ${
        edit.hover?.kind === "tray" && edit.drag ? "bg-white/10" : ""
      }`}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files?.length) edit.onImport(files);
      }}
    >
      <div className="flex w-full min-w-0 items-start gap-2">
        <label className="flex h-14 w-14 shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 border border-dashed border-white/40 text-white/80 hover:border-white/80 hover:text-white">
          <span className="text-[10px] tracking-wide [font-family:system-ui,sans-serif]">
            Import
          </span>
          {unused.length > 0 ? (
            <span className="text-[10px] text-white/55 [font-family:system-ui,sans-serif]">
              {unused.length}
            </span>
          ) : null}
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/tiff,image/heic,image/heif,.heic,.heif"
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              e.target.value = "";
              if (files?.length) edit.onImport(files);
            }}
          />
        </label>
        <div className="flex max-h-32 min-w-0 flex-1 flex-wrap content-start gap-2 overflow-y-auto scrollbar-hide">
          {unused.map((name) => (
            <div
              key={name}
              className="relative h-14 w-14 shrink-0 overflow-hidden border border-white/15 hover:border-white/50"
              onPointerDown={(e) =>
                edit.onPhotoPointerDown(e, { kind: "tray", name })
              }
            >
              <img
                src={galleryDisplayUrl(region, name, "sm")}
                alt={name}
                className="h-full w-full object-cover"
                draggable={false}
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.dataset.fallback === "full") return;
                  img.src = galleryFullUrl(region, name);
                  img.dataset.fallback = "full";
                }}
              />
              <span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-1 py-0.5 text-xs text-white [font-family:system-ui,sans-serif]">
                {name}
              </span>
              <button
                type="button"
                aria-label={`Delete ${name}`}
                className="absolute right-0 top-0 z-10 flex h-4 w-4 items-center justify-center bg-black/70 text-[11px] leading-none text-white/85 hover:bg-black hover:text-white"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  edit.onDeleteUnused(name);
                }}
              >
                ×
              </button>
            </div>
          ))}
          {unused.length === 0 ? (
            <p className="self-center text-xs tracking-wide text-white/70 [font-family:system-ui,sans-serif]">
              Unused photos land here
            </p>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
