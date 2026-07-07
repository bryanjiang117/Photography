import { useContext } from "react";
import { GalleryContext } from "../GalleryContext";
import PanelPreviewImage from "../components/PanelPreviewImage";
import GalleryCard from "./GalleryCard";

const ChinaPanel = () => {
  const { showChinaGallery, setShowChinaGallery } =
    useContext(GalleryContext);

  return (
    <GalleryCard
      bgColor="bg-china-primary"
      image={
        <PanelPreviewImage
          region="china"
          name="temple"
          className="absolute top-1/5 right-1/6 max-w-1/5 max-h-1/4 cursor-pointer"
          showGallery={showChinaGallery}
          clipHidden="inset(0 0 0 100%)"
          clipVisible="inset(0 0 0 0%)"
          onClick={() => setShowChinaGallery(true)}
        />
      }
      title="中国"
      titleLang="zh-CN"
      subtitle="China"
      onClick={() => setShowChinaGallery(true)}
    />
  );
};

export default ChinaPanel;
