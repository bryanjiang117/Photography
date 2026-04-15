const MexicoCityPanel = () => {
  return (
    <div className="shrink-0 h-screen w-screen p-4">
      <div className="flex flex-col h-full mr-[15%]">
        <section className="relative flex-1 w-full bg-mexico-primary">
          <img
            src="assets/photos/mexico/orange-wall.jpeg"
            className="absolute top-6 right-1/10 max-w-6/10 max-h-8/10"
          />
        </section>
        <section className="relative mb-8 p-4 w-fit h-fit">
          <div className="flex">
            <div className="title font-tsm" lang="zh-CN" translate="no">
              墨西哥城
            </div>
            <span className="mt-4 w-fit origin-top-left [writing-mode:vertical-rl] text-xl bodoni-small leading-none">
              Mexico City
            </span>
          </div>
          <div className="absolute bottom-0 right-0 w-fit translate-y-full translate-x-[calc(100%-6rem)] text-md">
            <span className="bodoni-small leading-none">photography &nbsp;</span>
            <span translate="no">‧</span>
            <span className="subtitle font-sh" lang="zh-CN" translate="no">
              &nbsp; 摄影
            </span>
            {/* ● */}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MexicoCityPanel;
