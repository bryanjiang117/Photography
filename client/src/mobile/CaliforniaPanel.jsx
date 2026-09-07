import { useContext } from "react";
import { GalleryContext } from "../GalleryContext";
import GalleryCard from "./GalleryCard";
import CaliforniaColorField from "../components/CaliforniaColorField";

const CaliforniaPanel = () => {
  const { showCaliforniaGallery, setShowCaliforniaGallery } =
    useContext(GalleryContext);

  return (
    <GalleryCard
      bgColor=""
      image={
        <CaliforniaColorField
          gap="0.5rem"
          gapClassName="gap-2"
          className="absolute inset-0"
          hidden={showCaliforniaGallery}
        />
      }
      title="加州"
      titleLang="zh-CN"
      subtitle="California"
      onClick={() => setShowCaliforniaGallery(true)}
    />
  );
};

export default CaliforniaPanel;
