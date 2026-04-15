const STRIP_W = "min(28vw, 340px)";
const HERO_W = "min(22vw, 300px)";
const STRIP_INSET = "1rem";

const PHOTOS = [
  "farm-ca",
  "rolling-hills",
  "sunset-barn",
  "wheat",
  "windows-xp-grass",
  "blurred-rain",
  "moon",
  "firework",
  "pink-sky-plane",
  "cargo-cranes",
  // "active-boat",
  "summer-drink-days",
];

function srcForPhoto(path) {
  return path === "farm-ca"
    ? "/assets/photos/farm-ca.jpeg"
    : `/assets/photos/canada/${path}.jpeg`;
}

const farmFrameStyle = {
  left: `calc(100% - ${STRIP_INSET} - (${STRIP_W} + (${HERO_W})) / 2)`,
  top: `calc(50% - (${HERO_W} * 2 / 3) / 2)`,
  width: HERO_W,
  height: `calc(${HERO_W} * 2 / 3)`,
};

export default function CanadaPage() {
  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-background">
      {/* Chrome: explicit height so it doesn’t collapse (all inner layers are absolute) */}
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

      <div className="flex min-h-0 flex-1 flex-col items-center gap-20 overflow-y-auto overflow-x-visible py-10 px-20 scrollbar-gutter-stable">
        {PHOTOS.filter((path) => path !== "farm-ca").map((path) => (
          <img
            key={path}
            src={srcForPhoto(path)}
            alt=""
            className="aspect-3/2 w-[calc(100%-30rem)] max-w-full shrink-0"
          />
        ))}
      </div>
    </div>
  );
}
