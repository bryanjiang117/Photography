import { Icon } from "@iconify-icon/react";
import { useGithub } from "../GithubContext.jsx";
import LoadingDots from "./LoadingDots.jsx";
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
    <div className="relative flex flex-col shrink-0 px-10 pt-4 pb-11">
      {loading && <LoadingDots />}
      <div
        className={`my-1 shrink-0 text-[0.60rem] tracking-widest uppercase bodoni-small ${loading ? "invisible" : ""}`}
        aria-hidden={loading}
      >
        {copy.title}
      </div>

      <div
        className={`mt-3.25 flex flex-col ${loading ? "invisible" : ""}`}
        aria-hidden={loading}
      >
        {rows.map((row) => {
          const ValueTag = row.href ? "a" : "span";
          return (
            <div
              key={row.key}
              className="flex items-center gap-4 border-t border-gray-300 py-1.5 last:border-b"
            >
              <span className="text-sm leading-tight bodoni-small shrink-0 w-28">
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
        className={`absolute right-10 bottom-3 inline-flex items-center gap-1.5 text-xs bodoni-small tracking-wider ${loading ? "invisible" : ""}`}
        aria-hidden={loading}
        tabIndex={loading ? -1 : undefined}
      >
        <span className="opacity-50">via GitHub API</span>
        <Icon icon="simple-icons:github" width={16} height={16} />
      </a>
    </div>
  );
};

export default GithubComponent;
