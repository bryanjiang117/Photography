import GalleryCard from "./GalleryCard";

const JapanPanel = () => {
  return (
    <GalleryCard
      bgColor="bg-japan-primary"
      image={
        <img
          src="/assets/photos/japan/flowers.avif"
          alt=""
          className="absolute bottom-4 left-4 max-w-[50%] max-h-[75%] object-cover"
        />
      }
      title="日本"
      titleLang="jp"
      subtitle="Japan"
    />
  );
};

export default JapanPanel;
