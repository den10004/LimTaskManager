import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { json } from "../utils/apiClient";
import { isUnauthorized, parseError } from "../utils/errorUtils";

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
      setError(
        isUnauthorized(err)
          ? "Сессия истекла. Пожалуйста, войдите снова."
          : `Ошибка загрузки данных${parseError(err).message ? `: ${parseError(err).message}` : ""}`
      );
      console.error("Fetch error:", parseError(err).message);
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
