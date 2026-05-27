import GalleryImage from "./GalleryImage";
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
 * }} props
 */
export default function GalleryGrid({ region, items }) {
  return items.map((row, i) => {
    const isFull =
      row.columns.length === 1 &&
      row.columns[0].length === 1 &&
      parseImageEntry(row.columns[0][0], rowDefaultSize(row));

    return isFull ? (
      <GalleryImage
        key={parseImageEntry(row.columns[0][0], rowDefaultSize(row)).name}
        region={region}
        entry={row.columns[0][0]}
        row={row}
        layout="full"
        loadProps={galleryImgLoadProps(i)}
        className="w-full shrink-0"
      />
    ) : (
      <div key={i} className="w-full shrink-0 flex gap-4">
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
                loadProps={galleryImgLoadProps(i, j)}
                onLoad={
                  row.fit === "contain"
                    ? (e) => {
                        e.currentTarget.parentElement.style.flex = `${e.currentTarget.naturalWidth / e.currentTarget.naturalHeight} 1 0%`;
                      }
                    : undefined
                }
                className="w-full object-cover"
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
                            parseImageEntry(img, rowDefaultSize(row))?.name ??
                            k
                          }
                          region={region}
                          entry={img}
                          row={row}
                          layout="grid"
                          loadProps={galleryImgLoadProps(i, k)}
                          className="flex-1 min-w-0 object-cover"
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
                    loadProps={galleryImgLoadProps(i, k)}
                    className="w-full object-cover"
                  />
                ),
              )}
            </div>
          );
        })}
      </div>
    );
  });
}
