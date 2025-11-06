import { useState, useEffect, useCallback } from "react";
import { API_URL } from "../utils/rolesTranslations";
import { json } from "../utils/apiClient";

const useUserFetch = (id) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!id) {
      setUser(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await json(`${API_URL}/users/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      setUser(data);
    } catch (err) {
      setError("Ошибка загрузки данных пользователя");
      console.error("Fetch error:", err.message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Запрос данных при изменении id или токена
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, error, isLoading };
};

export default useUserFetch;
