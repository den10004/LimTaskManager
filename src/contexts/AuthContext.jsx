/*import { createContext, useContext, useState, useEffect } from "react";
import { getCookie } from "../utils/getCookies";

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

      if (token && storedUserData) {
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

  const setCookie = (name, value, options = {}) => {
    const days = options.days || 7;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;

    let cookieString = `${name}=${encodeURIComponent(value)};${expires};path=/`;

    if (window.location.protocol === "https:") {
      cookieString += ";secure";
    }

    cookieString += ";samesite=lax";

    document.cookie = cookieString;
  };

  const login = (token, userData) => {
    setCookie("authTokenPM", token, { days: 7 });
    localStorage.setItem("userData", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUserData(userData);
  };

  const logout = () => {
    document.cookie =
      "authTokenPM=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
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
*/

import { createContext, useContext, useState, useEffect } from "react";
import { getCookie } from "../utils/getCookies";

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

    // Добавляем глобальный перехватчик ошибок
    setupErrorInterceptor();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = getCookie("authTokenPM");
      const storedUserData = localStorage.getItem("userData");

      if (token && storedUserData) {
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

  // Перехватчик ошибок API
  const setupErrorInterceptor = () => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        // Если получили 401 Unauthorized - разлогиниваем
        if (response.status === 401) {
          logout();
          throw new Error("Сессия истекла. Пожалуйста, войдите снова.");
        }

        return response;
      } catch (error) {
        if (
          error.message.includes("401") ||
          error.message.includes("Unauthorized")
        ) {
          logout();
        }
        throw error;
      }
    };
  };

  const setCookie = (name, value, options = {}) => {
    const days = options.days || 7;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;

    let cookieString = `${name}=${encodeURIComponent(value)};${expires};path=/`;

    if (window.location.protocol === "https:") {
      cookieString += ";secure";
    }

    cookieString += ";samesite=lax";

    document.cookie = cookieString;
  };

  const login = (token, userData) => {
    setCookie("authTokenPM", token, { days: 7 });
    localStorage.setItem("userData", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUserData(userData);
  };

  const logout = () => {
    document.cookie =
      "authTokenPM=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
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
