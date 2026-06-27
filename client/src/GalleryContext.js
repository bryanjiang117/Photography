import { createContext } from "react";

export const GalleryContext = createContext({
  introReady: false,
  showMexicoGallery: false,
  setShowMexicoGallery: () => {},
  showCanadaGallery: false,
  setShowCanadaGallery: () => {},
  showChinaGallery: false,
  setShowChinaGallery: () => {},
  showJapanGallery: false,
  setShowJapanGallery: () => {},
});
