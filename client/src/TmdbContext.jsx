import { createContext, useContext, useEffect, useState } from "react";

const TmdbContext = createContext([]);

export function TmdbProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
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
  }, []);

  return <TmdbContext.Provider value={items}>{children}</TmdbContext.Provider>;
}

export function useTmdb() {
  return useContext(TmdbContext);
}
