const CanadaPanel = () => {
  return (
    <div className="panel flex">
      <div className="flex flex-col justify-end h-full">
        <div className="p-10 w-100 text-lg bodoni-small">
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
            <div className="pointer-events-none absolute inset-y-0 left-6 flex items-center">
              <div className="flex flex-col gap-1 ml-8 text-white/95">
                <div
                  className="text-[12rem] -mt-40 ml-20 leading-0 font-tsm [writing-mode:vertical-rl]"
                  lang="zh-CN"
                  translate="no"
                >
                  加拿大
                </div>
                <span className="text-lg bodoni-small tracking-widest uppercase text-white/90">
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
    </div>
  );
};

export default CanadaPanel;
