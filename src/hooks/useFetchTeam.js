import { useState, useEffect, useCallback } from "react";
import { getCookie } from "../utils/getCookies";

const useFetchTeam = (apiUrl) => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeam = useCallback(async () => {
    try {
      setLoading(true);
      const token = getCookie("authTokenPM");
      if (!token) {
        return;
        // throw new Error("Токен авторизации отсутствует");
      }

      const response = await fetch(`${apiUrl}/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка HTTPS: ${response.status}`);
      }

      const data = await response.json();
      setTeam(data.items);
      setError(null);
    } catch (err) {
      setError("Ошибка загрузки данных");
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  return { team, loading, error, refetch: fetchTeam };
};

export default useFetchTeam;
