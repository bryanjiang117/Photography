import { useContext, useEffect } from "react";
import { GalleryContext } from "../GalleryContext";
import { JAPAN_GALLERY_PHOTOS, JAPAN_ITEMS } from "../constants/data";
import DesktopGallery from "../components/DesktopGallery";
import { warmGalleryRegion } from "../galleryPrefetch";

export default function JapanGallery({ entrance = true, slide = true }) {
  const { setShowJapanGallery } = useContext(GalleryContext);

  useEffect(() => {
    warmGalleryRegion("japan", JAPAN_GALLERY_PHOTOS, { concurrency: 5 });
  }, []);

  return (
    <DesktopGallery
      region="japan"
      items={JAPAN_ITEMS}
      photos={JAPAN_GALLERY_PHOTOS}
      titleZh="日本"
      titleEn="JAPAN"
      titleLang="jp"
      onBack={() => setShowJapanGallery(false)}
      bgClass="bg-japan-primary"
      virtualize
      overscan="300%"
      entrance={entrance}
      slide={slide}
    />
  );
}
