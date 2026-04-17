import { useEffect, useState } from "react";
import SectionTitle from "./SectionTitle";

const MALComponent = () => {
  const [malData, setMalData] = useState([]);

  async function getAnimeList() {
    try {
      const res = await fetch("/api/mal/anime-list");
      const data = await res.json();
      if (Array.isArray(data)) setMalData(data);
    } catch {}
  }

  useEffect(() => {
    getAnimeList();
  }, []);

  return (
    <div className="relative flex flex-col p-4 w-full">
      <div className="mb-2">
        <SectionTitle english="TOP ANIME" chinese="最爱动漫" />
      </div>
      <div className="flex flex-row overflow-x-auto mt-1 scrollbar-hide">
        {malData.map((item, i) => {
          const anime = item.node;
          return (
            <div key={anime.id} className="flex shrink-0 h-32 w-32">
              {i > 0 && <div className="w-px shrink-0 bg-gray-300" />}
              <div className="flex flex-col p-3">
                <span
                  className="text-sm font-sh select-text leading-tight [writing-mode:vertical-rl]"
                  lang="jp"
                >
                  {anime.alternative_titles.ja}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-right text-xs bodoni-small tracking-wider opacity-80">
        via MAL API
      </div>
    </div>
  );
};

export default MALComponent;
