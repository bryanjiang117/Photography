import { useState } from "react";
import SectionTitle from "./SectionTitle";
import { ABOUT_ME } from "../constants/data";

const AboutMeComponent = () => {
  const {
    titleEn,
    titleZh,
    blurbZh,
    blurbEn,
    affiliations,
  } = ABOUT_ME;
  const [openCaption, setOpenCaption] = useState(null);

  return (
    <div className="relative flex flex-col py-8 w-full">
      <div className="px-4">
        <SectionTitle english={titleEn} chinese={titleZh} />
      </div>

      <div className="mt-6 px-4 flex flex-col gap-4">
        <p className="text-sm font-sh leading-relaxed" lang="zh-CN" translate="no">
          {blurbZh}
        </p>
        <p className="text-base leading-snug bodoni-small">{blurbEn}</p>
      </div>

      <div className="mt-10 px-4 flex flex-col gap-4">
        {affiliations.map((item) => {
          const open = openCaption === item.primary;
          return (
            <button
              key={item.primary}
              type="button"
              onClick={() =>
                setOpenCaption((cur) =>
                  cur === item.primary ? null : item.primary,
                )
              }
              className="flex items-center gap-3 bg-transparent p-0 text-left text-inherit"
            >
              <img
                src={item.logo}
                alt=""
                className="h-5 w-5 object-contain shrink-0"
              />
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="text-sm leading-none bodoni-small">
                  {item.primary}
                </span>
                {item.caption ? (
                  <span
                    className={`text-[10px] leading-none uppercase tracking-widest transition-opacity duration-200 ${
                      open ? "opacity-40" : "opacity-0"
                    }`}
                  >
                    {item.caption}
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AboutMeComponent;
