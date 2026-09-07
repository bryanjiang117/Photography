import { useContext, useEffect } from "react";
import { GalleryContext } from "../GalleryContext";
import {
  CALIFORNIA_GALLERY_PHOTOS,
  CALIFORNIA_ITEMS,
} from "../constants/data";
import DesktopGallery from "../components/DesktopGallery";
import { warmGalleryRegion } from "../galleryPrefetch";

export default function CaliforniaGallery({ entrance = true, slide = true }) {
  const { setShowCaliforniaGallery } = useContext(GalleryContext);

  useEffect(() => {
    warmGalleryRegion("california", CALIFORNIA_GALLERY_PHOTOS, {
      concurrency: 5,
    });
  }, []);

  return (
    <DesktopGallery
      region="california"
      items={CALIFORNIA_ITEMS}
      photos={CALIFORNIA_GALLERY_PHOTOS}
      titleZh="加州"
      titleEn="CALIFORNIA"
      onBack={() => setShowCaliforniaGallery(false)}
      bgClass="bg-california-primary"
      virtualize
      overscan="300%"
      entrance={entrance}
      slide={slide}
    />
  );
}
