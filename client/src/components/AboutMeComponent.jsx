import { ABOUT_ME } from "../constants/data";

const AboutMeComponent = () => {
  const {
    titleEn,
    titleZh,
    blurbZh,
    blurbEn,
    affiliations,
  } = ABOUT_ME;

  return (
    <div className="relative flex flex-col flex-1 min-h-0 h-full w-full px-10 pt-10 pb-8">
      <div className="shrink-0">
        <div className="relative text-[64px] font-semibold tracking-tighter leading-none bodoni-small">
          <div className="-translate-x-2">{titleEn}</div>
          <div className="justify-self-end -translate-y-1 text-lg font-sh font-semibold tracking-widest">
            {titleZh}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 max-w-[26rem]">
        <p className="text-lg leading-snug bodoni-small">{blurbEn}</p>
        <p
          className="text-base font-sh leading-relaxed"
          lang="zh-CN"
          translate="no"
        >
          {blurbZh}
        </p>
      </div>

      <div className="flex-1 min-h-6" />

      <div className="flex flex-col gap-2.5">
        {affiliations.map((item) => (
          <div key={item.primary} className="group flex items-center gap-3">
            <img
              src={item.logo}
              alt=""
              className="h-5 w-5 object-contain shrink-0"
            />
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-sm leading-none bodoni-small select-text">
                {item.primary}
              </span>
              {item.caption ? (
                <span className="text-[10px] leading-none uppercase tracking-widest opacity-0 group-hover:opacity-40 transition-opacity duration-200">
                  {item.caption}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutMeComponent;
