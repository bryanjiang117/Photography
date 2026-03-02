import { useEffect, useState } from "react";

const MALPanel = () => {
  const [malData, setMalData] = useState([]);

  async function getAnimeList() {
    const res = await fetch("api/mal/anime-list");

    const data = await res.json();
    console.log(data);
    setMalData(data);
  }

  useEffect(() => {
    getAnimeList();
  }, []);

  return malData ? (
    <div className="flex flex-col gap-2 p-8">
      {malData.map((item, i) => {
        const anime = item.node;

        return (
          <div
            className="flex gap-2 text-2xl font-sh select-text"
            key={anime.id}
            lang="jp"
          >
            <div className="w-10 text-right">{i + 1}.</div>
            {/* <img className="w-15" src={anime.main_picture.large} /> */}
            <div>{anime.alternative_titles.ja}</div>
          </div>
        );
      })}
    </div>
  ) : (
    <div>malData not found</div>
  );
};

export default MALPanel;
