import { getCookie } from "../utils/getCookies";

const API_URL = import.meta.env.VITE_API_KEY;

export const fetchDirections = async (setDirection, setLoading, setError) => {
  try {
    const token = getCookie("authTokenPM");
    if (!token) {
      throw new Error("Токен авторизации отсутствует");
    }

    const response = await fetch(`${API_URL}/directions`, {
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
    setDirection(data.items);
    setLoading(false);
  } catch (err) {
    setError("Ошибка загрузки данных");
    console.error(err.message);
    setLoading(false);
  }
};
