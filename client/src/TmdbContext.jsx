import { createContext, useContext, useEffect, useState } from "react";
import { GalleryContext } from "./GalleryContext";

const TmdbContext = createContext([]);

export function TmdbProvider({ children }) {
  const { introReady } = useContext(GalleryContext);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!introReady) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/tmdb/rated");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) setItems(data);
      } catch {
        // keep empty list on failure
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [introReady]);

  return <TmdbContext.Provider value={items}>{children}</TmdbContext.Provider>;
}

export function useTmdb() {
  return useContext(TmdbContext);
}
