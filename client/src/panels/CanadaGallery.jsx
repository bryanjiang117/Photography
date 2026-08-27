import { useContext, useEffect } from "react";
import { GalleryContext } from "../GalleryContext";
import { CANADA_GALLERY_PHOTOS, CANADA_ITEMS } from "../constants/data";
import DesktopGallery from "../components/DesktopGallery";
import { warmGalleryRegion } from "../galleryPrefetch";

export default function CanadaGallery({ entrance = true, slide = true }) {
  const { setShowCanadaGallery } = useContext(GalleryContext);

  useEffect(() => {
    warmGalleryRegion("canada", CANADA_GALLERY_PHOTOS, { concurrency: 5 });
  }, []);

  return (
    <DesktopGallery
      region="canada"
      items={CANADA_ITEMS}
      photos={CANADA_GALLERY_PHOTOS}
      titleZh="加拿大"
      titleEn="CANADA"
      onBack={() => setShowCanadaGallery(false)}
      bgClass="bg-canada-primary"
      entrance={entrance}
      slide={slide}
    />
  );
}
