import { useState, useEffect, useCallback } from "react";
import { getCookie } from "../utils/getCookies";
import { useAuth } from "../contexts/AuthContext"; // Импортируем useAuth

const useFetchTeam = (apiUrl) => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth(); // Используем контекст аутентификации

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
        // Если получили 401, пробуем обновить токен через существующий интерцептор
        if (response.status === 401) {
          // Делаем повторный запрос - интерцептор автоматически обновит токен
          const retryResponse = await fetch(`${apiUrl}/users`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${getCookie("authTokenPM")}`,
              "Content-Type": "application/json",
            },
          });

          if (!retryResponse.ok) {
            const errorText = await retryResponse.text();
            throw new Error(
              `Ошибка HTTPS: ${retryResponse.status} - ${errorText}`
            );
          }

          const data = await retryResponse.json();
          setTeam(data.items);
          setError(null);
          return;
        }

        const errorText = await response.text();
        throw new Error(`Ошибка HTTPS: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
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

  // Упрощаем логику - загружаем данные когда пользователь аутентифицирован
  useEffect(() => {
    if (isAuthenticated) {
      fetchTeam();
    }
  }, [isAuthenticated, fetchTeam]);

  return { team, loading, error, refetch: fetchTeam };
};

export default useFetchTeam;
