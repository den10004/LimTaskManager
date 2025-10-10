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
    setupErrorInterceptor();

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

  const performRefresh = async () => {
    try {
      const refreshT = getCookie("refreshToken");
      if (!refreshT) {
        throw new Error("No refresh token");
      }

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshT }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setCookie("authTokenPM", data.token, { days: 7 });
      if (data.refresh_token) {
        setCookie("refreshToken", data.refresh_token, { days: 30 });
      }
    } catch (error) {
      document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
      logout();
      throw error;
    }
  };

  const setupErrorInterceptor = () => {
    let currentRefreshPromise = null;
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        const url = args[0];
        const isRefreshRequest =
          typeof url === "string" && url.includes("/auth/refresh");

        if (response.status === 401 && !isRefreshRequest) {
          if (!currentRefreshPromise) {
            currentRefreshPromise = performRefresh();
          }

          try {
            await currentRefreshPromise;
          } catch {
            throw new Error("Сессия истекла. Пожалуйста, войдите снова.");
          } finally {
            currentRefreshPromise = null;
          }

          const newToken = getCookie("authTokenPM");
          const fetchUrl = args[0];
          let fetchOptions = args[1] || {};
          let headers = {};
          if (fetchOptions.headers) {
            if (fetchOptions.headers instanceof Headers) {
              headers = Object.fromEntries(fetchOptions.headers.entries());
            } else {
              headers = { ...fetchOptions.headers };
            }
          }
          headers.Authorization = `Bearer ${newToken}`;
          fetchOptions.headers = headers;

          const retryResponse = await originalFetch(fetchUrl, fetchOptions);
          if (retryResponse.status === 401) {
            logout();
            throw new Error("Сессия истекла. Пожалуйста, войдите снова.");
          }
          return retryResponse;
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
