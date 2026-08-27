import { useContext, useEffect } from "react";
import { GalleryContext } from "../GalleryContext";
import { CHINA_GALLERY_PHOTOS, CHINA_ITEMS } from "../constants/data";
import DesktopGallery from "../components/DesktopGallery";
import { warmGalleryRegion } from "../galleryPrefetch";

export default function ChinaGallery({ entrance = true, slide = true }) {
  const { setShowChinaGallery } = useContext(GalleryContext);

  useEffect(() => {
    warmGalleryRegion("china", CHINA_GALLERY_PHOTOS, { concurrency: 5 });
  }, []);

  return (
    <DesktopGallery
      region="china"
      items={CHINA_ITEMS}
      photos={CHINA_GALLERY_PHOTOS}
      titleZh="中国"
      titleEn="China"
      onBack={() => setShowChinaGallery(false)}
      bgClass="bg-china-primary"
      chromeClass="text-china-text-small"
      titleClass="text-china-text"
      backButtonClass="self-start cursor-pointer transition-colors duration-200 hover:text-china-text-small-hovered p-3 -m-3"
      virtualize
      overscan="300%"
      entrance={entrance}
      slide={slide}
    />
  );
}
