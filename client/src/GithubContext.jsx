import { createContext, useContext, useEffect, useState } from "react";

const GithubContext = createContext(null);

export function GithubProvider({ children, initialData = null }) {
  const [repo, setRepo] = useState(initialData);

  useEffect(() => {
    setRepo(initialData);
  }, [initialData]);

  return (
    <GithubContext.Provider value={repo}>{children}</GithubContext.Provider>
  );
}

export function useGithub() {
  return useContext(GithubContext);
}
