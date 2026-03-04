import { useEffect, useState } from "react";

const MALPanel = () => {
  const [malData, setMalData] = useState([]);

  async function getAnimeList() {
    const res = await fetch("/api/mal/anime-list");

    const data = await res.json();
    console.log("MAL data", data);

    setMalData(data);
  }

  useEffect(() => {
    getAnimeList();
  }, []);

  return malData ? (
    <div className="relative flex flex-1 justify-center items-start p-10 h-full min-w-fit min-h-fit">
      <div className="flex gap-2 h-full">
        {malData.map((item, i) => {
          const anime = item.node;
          return (
            <div
              className="flex gap-2 text-lg font-sh select-text [writing-mode:vertical-rl]"
              key={anime.id}
              lang="jp"
            >
              {/* <img className="w-15" src={anime.main_picture.large} /> */}
              <div
                className={
                  anime.title === "[Oshi no Ko]" ? "-translate-y-2" : ""
                }
              >
                {anime.alternative_titles.ja}
              </div>
            </div>
          );
        })}
      </div>
      <div
        className="-mt-1 ml-1 text-8xl font-tsm [writing-mode:vertical-rl]"
        lang="zh-CN"
      >
        最爱动漫
      </div>
      <div className="absolute left-6 bottom-3 text-xs bodoni-small">
        TOP ANIME
      </div>
    </div>
  ) : (
    <div>malData not found</div>
  );
};

export default MALPanel;
