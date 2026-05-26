import { createContext, useContext, useEffect, useState } from "react";
import { GalleryContext } from "./GalleryContext";

const MalContext = createContext([]);

export function MalProvider({ children }) {
  const { introReady } = useContext(GalleryContext);
  const [malData, setMalData] = useState([]);

  useEffect(() => {
    if (!introReady) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/mal/anime-list");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) setMalData(data);
      } catch {
        // keep empty list on failure
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [introReady]);

  return <MalContext.Provider value={malData}>{children}</MalContext.Provider>;
}

export function useMal() {
  return useContext(MalContext);
}
