import { useContext } from "react";
import { GalleryContext } from "../GalleryContext";
import PanelPreviewImage from "../components/PanelPreviewImage";
import GalleryCard from "./GalleryCard";

const JapanPanel = () => {
  const { showJapanGallery, setShowJapanGallery } =
    useContext(GalleryContext);

  return (
    <GalleryCard
      bgColor="bg-japan-primary"
      image={
        <PanelPreviewImage
          region="japan"
          name="flowers"
          className="absolute bottom-4 left-4 max-w-[50%] max-h-[75%] cursor-pointer"
          showGallery={showJapanGallery}
          clipHidden="inset(0 0 0 100%)"
          clipVisible="inset(0 0 0 0%)"
        />
      }
      title="日本"
      titleLang="jp"
      subtitle="Japan"
      onClick={() => setShowJapanGallery(true)}
    />
  );
};

export default JapanPanel;
