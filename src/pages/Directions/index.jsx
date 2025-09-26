import { useState, useEffect, useCallback } from "react";
import { getCookie } from "../../utils/getCookies";
import DirectionModal from "../../components/Modal/DirectionModal";
import { fetchDirections } from "../../hooks/useFetchDirection";
import { restrictedDirections } from "../../utils/rolesTranslations";
import { useAuth } from "../../contexts/AuthContext";
import "./style.css";

function Directions() {
  const { userData } = useAuth();
  const rolesUser = userData.roles.join("");

  const [directions, setDirections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [directionToEdit, setDirectionToEdit] = useState(null);

  const API_URL = import.meta.env.VITE_API_KEY;

  const loadDirections = useCallback(() => {
    fetchDirections(setDirections, setLoading, setError);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить это направление?"))
      return;

    try {
      const token = getCookie("authTokenPM");
      if (!token) throw new Error("Токен авторизации отсутствует");

      const response = await fetch(`${API_URL}/directions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok)
        throw new Error(`Ошибка при удалении: ${response.status}`);

      setDirections((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      console.error(err.message);
      setError("Ошибка при удалении направления");
      loadDirections();
    }
  };

  const handleEdit = (direction) => {
    setModalMode("edit");
    setDirectionToEdit(direction);
    setIsModalOpen(true);
  };

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
      setDirections((prev) => [...prev, newDirection]);
    } else {
      loadDirections();
    }
  };

  const handleDirectionEdited = (updatedDirection) => {
    if (updatedDirection) {
      setDirections((prev) =>
        prev.map((dir) =>
          dir.id === updatedDirection.id ? updatedDirection : dir
        )
      );
    } else {
      loadDirections();
    }
  };

  useEffect(() => {
    loadDirections();
  }, [loadDirections]);

  return (
    <section className="container">
      <h3 className="h3-mtmb">Направления</h3>

      {loading ? (
        <div className="loading">Загрузка данных...</div>
      ) : error ? (
        <div className="error error-message">{error}</div>
      ) : directions.length > 0 ? (
        <div className="container-scroll">
          <table>
            <thead>
              <tr>
                <th>Направления</th>
              </tr>
            </thead>
            <tbody>
              {directions.map((task) => (
                <tr key={task.id}>
                  <td style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ minWidth: "210px" }}>{task.name}</div>
                    {!restrictedDirections.includes(task.name) &&
                      rolesUser === "admin" && (
                        <div className="btns-direction">
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(task.id)}
                          >
                            Удалить
                          </button>
                          <button
                            className="change-btn"
                            onClick={() => handleEdit(task)}
                          >
                            Редактировать
                          </button>
                        </div>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="error error-message">Нет данных для отображения</div>
      )}

      {rolesUser === "admin" && (
        <button
          className="create-btn"
          style={{ marginTop: "20px" }}
          onClick={openModal}
        >
          Добавить
        </button>
      )}

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
