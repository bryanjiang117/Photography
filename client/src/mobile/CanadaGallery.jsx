import { CANADA_PHOTOS } from "../constants/data";

export default function CanadaGallery() {
  return (
    <div className="flex flex-col w-full bg-background">
      <div className="flex items-end gap-3 px-4 pt-6 pb-3">
        <div className="text-5xl font-tsm" lang="zh-CN" translate="no">
          加拿大
        </div>
        <span className="mb-1 text-base bodoni-small uppercase tracking-widest">
          Canada
        </span>
      </div>

      <div className="flex flex-col items-center gap-6 px-4 py-4">
        {CANADA_PHOTOS.map((name) => (
          <img
            key={name}
            src={`/assets/photos/canada/${name}.jpeg`}
            alt=""
            className="aspect-3/2 w-full"
          />
        ))}
      </div>

      <div className="flex px-4 py-3 items-center gap-2 text-gray-900">
        <span className="bodoni-small text-sm uppercase tracking-widest">
          photography
        </span>
        <span translate="no">‧</span>
        <span className="font-tsm text-sm font-extrabold">摄影</span>
      </div>
    </div>
  );
}
