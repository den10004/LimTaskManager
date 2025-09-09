import { useState, useEffect } from "react";
import "./style.css";
import { getCookie } from "../../utils/getCookies";
import DirectionModal from "../../components/Modal/DirectionModal";

function Directions() {
  const [direction, setDirection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_KEY;

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

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleDirectionAdded = (newDirection, isOptimistic) => {
    if (isOptimistic && newDirection) {
      // Optimistic update: add the new direction to the state immediately
      setDirection((prev) => [...prev, newDirection]);
    } else if (!isOptimistic && newDirection) {
      // Replace temporary direction with server data
      fetchTasks(); // Refresh from server
    } else if (!isOptimistic && !newDirection) {
      // Revert optimistic update on error
      fetchTasks(); // Refresh to ensure correct state
    }
  };

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

      <button className="create-btn" onClick={openModal}>
        Добавить
      </button>

      <DirectionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onDirectionAdded={handleDirectionAdded}
      />
    </section>
  );
}

export default Directions;
