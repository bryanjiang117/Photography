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
    <div className="relative min-h-0">
      <div className="flex flex-col">
        <section
          className={`relative aspect-3/4 max-h-[90vh] ${bgColor} ${onClick ? "cursor-pointer" : ""}`}
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
            <span className="text-sm bodoni-small uppercase tracking-widest opacity-80 mb-0.5">
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
