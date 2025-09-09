import { useState, useEffect } from "react";
import "./style.css";
import { getCookie } from "../../utils/getCookies";
import DirectionModal from "../../components/Modal/DirectionModal";

function Directions() {
  const [direction, setDirection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [directionToEdit, setDirectionToEdit] = useState(null);

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

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Вы уверены, что хотите удалить это направление?"
    );
    if (!confirmDelete) {
      return;
    }

    try {
      const token = getCookie("authTokenPM");
      if (!token) {
        throw new Error("Токен авторизации отсутствует");
      }

      const response = await fetch(`${API_URL}/directions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка при удалении: ${response.status}`);
      }

      setDirection((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      setError("Ошибка при удалении направления");
      console.error(err.message);
      fetchTasks();
    }
  };

  const handleEdit = (direction) => {
    setModalMode("edit");
    setDirectionToEdit(direction);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = () => {
    setModalMode("add");
    setDirectionToEdit(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDirectionToEdit(null);
  };

  const handleDirectionAdded = (newDirection, isOptimistic) => {
    if (isOptimistic && newDirection) {
      setDirection((prev) => [...prev, newDirection]);
    } else if (!isOptimistic && newDirection) {
      fetchTasks();
    } else if (!isOptimistic && !newDirection) {
      fetchTasks();
    }
  };

  const handleDirectionEdited = (updatedDirection) => {
    if (updatedDirection) {
      setDirection((prev) =>
        prev.map((dir) =>
          dir.id === updatedDirection.id ? updatedDirection : dir
        )
      );
    } else {
      fetchTasks();
    }
  };

  const restrictedDirections = [
    "Дистрибуция",
    "Партнерская программа",
    "Строительство",
  ];

  return (
    <section className="container">
      <h3 className="h3-mtmb">Направления</h3>
      {loading ? (
        <div className="loading">Загрузка данных...</div>
      ) : error ? (
        <div className="error error-message">{error}</div>
      ) : (
        <div>
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
                    <td
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {task.name}
                      {!restrictedDirections.includes(task.name) && (
                        <div style={{ display: "flex", marginLeft: "auto" }}>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(task.id)}
                          >
                            Удалить
                          </button>
                          <button
                            style={{ marginLeft: "10px" }}
                            className="create-btn"
                            onClick={() => handleEdit(task)}
                          >
                            Исправить
                          </button>
                        </div>
                      )}
                    </td>
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
        onDirectionEdited={handleDirectionEdited}
        mode={modalMode}
        directionToEdit={directionToEdit}
      />
    </section>
  );
}

export default Directions;
