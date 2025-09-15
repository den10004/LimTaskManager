import { createContext, useContext } from "react";
import useFetchTeam from "../hooks/useFetchTeam";

const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
  const API_URL = import.meta.env.VITE_API_KEY;
  const { team, loading, error, refetch } = useFetchTeam(`${API_URL}`);

  return (
    <TeamContext.Provider value={{ team, loading, error, refetch }}>
      {children}
    </TeamContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTeam = () => useContext(TeamContext);
