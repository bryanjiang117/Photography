import { useEffect, useState } from "react";

const MALComponent = () => {
  const [malData, setMalData] = useState([]);

  async function getAnimeList() {
    try {
      const res = await fetch("/api/mal/anime-list");
      const data = await res.json();
      if (Array.isArray(data)) {
        setMalData(data);
      }
    } catch {}
  }

  useEffect(() => {
    getAnimeList();
  }, []);

  return (
    <div className="relative flex flex-1 items-start p-10 h-full min-h-fit">
      <div className="flex flex-1 h-full">
        {malData.map((item, i) => {
          const anime = item.node;
          return (
            <div
              className="flex flex-1 items-center text-lg font-sh select-text [writing-mode:vertical-rl] border-l border-gray-300 last:border-r"
              key={anime.id}
              lang="jp"
            >
              <div
                className={`${anime.title === "[Oshi no Ko]" ? "-translate-y-2" : ""} py-px`}
              >
                {anime.alternative_titles.ja}
              </div>
            </div>
          );
        })}
      </div>
      <div className="ml-2 -translate-y-2 flex flex-col items-center shrink-0">
        <div
          className="text-8xl font-tsm [writing-mode:vertical-rl]"
          lang="zh-CN"
        >
          最爱动漫
        </div>
        <div className="mt-1 ml-1">TOP ANIME</div>
      </div>

      <div className="absolute left-10 bottom-3 text-xs bodoni-small tracking-wider opacity-50">via MAL API</div>
    </div>
  );
};

export default MALComponent;
