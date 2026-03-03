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
    <div className="flex">
      <div className="flex gap-2">
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
      <div className="text-[40px] bodoni-medium [writing-mode:vertical-rl]">
        FAVORITE ANIME
      </div>
    </div>
  ) : (
    <div>malData not found</div>
  );
};

export default MALPanel;
