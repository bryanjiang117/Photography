const PROJECTS = [
  {
    name: "FOMO",
    description:
      "An Android location tracking social app made for friends to stay connected. Cool features are the on-my-way status and shared places.",
    link: "https://github.com/bryanjiang117/FOMO",
    image: "/assets/images/projects/fomo.png",
    isDesign: false,
  },
  {
    name: "Unclutter",
    description:
      "A mobile app that provides a new take on note organization. Notes are sorted into semantically-grouped visual bubbles.",
    link: "https://www.figma.com/community/file/1578143880936148685/unclutter?q_id=686bfa3e-ba29-4173-9ace-550c973c9522",
    isDesign: true,
  },
];

const ProjectsPanel = () => {
  return (
    <div className="shrink-0 h-screen flex mr-[15vw]">
      <div className="h-screen w-px min-w-px bg-gray-400" />
      <div className="flex h-screen w-fit min-w-fit">
        {/* Left: title column */}
        <div className="flex flex-col justify-between py-10 pl-15 pr-10">
          <div className="flex gap-2">
            <div
              className="text-8xl font-tsm font-extrabold leading-none [writing-mode:vertical-rl]"
              lang="zh-CN"
              translate="no"
            >
              作品
            </div>
            <span className="bodoni-small text-lg uppercase tracking-widest [writing-mode:vertical-rl] opacity-60">
              Works
            </span>
          </div>
        </div>

        <div className="h-full w-px min-w-px bg-gray-400" />

        {/* Right: scrollable project list */}
        <div className="h-screen min-h-0 overflow-y-auto scrollbar-hide">
          {PROJECTS.map((project, i) => (
            <a
              key={project.name}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block no-underline text-inherit group overflow-hidden"
            >
              {project.image && (
                <img
                  src={project.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-0 translate-x-6 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out pointer-events-none z-10"
                />
              )}
              <div className="h-px w-full bg-gray-300" />
              <div className="px-10 py-8">
                <div className="flex gap-8">
                  <span className="text-6xl font-bold bodoni-small shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex mt-6">
                  <p className="max-w-[20vw] min-w-80 text-md leading-tight">
                    {project.description}
                  </p>
                </div>
                <div className="mt-12 flex justify-between text-xs bodoni-small opacity-50">
                  <div className="mt-1/2 self-center text-xs bodoni-small leading-none tracking-tight">
                    {project.name}
                  </div>
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
            </a>
          ))}
          <div className="h-px w-full bg-gray-300" />
        </div>
      </div>
      <div className="h-screen w-px min-w-px bg-gray-400" />
    </div>
  );
};

export default ProjectsPanel;
