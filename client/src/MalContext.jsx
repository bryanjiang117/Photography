import { createContext, useContext, useEffect, useState } from "react";

const MalContext = createContext(null);

export function MalProvider({ children, initialData = null }) {
  const [malData, setMalData] = useState(initialData);

  useEffect(() => {
    setMalData(initialData);
  }, [initialData]);

  return <MalContext.Provider value={malData}>{children}</MalContext.Provider>;
}

export function useMal() {
  return useContext(MalContext);
}
