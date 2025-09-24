import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import useUserFetch from "../hooks/useUserFetch";

const UserContext = createContext();

export function UserProvider({ children }) {
  const { isAuthenticated, userData } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const { user, error } = useUserFetch(isAuthenticated ? userData?.id : null);

  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      setUserInfo(user);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      setUserInfo(null);
    }
  }, [isAuthenticated]);

  const value = {
    userInfo,
    error,
    isLoading: isAuthenticated && !userInfo && !error,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
