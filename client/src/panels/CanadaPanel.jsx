const PHOTOS = [
  "rolling-hills",
  "sunset-barn",
  "wheat",
  "windows-xp-grass",
  "blurred-rain",
  "moon",
  "firework",
  "pink-sky-plane",
  "cargo-cranes",
  "summer-drink-days",
];

export default function CanadaPanel() {
  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute left-20 top-6 z-20 flex flex-col items-start text-gray-900">
        <div
          className="font-tsm text-[12rem] leading-none [writing-mode:vertical-rl]"
          lang="zh-CN"
          translate="no"
        >
          加拿大
        </div>
        <span className="bodoni-small mt-4 text-lg uppercase tracking-widest">
          Canada
        </span>
      </div>
      <div className="pointer-events-none absolute bottom-6 right-10 z-20 flex flex-col items-end gap-2 text-gray-900">
        <div className="font-tsm text-xl font-extrabold leading-none [writing-mode:vertical-rl]">
          摄影
        </div>
        <div className="bodoni-small text-lg uppercase tracking-widest [writing-mode:vertical-rl]">
          photography
        </div>
      </div>

      <div
        tabIndex={-1}
        className="flex min-h-0 flex-1 flex-col items-center gap-20 overflow-y-auto overflow-x-visible py-10 px-20 scrollbar-gutter-stable"
      >
        {PHOTOS.map((name) => (
          <img
            key={name}
            src={`/assets/photos/canada/${name}.jpeg`}
            alt=""
            className="aspect-3/2 w-[calc(100%-30rem)] max-w-full shrink-0"
          />
        ))}
      </div>
    </div>
  );
}
