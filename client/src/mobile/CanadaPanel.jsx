import { useContext } from "react";
import { GalleryContext } from "../GalleryContext";
import PanelPreviewImage from "../components/PanelPreviewImage";
import GalleryCard from "./GalleryCard";

const CanadaPanel = () => {
  const { showCanadaGallery, setShowCanadaGallery } =
    useContext(GalleryContext);

  return (
    <GalleryCard
      bgColor="bg-canada-primary"
      image={
        <PanelPreviewImage
          region="canada"
          name="leaves-glow"
          size="sm"
          className="absolute top-1/5 right-1/6 max-w-1/5 max-h-1/4 cursor-pointer"
          showGallery={showCanadaGallery}
          clipHidden="inset(0 0 0 100%)"
          clipVisible="inset(0 0 0 0%)"
          onClick={() => setShowCanadaGallery(true)}
        />
      }
      title="加拿大"
      titleLang="zh-CN"
      subtitle="Canada"
      onClick={() => setShowCanadaGallery(true)}
    />
  );
};

export default CanadaPanel;
