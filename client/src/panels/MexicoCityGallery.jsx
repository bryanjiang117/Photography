import { useContext, useEffect } from "react";
import { GalleryContext } from "../GalleryContext";
import { MEXICO_GALLERY_PHOTOS, MEXICO_ITEMS } from "../constants/data";
import DesktopGallery from "../components/DesktopGallery";
import { warmGalleryRegion } from "../galleryPrefetch";

export default function MexicoCityGallery({ entrance = true, slide = true }) {
  const { setShowMexicoGallery } = useContext(GalleryContext);

  useEffect(() => {
    warmGalleryRegion("mexico", MEXICO_GALLERY_PHOTOS, { concurrency: 5 });
  }, []);

  return (
    <DesktopGallery
      region="mexico"
      items={MEXICO_ITEMS}
      photos={MEXICO_GALLERY_PHOTOS}
      titleZh="墨西哥城"
      titleEn="Mexico City"
      onBack={() => setShowMexicoGallery(false)}
      bgClass="bg-mexico-primary"
      entrance={entrance}
      slide={slide}
    />
  );
}
