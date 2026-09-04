import { useState } from "react";
import { motion } from "motion/react";
import GalleryGrid from "./GalleryGrid";
import GalleryLightbox from "./GalleryLightbox";
import { useGalleryScrollWarm } from "../hooks/useGalleryScrollWarm";
import { galleryFadeMotion, gallerySlideMotion } from "../galleryMotion";
import GalleryEditor, { EditToggle } from "../galleryDev/GalleryEditor";

function DesktopGalleryView({
  region,
  items,
  photos,
  titleZh,
  titleEn,
  titleLang = "zh-CN",
  onBack,
  bgClass,
  chromeClass = "text-white",
  titleClass = "",
  backButtonClass = "self-start text-white/65 cursor-pointer hover:text-white/90 transition-colors duration-200 p-3 -m-3",
  virtualize = false,
  overscan,
  entrance = true,
  slide = true,
  edit,
  activeImage,
  setActiveImage,
}) {
  const scrollRef = useGalleryScrollWarm();
  const editing = Boolean(edit?.editing);
  const gridCols = editing
    ? "grid-cols-[8rem_minmax(0,1fr)_18rem]"
    : "grid-cols-[8rem_minmax(0,1fr)_8rem]";

  return (
    <motion.div
      {...gallerySlideMotion(entrance && slide, "y")}
      ref={scrollRef}
      className={`fixed inset-0 z-50 overflow-y-auto overflow-x-hidden scroll-py-12 ${bgClass} min-w-[1200px] min-h-[800px] scrollbar-hide`}
    >
      <div className={`grid min-h-full ${gridCols}`}>
        <div
          className={`sticky top-0 self-start h-dvh flex flex-col justify-between px-8 pt-6 pb-6 ${chromeClass}`}
        >
          <motion.div
            {...galleryFadeMotion(entrance)}
            className="flex flex-col items-start"
          >
            <div
              className={`-translate-x-1 font-tsm text-[8rem] leading-none [writing-mode:vertical-rl] ${titleClass}`}
              lang={titleLang}
              translate="no"
            >
              {titleZh}
            </div>
            <span className="bodoni-small mt-4 text-lg uppercase tracking-widest opacity-60 [writing-mode:vertical-rl]">
              {titleEn}
            </span>
          </motion.div>

          <div className="flex flex-col items-start gap-8">
            {import.meta.env.DEV && edit ? (
              <EditToggle
                editing={edit.editing}
                dirty={edit.dirty}
                busy={edit.busy}
                status={edit.status}
                error={edit.error}
                onToggle={() => edit.setEditing((v) => !v)}
                onSave={edit.onSave}
                onDiscard={edit.onDiscard}
              />
            ) : null}
            <motion.button
              {...galleryFadeMotion(entrance, 0.42)}
              onClick={onBack}
              aria-label="Back"
              className={backButtonClass}
            >
              <span className="block text-xl leading-none">←</span>
            </motion.button>
          </div>
        </div>

        <div
          className={`min-w-0 flex flex-col items-center gap-20 py-16 ${
            editing ? "px-24 pb-36" : "px-40"
          }`}
        >
          <GalleryGrid
            region={region}
            items={items}
            virtualize={virtualize && !editing}
            scrollRootRef={scrollRef}
            overscan={overscan}
            onImageClick={editing ? undefined : setActiveImage}
            edit={edit?.grid}
          />
          {editing && edit.drag ? (
            <div
              data-drop={JSON.stringify({
                kind: "new-row",
                row: items.length,
              })}
              className={`h-20 w-full border border-dashed ${
                (edit.hover?.kind === "new-row" &&
                  edit.hover?.row === items.length) ||
                (edit.hover?.kind === "row" && edit.hover?.row === items.length)
                  ? "border-white/70 bg-white/10"
                  : "border-white/20"
              }`}
            >
              <span className="block pt-6 text-center text-xs tracking-wide text-white/70 [font-family:system-ui,sans-serif]">
                New row
              </span>
            </div>
          ) : null}
        </div>

        {editing && edit.panel ? (
          <div className="sticky top-0 self-start h-dvh border-l border-white/10 bg-black/35">
            {edit.panel}
          </div>
        ) : (
          <motion.div
            {...galleryFadeMotion(entrance, 0.42)}
            className={`sticky top-0 self-start h-dvh flex flex-col items-end justify-end px-10 pb-6 ${chromeClass}`}
          >
            <div className="text-lg tracking-widest bodoni-small opacity-60 [writing-mode:vertical-rl]">
              PHOTOGRAPHY
            </div>
            <div
              className={`mt-4 translate-x-1 font-tsm text-[8rem] leading-none [writing-mode:vertical-rl] ${titleClass}`}
              lang="zh-CN"
              translate="no"
            >
              摄影
            </div>
          </motion.div>
        )}
      </div>

      {edit?.tray}

      <GalleryLightbox
        region={region}
        photos={photos}
        activeName={activeImage}
        onClose={() => setActiveImage(null)}
        onChange={setActiveImage}
      />
    </motion.div>
  );
}

export default function DesktopGallery({
  region,
  items: sourceItems,
  photos: sourcePhotos,
  ...rest
}) {
  const [activeImage, setActiveImage] = useState(null);
  const view = (edit) => (
    <DesktopGalleryView
      region={region}
      items={edit?.items ?? sourceItems}
      photos={edit?.photos ?? sourcePhotos}
      edit={edit}
      activeImage={activeImage}
      setActiveImage={setActiveImage}
      {...rest}
    />
  );

  if (import.meta.env.DEV) {
    return (
      <GalleryEditor
        region={region}
        sourceItems={sourceItems}
        photos={sourcePhotos}
        onLightbox={setActiveImage}
      >
        {view}
      </GalleryEditor>
    );
  }

  return view(null);
}
