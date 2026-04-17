import GalleryCard from "./GalleryCard";

const CanadaPanel = () => {
  return (
    <GalleryCard
      bgColor="bg-canada-primary"
      image={
        <img
          src="/assets/photos/canada/rolling-hills.jpeg"
          alt=""
          className="absolute bottom-10 right-0 max-w-[85%] max-h-[80%] object-cover"
        />
      }
      title="加拿大"
      titleLang="zh-CN"
      subtitle="Canada"
      subtitleClassName="uppercase tracking-widest"
    />
  );
};

export default CanadaPanel;
