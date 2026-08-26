import { createContext } from "react";

export const GalleryContext = createContext({
  introReady: false,
  stripReady: false,
  showMexicoGallery: false,
  setShowMexicoGallery: () => {},
  showCanadaGallery: false,
  setShowCanadaGallery: () => {},
  showChinaGallery: false,
  setShowChinaGallery: () => {},
  showJapanGallery: false,
  setShowJapanGallery: () => {},
});
