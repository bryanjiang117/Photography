import { useContext } from "react";
import { GalleryContext } from "../GalleryContext";
import PanelPreviewImage from "../components/PanelPreviewImage";
import GalleryCard from "./GalleryCard";

const MexicoCityPanel = () => {
  const { showMexicoGallery, setShowMexicoGallery } =
    useContext(GalleryContext);

  return (
    <GalleryCard
      bgColor="bg-mexico-primary"
      image={
        <PanelPreviewImage
          region="mexico"
          name="orange-wall"
          className="absolute h-[80%]"
          showGallery={showMexicoGallery}
          clipHidden="inset(0 0 0 100%)"
          clipVisible="inset(0 0 0 0%)"
        />
      }
      title="墨西哥城"
      titleLang="zh-CN"
      subtitle="Mexico City"
      onClick={() => setShowMexicoGallery(true)}
    />
  );
};

export default MexicoCityPanel;
