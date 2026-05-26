import { createContext, useContext, useEffect, useState } from "react";

const TmdbContext = createContext([]);

export function TmdbProvider({ children, initialData = [] }) {
  const [items, setItems] = useState(initialData);

  useEffect(() => {
    setItems(initialData);
  }, [initialData]);

  return <TmdbContext.Provider value={items}>{children}</TmdbContext.Provider>;
}

export function useTmdb() {
  return useContext(TmdbContext);
}
