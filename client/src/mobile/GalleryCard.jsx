import { motion } from "motion/react";

const GalleryCard = ({
  bgColor,
  image,
  title,
  titleLang,
  subtitle,
  subtitleClassName = "",
  onClick,
}) => {
  return (
    <div className="relative w-full min-h-0">
      <div className="flex flex-col">
        <section
          className={`relative aspect-3/4 max-h-[90vh] w-full ${bgColor} ${onClick ? "cursor-pointer" : ""}`}
          onClick={onClick}
        >
          {image}
        </section>
        <div
          className={`px-4 py-3 ${onClick ? "cursor-pointer" : ""}`}
          onClick={onClick}
        >
          <div className="flex items-end justify-between">
            <div className="text-5xl font-tsm" lang={titleLang} translate="no">
              {title}
            </div>
            <div className="flex flex-col gap-1 mb-0.5">
              <span className="text-xs bodoni-small uppercase tracking-[0.2em] opacity-50">
                View Gallery →
              </span>
              <motion.div
                className="w-full h-px bg-gray-900 origin-left opacity-20"
                animate={{ scaleX: [0, 1, 1, 0], originX: [0, 0, 1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: [0.4, 0, 0.2, 1], times: [0, 0.4, 0.5, 0.9] }}
              />
            </div>
          </div>
          <span className={`text-sm bodoni-small ${subtitleClassName}`}>
            {subtitle}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;
