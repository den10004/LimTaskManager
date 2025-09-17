import { useState, useEffect, useCallback } from "react";
import { getCookie } from "../utils/getCookies";

const useFetchTeam = (apiUrl) => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(getCookie("authTokenPM"));
  const fetchTeam = useCallback(async () => {
    try {
      const currentToken = getCookie("authTokenPM");
      if (!currentToken) {
        setError("Токен авторизации отсутствует");
        return;
      }

      setLoading(true);
      const response = await fetch(`${apiUrl}/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${currentToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка HTTPS: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setTeam(data.items);
      setError(null);
    } catch (err) {
      setError("Ошибка загрузки данных");
      console.error("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentToken = getCookie("authTokenPM");
      if (currentToken !== token) {
        setToken(currentToken);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchTeam();
    }
  }, [token, fetchTeam]);

  return { team, loading, error, refetch: fetchTeam };
};

export default useFetchTeam;
