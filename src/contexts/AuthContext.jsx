import { createContext, useContext, useState, useEffect } from "react";
import { getCookie } from "../utils/getCookies";
import { API_URL } from "../utils/rolesTranslations";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = getCookie("authTokenPM");
      const storedUserData = localStorage.getItem("userData");
      const refreshT = getCookie("refreshToken");

      if (token && storedUserData && refreshT) {
        const userData = JSON.parse(storedUserData);
        setIsAuthenticated(true);
        setUserData(userData);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Removed global fetch override. Token refresh and retries handled in apiClient.

  const setCookie = (name, value, options = {}) => {
    const days = options.days || 7;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;

    let cookieString = `${name}=${encodeURIComponent(value)};${expires};path=/`;

    if (window.location.protocol === "https:") {
      cookieString += ";secure";
    }

    cookieString += ";samesite=strict";

    document.cookie = cookieString;
  };

  const login = (token, userData, refreshTokenParam = null) => {
    setCookie("authTokenPM", token, { days: 7 });
    localStorage.setItem("userData", JSON.stringify(userData));
    if (refreshTokenParam) {
      setCookie("refreshToken", refreshTokenParam, { days: 30 });
    }
    setIsAuthenticated(true);
    setUserData(userData);
  };

  const logout = () => {
    document.cookie =
      "authTokenPM=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
    document.cookie =
      "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
    localStorage.removeItem("userData");
    setIsAuthenticated(false);
    setUserData(null);
  };

  const value = {
    isAuthenticated,
    userData,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
