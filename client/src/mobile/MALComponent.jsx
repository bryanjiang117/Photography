import SectionTitle from "./SectionTitle";
import { useMal } from "../MalContext.jsx";
import LoadingDots from "../components/LoadingDots.jsx";

const MALComponent = () => {
  const malData = useMal();
  const loading = malData == null;

  return (
    <div className="relative flex flex-col py-4 w-full">
      {loading && <LoadingDots />}
      <div
        className={`mb-2 px-4 ${loading ? "invisible" : ""}`}
        aria-hidden={loading}
      >
        <SectionTitle english="TOP ANIME" chinese="最爱动漫" />
      </div>
      <div
        className={`flex flex-row overflow-x-auto mt-1 scrollbar-hide ${loading ? "invisible" : ""}`}
      >
        {loading ? (
          <div className="h-32 w-full" />
        ) : (
          malData.map((item, i) => {
            const anime = item.node;
            return (
              <div key={anime.id} className="flex shrink-0 h-32 w-[calc(100%/2.4)]">
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
          })
        )}
      </div>
      <a
        href="https://myanimelist.net/animelist/BryanJiang?status=2&order=4&order2=0"
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-2 block px-4 text-right text-xs bodoni-small tracking-wider opacity-80 ${loading ? "invisible" : ""}`}
        aria-hidden={loading}
        tabIndex={loading ? -1 : undefined}
      >
        via MAL API
      </a>
    </div>
  );
};

export default MALComponent;
