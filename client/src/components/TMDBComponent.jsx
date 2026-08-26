import { Icon } from "@iconify-icon/react";
import { useTmdb } from "../TmdbContext.jsx";
import LoadingDots from "./LoadingDots.jsx";
import { EXTRAS_COPY } from "../constants/data";

const TMDBComponent = () => {
  const items = useTmdb();
  const loading = items == null;
  const { titleEn, titleZh } = EXTRAS_COPY.tmdb;

  return (
    <div className="relative flex flex-col flex-1 h-full min-w-fit min-h-fit">
      {loading && <LoadingDots />}
      <div
        className={`px-10 pt-10 pb-1 shrink-0 ${loading ? "invisible" : ""}`}
        aria-hidden={loading}
      >
        <div className="relative text-[64px] font-semibold tracking-tighter leading-none bodoni-small">
          <div className="-translate-x-2">{titleEn}</div>
          <div className="justify-self-end -translate-y-1 text-lg font-sh font-semibold tracking-widest">
            {titleZh}
          </div>
        </div>
      </div>

      <div
        className={`flex flex-col justify-center flex-1 h-full min-h-0 px-10 pb-10 w-full ${loading ? "invisible" : ""}`}
      >
        {!loading && (
          <>
            {items.map((item) => (
              <div
                key={`${item.media_type ?? "unknown"}-${item.id ?? item.title}`}
                className="flex items-center flex-1  border-t border-gray-300 py-1.5"
              >
                <div className="flex gap-1 flex-1">
                  <span className="text-sm bodoni-small select-text leading-tight">
                    {item.title}
                  </span>
                  {item.original_title && (
                    <span className="text-sm font-sh select-text leading-tight opacity-60 shrink-0">
                      ({item.original_title})
                    </span>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-widest opacity-30 shrink-0">
                  {item.media_type === "movie" ? "film" : "tv"}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-300" />
          </>
        )}
      </div>

      <a
        href="https://www.themoviedb.org/u/bryanjiang117/ratings/tv"
        target="_blank"
        rel="noopener noreferrer"
        className={`absolute right-10 bottom-3 inline-flex items-center gap-1.5 text-xs bodoni-small tracking-wider ${loading ? "invisible" : ""}`}
        aria-hidden={loading}
        tabIndex={loading ? -1 : undefined}
      >
        <span className="opacity-50">via TMDB API</span>
        <Icon
          icon="simple-icons:themoviedatabase"
          width={18}
          height={18}
          style={{ color: "#01B4E4" }}
        />
      </a>
    </div>
  );
};

export default TMDBComponent;
