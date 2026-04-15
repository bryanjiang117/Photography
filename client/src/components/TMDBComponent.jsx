import { useEffect, useState } from "react";

const TMDBComponent = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("/api/tmdb/rated")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setItems(data))
      .catch(() => {});
  }, []);

  return (
    <div className="relative flex flex-col flex-1 h-full min-w-fit min-h-fit">
      <div className="px-10 pt-10 pb-1 shrink-0">
        <div className="relative text-[64px] font-medium tracking-tighter leading-none bodoni-small">
          TOP TITLES
          <div className="justify-self-end -translate-y-1 text-xl font-sh font-semibold tracking-widest">
            最爱的影视
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between flex-1 min-h-0 px-10 pb-10 w-full">
        {items.map((item) => (
          <div
            key={`${item.media_type}-${item.id}`}
            className="flex items-center gap-4 border-t border-gray-300 py-1.5"
          >
            <span className="flex-1 text-sm bodoni-small select-text leading-tight">
              {item.title}
            </span>
            <span className="text-[10px] uppercase tracking-widest opacity-30 shrink-0">
              {item.media_type === "movie" ? "film" : "tv"}
            </span>
          </div>
        ))}
        <div className="border-t border-gray-300" />
      </div>

      <div className="absolute right-10 bottom-3 text-[10px] bodoni-small tracking-wider opacity-50">
        via TMDB API
      </div>
    </div>
  );
};

export default TMDBComponent;
