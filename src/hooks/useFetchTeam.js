import { useState, useEffect } from "react";
import { getCookie } from "../utils/getCookies";

const useFetchTeam = (apiUrl) => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const token = getCookie("authTokenPM");
        if (!token) {
          throw new Error("Токен авторизации отсутствует");
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
        setLoading(false);
      } catch (err) {
        setError("Ошибка загрузки данных");
        console.error(err.message);
        setLoading(false);
      }
    };

    fetchTeam();
  }, [apiUrl]);

  return { team, loading, error };
};

export default useFetchTeam;
