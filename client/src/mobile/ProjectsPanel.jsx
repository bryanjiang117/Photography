import { PROJECTS, PROJECTS_COPY } from "../constants/data";

const ProjectsPanel = () => {
  const [, titleZhWorks] = PROJECTS_COPY.titleZhParts;

  return (
    <div className="w-full">
      <div className="flex items-end gap-3 px-4 pb-6">
        <div
          className="text-5xl font-tsm font-extrabold"
          lang="zh-CN"
          translate="no"
        >
          {titleZhWorks}
        </div>
        <span className="mb-1 text-base bodoni-small uppercase tracking-widest opacity-60">
          {PROJECTS_COPY.worksEn}
        </span>
      </div>

      <div className="h-px w-full bg-gray-400" />
      <div className="flex flex-row overflow-x-auto overscroll-none scrollbar-hide scroll-px-8">
        {PROJECTS.map((project, i) => {
          const Tag = project.link ? "a" : "div";
          const linkProps = project.link
            ? {
                href: project.link,
                target: "_blank",
                rel: "noopener noreferrer",
              }
            : {};

          return (
            <Tag
              key={project.name}
              {...linkProps}
              className="shrink-0 w-[calc(100%/1.4)] flex no-underline text-inherit"
            >
              {i > 0 && <div className="w-px shrink-0 self-stretch bg-gray-400" />}
              <div className="px-5 py-4 flex-1 flex flex-col">
                <span className="text-4xl font-bold bodoni-small">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 text-sm leading-tight">
                  {project.description}
                </p>
                <div className="mt-auto pt-4 flex justify-between text-xs bodoni-small opacity-50">
                  <span className="leading-none tracking-tight">
                    {project.name}
                  </span>
                  <div>
                    {project.isDesign ? (
                      <>
                        <span>{PROJECTS_COPY.designEn}</span>
                        <span translate="no"> ‧ </span>
                        <span className="font-sh" lang="zh-CN" translate="no">
                          {PROJECTS_COPY.designZh}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>{PROJECTS_COPY.programmingEn}</span>
                        <span translate="no"> ‧ </span>
                        <span className="font-sh" lang="zh-CN" translate="no">
                          {PROJECTS_COPY.programmingZh}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Tag>
          );
        })}
      </div>
      <div className="h-px w-full bg-gray-400" />
    </div>
  );
};

export default ProjectsPanel;
