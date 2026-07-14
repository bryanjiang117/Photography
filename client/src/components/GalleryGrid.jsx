import { Fragment } from "react";
import GalleryImage from "./GalleryImage";
import VirtualGalleryRow from "./VirtualGalleryRow";
import { galleryPhotoDimensions } from "../constants/galleryAspectRatios";
import { parseImageEntry, rowDefaultSize } from "../galleryImages";
import { galleryImgLoadProps } from "../galleryPrefetch";

function GallerySkeletonCell({
  region,
  entry,
  row,
  wrapperClassName,
  shimmer = true,
}) {
  const rowSize = row ? rowDefaultSize(row) : "md";
  const parsed = parseImageEntry(entry, rowSize, row.location);
  if (!parsed) {
    return <div className={wrapperClassName} aria-hidden="true" />;
  }
  const aspectRatio = galleryPhotoDimensions(region, parsed.name);
  const style = aspectRatio
    ? { aspectRatio: `${aspectRatio.w} / ${aspectRatio.h}` }
    : undefined;
  return (
    <span
      className={`relative block overflow-hidden ${
        shimmer ? "skeleton-shimmer" : ""
      } ${wrapperClassName}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * @param {{
 *   region: string;
 *   items: Array<{
 *     columns: unknown[][];
 *     size?: import('../galleryImages').GalleryImageSize;
 *     flex?: number[];
 *     fit?: string;
 *     gap?: number;
 *   }>;
 *   virtualize?: boolean;
 *   scrollRootRef?: React.RefObject<HTMLElement>;
 *   overscan?: string;
 *   skeleton?: boolean;
 * }} props
 */
export default function GalleryGrid({
  region,
  items,
  virtualize = false,
  scrollRootRef,
  overscan,
  skeleton = false,
}) {
  // When virtualized, VirtualGalleryRow already gates mounting to near the
  // viewport (via overscan), so mounted rows should fetch/decode immediately
  // instead of deferring with native lazy loading.
  const loadPropsFor = (rowIndex, imageIndex) => {
    const props = galleryImgLoadProps(rowIndex, imageIndex);
    return virtualize ? { ...props, loading: "eager" } : props;
  };

  // Rows sit in a `gap-20` (5rem) flex column. `row.gap` (same Tailwind spacing
  // scale) overrides the space ABOVE the row via a compensating margin-top:
  // gap-20 → 0, gap-8 → -3rem (tighter), gap-24 → +1rem (looser).
  const DEFAULT_ROW_GAP = 20;
  const rowGapStyle = (row) =>
    typeof row.gap === "number"
      ? { marginTop: `${(row.gap - DEFAULT_ROW_GAP) * 0.25}rem` }
      : undefined;

  return items.map((row, i) => {
    const isFull =
      row.columns.length === 1 &&
      row.columns[0].length === 1 &&
      parseImageEntry(row.columns[0][0], rowDefaultSize(row), row.location);

    const key = isFull
      ? parseImageEntry(row.columns[0][0], rowDefaultSize(row), row.location).name
      : i;

    const renderRow = (asSkeleton, { shimmer = true } = {}) => {
      if (isFull) {
        return asSkeleton ? (
          <GallerySkeletonCell
            region={region}
            entry={row.columns[0][0]}
            row={row}
            wrapperClassName="w-full shrink-0"
            shimmer={shimmer}
          />
        ) : (
          <GalleryImage
            region={region}
            entry={row.columns[0][0]}
            row={row}
            layout="full"
            loadProps={loadPropsFor(i)}
            wrapperClassName="w-full shrink-0"
          />
        );
      }

      return (
        <div className="w-full shrink-0 flex gap-4">
          {row.columns.map((col, j) => {
            const colClass = row.flex ? "min-w-0" : "flex-1 min-w-0";
            const colStyle = row.flex
              ? { flex: `${row.flex[j]} 1 0%` }
              : undefined;
            return col.length === 0 ? (
              <div key={j} className={colClass} style={colStyle} />
            ) : col.length === 1 &&
              parseImageEntry(col[0], rowDefaultSize(row), row.location) ? (
              <div
                key={
                  parseImageEntry(col[0], rowDefaultSize(row), row.location).name
                }
                className={`${colClass} flex`}
                style={colStyle}
              >
                {asSkeleton ? (
                  <GallerySkeletonCell
                    region={region}
                    entry={col[0]}
                    row={row}
                    wrapperClassName="w-full"
                    shimmer={shimmer}
                  />
                ) : (
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
                )}
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
                        {entry.map((img) =>
                          asSkeleton ? (
                            <GallerySkeletonCell
                              key={
                                parseImageEntry(img, rowDefaultSize(row))
                                  ?.name ?? k
                              }
                              region={region}
                              entry={img}
                              row={row}
                              wrapperClassName="flex-1 min-w-0"
                              shimmer={shimmer}
                            />
                          ) : (
                            <GalleryImage
                              key={
                                parseImageEntry(img, rowDefaultSize(row))
                                  ?.name ?? k
                              }
                              region={region}
                              entry={img}
                              row={row}
                              layout="grid"
                              loadProps={loadPropsFor(i, k)}
                              wrapperClassName="flex-1 min-w-0"
                              className="object-cover"
                            />
                          ),
                        )}
                      </div>
                    )
                  ) : asSkeleton ? (
                    <GallerySkeletonCell
                      key={
                        parseImageEntry(entry, rowDefaultSize(row))?.name ?? k
                      }
                      region={region}
                      entry={entry}
                      row={row}
                      wrapperClassName="w-full"
                      shimmer={shimmer}
                    />
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
    };

    const content = renderRow(skeleton);
    const rowStyle = rowGapStyle(row);

    return virtualize ? (
      <VirtualGalleryRow
        key={key}
        rootRef={scrollRootRef}
        overscan={overscan}
        style={rowStyle}
        fallback={renderRow(true, { shimmer: false })}
      >
        {content}
      </VirtualGalleryRow>
    ) : rowStyle ? (
      <div key={key} className="w-full shrink-0" style={rowStyle}>
        {content}
      </div>
    ) : (
      <Fragment key={key}>{content}</Fragment>
    );
  });
}
