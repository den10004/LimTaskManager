import { useState, useEffect } from "react";
import { getCookie } from "../../utils/getCookies";
import TaskTableRow from "../../components/TaskTableRow";
import { useTeam } from "../../contexts/TeamContext";
import { fetchDirections } from "../../hooks/useFetchDirection";

const addBtn = {
  display: "flex",
  margin: "30px auto",
};

function UserPage() {
  const [tasks, setTasks] = useState([]);
  const [directions, setDirections] = useState([]);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [hasMore, setHasMore] = useState(true);

  const API_URL = import.meta.env.VITE_API_KEY;

  const fetchTasks = async (newOffset, newLimit) => {
    try {
      const token = getCookie("authTokenPM");
      if (!token) {
        throw new Error("Токен авторизации отсутствует");
      }

      const response = await fetch(
        `${API_URL}/task?limit=${newLimit}&offset=${newOffset}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка HTTPS: ${response.status}`);
      }

      const data = await response.json();
      setTasks((prevTasks) => {
        const existingIds = new Set(prevTasks.map((task) => task.id));
        const newTasks = data.items.filter((task) => !existingIds.has(task.id));
        return [...prevTasks, ...newTasks];
      });
      setHasMore(data.items.length === newLimit);
      setIsLoading(false);
    } catch (err) {
      console.error(err.message);
      setError("Ошибка загрузки данных");
      setIsLoading(false);
      setHasMore(false);
    }
  };

  useEffect(() => {
    fetchDirections(setDirections, setIsLoading, setError);
    fetchTasks(offset, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = () => {
    const newOffset = offset + 10;
    const newLimit = limit + 20;
    setOffset(newOffset);
    setLimit(newLimit);
    fetchTasks(newOffset, newLimit);
  };
  const { team } = useTeam();

  const handleDeleteTask = async (taskId) => {
    try {
      const token = getCookie("authTokenPM");
      if (!token) {
        throw new Error("Токен авторизации отсутствует");
      }

      const response = await fetch(`${API_URL}/task/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка HTTPS: ${response.status}`);
      }
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error("Ошибка при удалении задачи:", err.message);
      alert("Не удалось удалить задачу");
    }
  };

  return (
    <section className="container">
      <h3 className="h3-mtmb">Список задач</h3>

      {loading ? (
        <div className="loading">Загрузка данных...</div>
      ) : error ? (
        <div className="error error-message">{error}</div>
      ) : (
        <div className="container-scroll">
          <table id="dataTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Назначил</th>
                <th>Назначено</th>
                <th>Дата создания</th>
                <th>Срок выполнения</th>
                <th>Направление</th>
                <th>Название</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody id="tableBody">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <TaskTableRow
                    key={task.id}
                    task={task}
                    directions={directions}
                    team={team}
                    onDelete={handleDeleteTask}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    Нет данных для отображения
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {hasMore && !loading && !error && (
        <button className="create-btn" style={addBtn} onClick={handleLoadMore}>
          Загрузить ещё
        </button>
      )}
    </section>
  );
}

export default UserPage;
