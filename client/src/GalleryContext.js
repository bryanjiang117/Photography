import { createContext } from "react";

export const GalleryContext = createContext({
  introReady: false,
  showMexicoGallery: false,
  setShowMexicoGallery: () => {},
  showCanadaGallery: false,
  setShowCanadaGallery: () => {},
  showJapanGallery: false,
  setShowJapanGallery: () => {},
});
