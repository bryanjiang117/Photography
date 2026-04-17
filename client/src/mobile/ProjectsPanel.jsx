import { PROJECTS } from "../constants/data";

const ProjectsPanel = () => {
  return (
    <div className="w-full">
      <div className="flex items-end gap-3 px-4 pb-6">
        <div
          className="text-5xl font-tsm font-extrabold"
          lang="zh-CN"
          translate="no"
        >
          作品
        </div>
        <span className="mb-1 text-base bodoni-small uppercase tracking-widest opacity-60">
          Works
        </span>
      </div>

      <div className="h-px w-full bg-gray-400" />
      <div className="flex flex-row overflow-x-auto scrollbar-hide">
        {PROJECTS.map((project, i) => (
          <a
            key={project.name}
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 w-[80vw] block no-underline text-inherit"
          >
            <div className="flex h-full">
              {i > 0 && <div className="w-px shrink-0 bg-gray-400" />}
              <div className="px-5 py-4 flex-1">
                <span className="text-4xl font-bold bodoni-small">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 text-sm leading-tight">
                  {project.description}
                </p>
                <div className="mt-4 flex justify-between text-xs bodoni-small opacity-50">
                  <span className="leading-none tracking-tight">
                    {project.name}
                  </span>
                  <div>
                    {project.isDesign ? (
                      <>
                        <span>Design</span>
                        <span translate="no"> ‧ </span>
                        <span className="font-sh" lang="zh-CN" translate="no">
                          设计
                        </span>
                      </>
                    ) : (
                      <>
                        <span>Programming</span>
                        <span translate="no"> ‧ </span>
                        <span className="font-sh" lang="zh-CN" translate="no">
                          软件
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
      <div className="h-px w-full bg-gray-400" />
    </div>
  );
};

export default ProjectsPanel;
