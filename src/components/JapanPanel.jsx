const JapanPanel = () => {
  return (
    <div className="panel flex gap-5 pl-20 p-4">
      <section className="relative flex-1 mb-20 bg-japan-primary">
        <img
          src="assets/photos/japan/flowers.jpeg"
          // className="absolute top-4 left-8 max-w-3/10 max-h-4/10"
          className="absolute bottom-4 left-8 max-w-4/10 max-h-8/10"
        />
      </section>
      <section className="mb-20 min-w-fit w-3/10">
        <div className="flex flex-col gap-20 w-fit h-full">
          <div className="flex">
            <div
              className="title font-tsm [writing-mode:vertical-rl]"
              lang="jp"
              translate="no"
            >
              日本
            </div>
            <span
              className="mt-6 w-fit [writing-mode:vertical-rl] text-xl font-tsm tracking-[2rem]"
              lang="jp"
              translate="no"
            >
              にほん
            </span>
          </div>
          <div className="flex justify-center items-end w-full flex-1 h-full min-w-0">
            <div className="flex gap-5 w-fit text-md -translate-x-1/2 px-2 bg-japan-accent [writing-mode:vertical-rl]">
              <span className="bodoni-small leading-none">Photography</span>
              <span translate="no">‧</span>
              <span className="subtitle font-sh" lang="zh-CN" translate="no">
                摄&nbsp;影
              </span>
              {/* ● */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JapanPanel;
