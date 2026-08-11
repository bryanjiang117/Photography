import SectionTitle from "./SectionTitle";
import { useTmdb } from "../TmdbContext.jsx";
import LoadingDots from "../components/LoadingDots.jsx";

const TMDBComponent = () => {
  const items = useTmdb();
  const loading = items == null;

  return (
    <div className="relative flex flex-col py-4 w-full">
      {loading && <LoadingDots />}
      <div
        className={`px-4 ${loading ? "invisible" : ""}`}
        aria-hidden={loading}
      >
        <SectionTitle english="TOP TITLES" chinese="最爱的影视" />
      </div>

      <div
        className={`flex flex-row overflow-x-auto mt-3 scrollbar-hide ${loading ? "invisible" : ""}`}
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
        className={`mt-2 block px-4 text-right text-xs bodoni-small tracking-wider opacity-80 ${loading ? "invisible" : ""}`}
        aria-hidden={loading}
        tabIndex={loading ? -1 : undefined}
      >
        via TMDB API
      </a>
    </div>
  );
};

export default TMDBComponent;
