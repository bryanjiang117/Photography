import SectionTitle from "./SectionTitle";
import { useTmdb } from "../TmdbContext.jsx";

const TMDBComponent = () => {
  const items = useTmdb();

  return (
    <div className="relative flex flex-col p-4 w-full">
      <SectionTitle english="TOP TITLES" chinese="最爱的影视" />

      <div className="flex flex-row overflow-x-auto mt-3 scrollbar-hide">
        {items.map((item, i) => (
          <div
            key={`${item.media_type ?? "unknown"}-${item.id ?? item.title}`}
            className="flex shrink-0 h-32 w-32"
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
        ))}
      </div>
      <div className="mt-2 text-right text-xs bodoni-small tracking-wider opacity-80">
        via TMDB API
      </div>
    </div>
  );
};

export default TMDBComponent;
