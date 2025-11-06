import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { json } from "../utils/apiClient";

const useFetchTeam = (apiUrl) => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const fetchTeam = useCallback(async () => {
    try {
      setLoading(true);
      const data = await json(`${apiUrl}/users`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      setTeam(data.items);
      setError(null);
    } catch (err) {
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        setError("Сессия истекла. Пожалуйста, войдите снова.");
      } else {
        setError("Ошибка загрузки данных");
      }
      console.error("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTeam();
    }
  }, [isAuthenticated, fetchTeam]);

  return { team, loading, error, refetch: fetchTeam };
};

export default useFetchTeam;
