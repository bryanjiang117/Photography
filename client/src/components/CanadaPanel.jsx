const CanadaPanel = () => {
  return (
    <div className="relative flex h-screen w-fit ">
      <div className="flex flex-col justify-end h-full">
        <div className="p-10 text-lg bodoni-small">
          {/* I was born in Canada but my mother tongue is Mandarin. On hot sunny days
          with just the right breeze carrying just the right scent, I feel an
          intense nostalgia and longing to return to those summers in China.
          I've always known in my heart that my real home is there. */}
        </div>
      </div>
      <div className="relative flex justify-end h-full w-full min-h-[420px]">
        <section className="relative flex items-center h-full">
          <div className="bg-canada-primary overflow-hidden w-fit h-full">
            <img
              src="assets/photos/farm-ca.jpeg"
              alt=""
              className="block h-full w-auto object-cover"
            />
            {/* Title block: overlaid on the left, inside the colored box */}
            <div className="pointer-events-none absolute inset-y-0 left-6 flex items-center w-fit">
              <div className="absolute text-background h-fit">
                <div
                  className="text-[12rem] -mt-40 leading-none font-tsm [writing-mode:vertical-rl]"
                  lang="zh-CN"
                  translate="no"
                >
                  加拿大
                </div>
                <span className="absolute right-2 bottom-0 translate-y-full text-lg bodoni-small tracking-widest uppercase text-background">
                  Canada
                </span>
                {/* <span className="bodoni-small leading-none">
                  Photography &nbsp;
                </span>
                <span translate="no">‧</span>
                <span className="subtitle font-sh" lang="zh-CN" translate="no">
                  &nbsp; 摄影
                </span> */}
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="absolute right-4 bottom-4 flex items-center text-center gap-2 text-background w-3/10">
        <div className="leading-none text-nowrap">photography</div>
        <div className="flex-1 min-h-px w-full bg-background opacity-50" />
        <div className="text-xl font-tsm leading-none font-extrabold">摄影</div>
      </div>
    </div>
  );
};

export default CanadaPanel;
