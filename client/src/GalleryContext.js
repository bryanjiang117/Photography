import { createContext } from "react";

export const GalleryContext = createContext({
  showMexicoGallery: false,
  setShowMexicoGallery: () => {},
  showCanadaGallery: false,
  setShowCanadaGallery: () => {},
});
