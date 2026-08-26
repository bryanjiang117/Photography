import { Icon } from "@iconify-icon/react";
import { useGithub } from "../GithubContext.jsx";
import LoadingDots from "../components/LoadingDots.jsx";
import { EXTRAS_COPY } from "../constants/data";

function formatCount(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US");
}

const GithubComponent = () => {
  const repo = useGithub();
  const loading = repo == null;
  const copy = EXTRAS_COPY.github;
  const contributions =
    repo?.additions != null && repo?.deletions != null
      ? `+${formatCount(repo.additions)} −${formatCount(repo.deletions)}`
      : "—";

  const rows = loading
    ? []
    : [
        {
          key: "commits",
          label: copy.commits,
          value: formatCount(repo.commitCount),
        },
        {
          key: "contributions",
          label: copy.contributions,
          value: contributions,
        },
        {
          key: "latest",
          label: copy.latest,
          value: repo.latestMessage || "—",
          href: repo.latestUrl,
        },
      ];

  return (
    <div className="relative flex flex-col py-6 w-full">
      {loading && <LoadingDots />}
      <div
        className={`px-4 text-xs tracking-widest uppercase opacity-50 bodoni-small ${loading ? "invisible" : ""}`}
        aria-hidden={loading}
      >
        {copy.title}
      </div>

      <div
        className={`mt-4 px-4 flex flex-col ${loading ? "invisible" : ""}`}
        aria-hidden={loading}
      >
        {rows.map((row) => {
          const ValueTag = row.href ? "a" : "span";
          return (
            <div
              key={row.key}
              className="flex items-center gap-3 border-t border-gray-300 py-3 last:border-b"
            >
              <span className="text-sm leading-tight bodoni-small shrink-0">
                {row.label}
              </span>
              <ValueTag
                {...(row.href
                  ? {
                      href: row.href,
                      target: "_blank",
                      rel: "noopener noreferrer",
                    }
                  : {})}
                title={row.key === "latest" ? row.value : undefined}
                className={`min-w-0 flex-1 text-sm leading-tight bodoni-small text-right${row.key === "latest" ? " truncate" : ""}`}
              >
                {row.value}
              </ValueTag>
            </div>
          );
        })}
      </div>

      <a
        href={repo?.url ?? "https://github.com/bryanjiang117/Photography"}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-4 ml-auto flex w-fit items-center gap-1.5 px-4 pt-2 text-xs bodoni-small tracking-wider ${loading ? "invisible" : ""}`}
        aria-hidden={loading}
        tabIndex={loading ? -1 : undefined}
      >
        <Icon icon="simple-icons:github" width={16} height={16} />
        <span className="opacity-80">via GitHub API</span>
      </a>
    </div>
  );
};

export default GithubComponent;
