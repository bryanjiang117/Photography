import { createContext, useContext, useEffect, useState } from "react";

const MalContext = createContext([]);

export function MalProvider({ children, initialData = [] }) {
  const [malData, setMalData] = useState(initialData);

  useEffect(() => {
    setMalData(initialData);
  }, [initialData]);

  return <MalContext.Provider value={malData}>{children}</MalContext.Provider>;
}

export function useMal() {
  return useContext(MalContext);
}
