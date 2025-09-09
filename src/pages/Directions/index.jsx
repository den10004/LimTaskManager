import { useState, useEffect } from "react";
import "./style.css";
import { getCookie } from "../../utils/getCookies";

function Directions() {
  const [direction, setDirection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    const fetchTasks = async () => {
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

    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="container">
      <h3 className="h3-mtmb">Направления</h3>
      {loading ? (
        <div className="loading">Загрузка данных...</div>
      ) : error ? (
        <div className="error error-message">{error}</div>
      ) : (
        <div className="container-scroll">
          {direction.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Направления</th>
                </tr>
              </thead>
              <tbody>
                {direction.map((task) => (
                  <tr key={task.id}>
                    <td>{task.id}</td>
                    <td>{task.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="error error-message">
              Нет данных для отображения
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default Directions;
