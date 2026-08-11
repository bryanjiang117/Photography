import { useMal } from "../MalContext.jsx";
import LoadingDots from "./LoadingDots.jsx";

const MALComponent = () => {
  const malData = useMal();
  const loading = malData == null;

  return (
    <div className="relative flex flex-1 items-start p-10 h-full min-h-fit">
      {loading && <LoadingDots />}
      <div className={`flex flex-1 h-full ${loading ? "invisible" : ""}`}>
        {!loading &&
          malData.map((item) => {
            const anime = item.node;
            return (
              <div
                className="flex flex-1 items-center text-base font-sh select-text [writing-mode:vertical-rl] border-l border-gray-300 last:border-r"
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
      <div
        className={`ml-2 -translate-y-2 flex flex-col items-center shrink-0 ${loading ? "invisible" : ""}`}
        aria-hidden={loading}
      >
        <div
          className="text-8xl font-tsm [writing-mode:vertical-rl]"
          lang="zh-CN"
        >
          最爱动漫
        </div>
        <div className="mt-1 ml-1">TOP ANIME</div>
      </div>

      <a
        href="https://myanimelist.net/animelist/BryanJiang?status=2&order=4&order2=0"
        target="_blank"
        rel="noopener noreferrer"
        className={`absolute left-10 bottom-3 text-xs bodoni-small tracking-wider opacity-50 ${loading ? "invisible" : ""}`}
        aria-hidden={loading}
        tabIndex={loading ? -1 : undefined}
      >
        via MAL API
      </a>
    </div>
  );
};

export default MALComponent;
