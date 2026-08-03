import { createContext, useContext, useEffect, useState } from "react";

const TmdbContext = createContext(null);

export function TmdbProvider({ children, initialData = null }) {
  const [items, setItems] = useState(initialData);

  useEffect(() => {
    setItems(initialData);
  }, [initialData]);

  return <TmdbContext.Provider value={items}>{children}</TmdbContext.Provider>;
}

export function useTmdb() {
  return useContext(TmdbContext);
}
