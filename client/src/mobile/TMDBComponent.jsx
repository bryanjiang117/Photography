import { Icon } from "@iconify-icon/react";
import SectionTitle from "./SectionTitle";
import { useTmdb } from "../TmdbContext.jsx";
import LoadingDots from "../components/LoadingDots.jsx";
import { EXTRAS_COPY } from "../constants/data";

const TMDBComponent = () => {
  const items = useTmdb();
  const loading = items == null;
  const { titleEn, titleZh } = EXTRAS_COPY.tmdb;

  return (
    <div className="relative flex flex-col pt-4 pb-5 w-full">
      {loading && <LoadingDots />}
      <div
        className={`px-4 ${loading ? "invisible" : ""}`}
        aria-hidden={loading}
      >
        <SectionTitle english={titleEn} chinese={titleZh} />
      </div>

      <div
        className={`flex flex-row overflow-x-auto mt-3 overscroll-none scrollbar-hide ${loading ? "invisible" : ""}`}
      >
        {loading ? (
          <div className="h-32 w-full" />
        ) : (
          items.map((item, i) => (
            <div
              key={`${item.media_type ?? "unknown"}-${item.id ?? item.title}`}
              className="flex shrink-0 h-32 w-[calc(100%/2.4)]"
            >
              {i > 0 && <div className="w-px shrink-0 bg-gray-300" />}
              <div className="flex flex-col gap-1 p-3">
                <span className="text-sm bodoni-small select-text leading-tight">
                  {item.title}
                </span>
                <span className="text-[10px] uppercase tracking-widest opacity-60">
                  {item.media_type === "movie" ? "film" : "tv"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <a
        href="https://www.themoviedb.org/u/bryanjiang117/ratings/tv"
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-2 ml-auto flex w-fit items-center gap-1.5 px-4 text-xs bodoni-small tracking-wider ${loading ? "invisible" : ""}`}
        aria-hidden={loading}
        tabIndex={loading ? -1 : undefined}
      >
        <Icon
          icon="simple-icons:themoviedatabase"
          width={18}
          height={18}
          style={{ color: "#01B4E4" }}
        />
        <span className="opacity-80">via TMDB API</span>
      </a>
    </div>
  );
};

export default TMDBComponent;
