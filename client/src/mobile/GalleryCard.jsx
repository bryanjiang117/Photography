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
            <span className="mb-0.5 text-xs bodoni-small uppercase tracking-[0.2em] opacity-50">
              View Gallery →
            </span>
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
