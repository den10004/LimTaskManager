import { useState, useEffect, useCallback } from "react";
import { getCookie } from "../utils/getCookies";

const useUserFetch = (id) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(getCookie("authTokenPM"));

  const fetchUser = useCallback(async () => {
    if (!id || !token) {
      setUser(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const API_URL = import.meta.env.VITE_API_KEY;
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка HTTPS: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError("Ошибка загрузки данных пользователя");
      console.error("Fetch error:", err.message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  // Обновление токена
  useEffect(() => {
    const interval = setInterval(() => {
      const currentToken = getCookie("authTokenPM");
      if (currentToken !== token) {
        setToken(currentToken);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [token]);

  // Запрос данных при изменении id или токена
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, error, isLoading };
};

export default useUserFetch;
