import { Fragment } from "react";
import GalleryImage from "./GalleryImage";
import VirtualGalleryRow from "./VirtualGalleryRow";
import { photoDimensions } from "../galleryDimensions";
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
  const aspectRatio = photoDimensions(region, parsed.name);
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

function wrapPhoto(edit, path, node) {
  if (!edit?.Photo) return node;
  const Photo = edit.Photo;
  return (
    <Photo path={path} edit={edit}>
      {node}
    </Photo>
  );
}

function wrapGroup(edit, path, node) {
  if (!edit?.Group) return node;
  const Group = edit.Group;
  return (
    <Group path={path} edit={edit}>
      {node}
    </Group>
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
 *   onImageClick?: (name: string) => void;
 *   edit?: object | null;
 * }} props
 */
export default function GalleryGrid({
  region,
  items,
  virtualize = false,
  scrollRootRef,
  overscan,
  skeleton = false,
  onImageClick,
  edit = null,
}) {
  const loadPropsFor = (rowIndex, imageIndex) => {
    const props = galleryImgLoadProps(rowIndex, imageIndex);
    return virtualize ? { ...props, loading: "eager" } : props;
  };

  const clickProps = (entry, row, baseClassName = "") => {
    if (!onImageClick || edit) {
      return baseClassName ? { className: baseClassName } : {};
    }
    const rowSize = row ? rowDefaultSize(row) : "md";
    const parsed = parseImageEntry(entry, rowSize, row?.location);
    if (!parsed) {
      return baseClassName ? { className: baseClassName } : {};
    }
    return {
      onClick: () => onImageClick(parsed.name),
      className: `${baseClassName} cursor-pointer`.trim(),
    };
  };

  const DEFAULT_ROW_GAP = 20;
  const rowGapStyle = (row) =>
    typeof row.gap === "number"
      ? { marginTop: `${(row.gap - DEFAULT_ROW_GAP) * 0.25}rem` }
      : undefined;

  const Insert = edit?.ColumnInsert;
  const Blank = edit?.Blank;
  const RowWrap = edit?.Row;

  return items.map((row, i) => {
    const isFull =
      !edit &&
      row.columns.length === 1 &&
      row.columns[0].length === 1 &&
      parseImageEntry(row.columns[0][0], rowDefaultSize(row), row.location);

    const key = isFull
      ? parseImageEntry(row.columns[0][0], rowDefaultSize(row), row.location)
          .name
      : i;

    const renderImage = (
      entry,
      path,
      layout,
      wrapperClassName,
      { key, className, ...rest } = {},
    ) => {
      const node = wrapPhoto(
        edit,
        path,
        <GalleryImage
          region={region}
          entry={entry}
          row={row}
          layout={layout}
          wrapperClassName={wrapperClassName}
          {...rest}
          {...clickProps(
            entry,
            row,
            className || (layout === "grid" ? "object-cover" : ""),
          )}
        />,
      );
      return key != null ? <Fragment key={key}>{node}</Fragment> : node;
    };

    const renderBlank = (path, className, style) =>
      Blank ? (
        <div key={`blank-${path.col}-${path.entry ?? "col"}`} className={className} style={style}>
          <Blank path={path} edit={edit} />
        </div>
      ) : (
        <div
          key={`blank-${path.col}-${path.entry ?? "col"}`}
          className={className}
          style={style}
        />
      );

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
          renderImage(row.columns[0][0], { row: i, col: 0, entry: 0 }, "full", "w-full shrink-0", {
            loadProps: loadPropsFor(i),
          })
        );
      }

      return (
        <div className="w-full shrink-0 flex gap-4">
          {row.columns.map((col, j) => {
            const colClass = row.flex ? "min-w-0" : "flex-1 min-w-0";
            const colStyle = row.flex
              ? { flex: `${row.flex[j]} 1 0%` }
              : undefined;
            const insertBefore =
              j === 0 && Insert ? (
                <Insert
                  key={`ins-${i}-0`}
                  row={i}
                  col={0}
                  edit={edit}
                  plus={false}
                />
              ) : null;
            const insertAfter = Insert ? (
              <Insert
                key={`ins-${i}-${j + 1}`}
                row={i}
                col={j + 1}
                edit={edit}
                plus={j < row.columns.length - 1}
              />
            ) : null;

            let body;
            if (col.length === 0) {
              body = renderBlank(
                { row: i, col: j },
                `${colClass} flex`,
                colStyle,
              );
            } else if (
              col.length === 1 &&
              parseImageEntry(col[0], rowDefaultSize(row), row.location)
            ) {
              body = (
                <div
                  key={j}
                  data-gallery-col=""
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
                    renderImage(col[0], { row: i, col: j, entry: 0 }, "grid", "w-full", {
                      loadProps: loadPropsFor(i, j),
                      onLoad:
                        row.fit === "contain"
                          ? (e) => {
                              const colEl =
                                e.currentTarget.closest("[data-gallery-col]");
                              if (colEl) {
                                colEl.style.flex = `${e.currentTarget.naturalWidth / e.currentTarget.naturalHeight} 1 0%`;
                              }
                            }
                          : undefined,
                    })
                  )}
                </div>
              );
            } else {
              body = (
                <div
                  key={j}
                  data-gallery-col=""
                  className={`${colClass} flex flex-col gap-4`}
                  style={colStyle}
                >
                  {col.map((entry, k) =>
                    Array.isArray(entry) ? (
                      entry.length === 0 ? (
                        renderBlank(
                          { row: i, col: j, entry: k },
                          "flex-1",
                        )
                      ) : (
                        <Fragment key={k}>
                          {wrapGroup(
                          edit,
                          { row: i, col: j, entry: k },
                          <div className="flex gap-4">
                            {entry.map((img, s) =>
                              asSkeleton ? (
                                <GallerySkeletonCell
                                  key={
                                    parseImageEntry(img, rowDefaultSize(row))
                                      ?.name ?? `${k}-${s}`
                                  }
                                  region={region}
                                  entry={img}
                                  row={row}
                                  wrapperClassName="flex-1 min-w-0"
                                  shimmer={shimmer}
                                />
                              ) : (
                                renderImage(
                                  img,
                                  { row: i, col: j, entry: k, sub: s },
                                  "grid",
                                  "flex-1 min-w-0",
                                  {
                                    key:
                                      parseImageEntry(img, rowDefaultSize(row))
                                        ?.name ?? `${k}-${s}`,
                                    loadProps: loadPropsFor(i, k),
                                  },
                                )
                              ),
                            )}
                          </div>,
                        )}
                        </Fragment>
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
                      renderImage(entry, { row: i, col: j, entry: k }, "grid", "w-full", {
                        key:
                          parseImageEntry(entry, rowDefaultSize(row))?.name ?? k,
                        loadProps: loadPropsFor(i, k),
                      })
                    ),
                  )}
                </div>
              );
            }

            return (
              <Fragment key={j}>
                {insertBefore}
                {body}
                {insertAfter}
              </Fragment>
            );
          })}
        </div>
      );
    };

    const content = renderRow(skeleton);
    const rowStyle = rowGapStyle(row);
    const wrapped = RowWrap ? (
      <RowWrap rowIndex={i} edit={edit} style={edit ? rowStyle : undefined}>
        {content}
      </RowWrap>
    ) : null;

    if (virtualize) {
      return (
        <VirtualGalleryRow
          key={key}
          rootRef={scrollRootRef}
          overscan={overscan}
          style={rowStyle}
          fallback={renderRow(true, { shimmer: false })}
        >
          {content}
        </VirtualGalleryRow>
      );
    }
    if (wrapped) {
      return <Fragment key={key}>{wrapped}</Fragment>;
    }
    if (rowStyle) {
      return (
        <div key={key} className="w-full shrink-0" style={rowStyle}>
          {content}
        </div>
      );
    }
    return <Fragment key={key}>{content}</Fragment>;
  });
}
