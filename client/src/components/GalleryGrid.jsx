import { Fragment } from "react";
import GalleryImage from "./GalleryImage";
import VirtualGalleryRow from "./VirtualGalleryRow";
import { parseImageEntry, rowDefaultSize } from "../galleryImages";
import { galleryImgLoadProps } from "../galleryPrefetch";

/**
 * @param {{
 *   region: string;
 *   items: Array<{
 *     columns: unknown[][];
 *     size?: import('../galleryImages').GalleryImageSize;
 *     flex?: number[];
 *     fit?: string;
 *   }>;
 *   virtualize?: boolean;
 *   scrollRootRef?: React.RefObject<HTMLElement>;
 *   overscan?: string;
 * }} props
 */
export default function GalleryGrid({
  region,
  items,
  virtualize = false,
  scrollRootRef,
  overscan,
}) {
  // When virtualized, VirtualGalleryRow already gates mounting to near the
  // viewport (via overscan), so mounted rows should fetch/decode immediately
  // instead of deferring with native lazy loading.
  const loadPropsFor = (rowIndex, imageIndex) => {
    const props = galleryImgLoadProps(rowIndex, imageIndex);
    return virtualize ? { ...props, loading: "eager" } : props;
  };

  return items.map((row, i) => {
    const isFull =
      row.columns.length === 1 &&
      row.columns[0].length === 1 &&
      parseImageEntry(row.columns[0][0], rowDefaultSize(row));

    const key = isFull
      ? parseImageEntry(row.columns[0][0], rowDefaultSize(row)).name
      : i;

    const content = isFull ? (
      <GalleryImage
        region={region}
        entry={row.columns[0][0]}
        row={row}
        layout="full"
        loadProps={loadPropsFor(i)}
        wrapperClassName="w-full shrink-0"
      />
    ) : (
      <div className="w-full shrink-0 flex gap-4">
        {row.columns.map((col, j) => {
          const colClass = row.flex ? "min-w-0" : "flex-1 min-w-0";
          const colStyle = row.flex
            ? { flex: `${row.flex[j]} 1 0%` }
            : undefined;
          return col.length === 0 ? (
            <div key={j} className={colClass} style={colStyle} />
          ) : col.length === 1 && parseImageEntry(col[0], rowDefaultSize(row)) ? (
            <div
              key={parseImageEntry(col[0], rowDefaultSize(row)).name}
              className={`${colClass} flex`}
              style={colStyle}
            >
              <GalleryImage
                region={region}
                entry={col[0]}
                row={row}
                layout="grid"
                loadProps={loadPropsFor(i, j)}
                onLoad={
                  row.fit === "contain"
                    ? (e) => {
                        e.currentTarget.parentElement.parentElement.style.flex = `${e.currentTarget.naturalWidth / e.currentTarget.naturalHeight} 1 0%`;
                      }
                    : undefined
                }
                wrapperClassName="w-full"
                className="object-cover"
              />
            </div>
          ) : (
            <div
              key={j}
              className={`${colClass} flex flex-col gap-4`}
              style={colStyle}
            >
              {col.map((entry, k) =>
                Array.isArray(entry) ? (
                  entry.length === 0 ? (
                    <div key={k} className="flex-1" />
                  ) : (
                    <div key={k} className="flex gap-4">
                      {entry.map((img) => (
                        <GalleryImage
                          key={
                            parseImageEntry(img, rowDefaultSize(row))?.name ?? k
                          }
                          region={region}
                          entry={img}
                          row={row}
                          layout="grid"
                          loadProps={loadPropsFor(i, k)}
                          wrapperClassName="flex-1 min-w-0"
                          className="object-cover"
                        />
                      ))}
                    </div>
                  )
                ) : (
                  <GalleryImage
                    key={
                      parseImageEntry(entry, rowDefaultSize(row))?.name ?? k
                    }
                    region={region}
                    entry={entry}
                    row={row}
                    layout="grid"
                    loadProps={loadPropsFor(i, k)}
                    wrapperClassName="w-full"
                    className="object-cover"
                  />
                ),
              )}
            </div>
          );
        })}
      </div>
    );

    return virtualize ? (
      <VirtualGalleryRow key={key} rootRef={scrollRootRef} overscan={overscan}>
        {content}
      </VirtualGalleryRow>
    ) : (
      <Fragment key={key}>{content}</Fragment>
    );
  });
}
