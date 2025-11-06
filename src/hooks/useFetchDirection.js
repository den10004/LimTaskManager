import { API_URL } from "../utils/rolesTranslations";
import { json } from "../utils/apiClient";

export const fetchDirections = async (setDirection, setLoading, setError) => {
  try {
    const data = await json(`${API_URL}/directions`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    setDirection(data.items);
    setLoading(false);
  } catch (err) {
    setError("Ошибка загрузки данных");
    console.error(err.message);
    setLoading(false);
  }
};
