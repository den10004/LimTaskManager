import { useState, useEffect } from "react";
import { getCookie } from "../../utils/getCookies";
import TaskTableRow from "../../components/TaskTableRow";
//import useFetchTeam from "../../hooks/useFetchTeam";
import { useTeam } from "../../contexts/TeamContext";
import { fetchDirections } from "../../hooks/useFetchDirection";
import "./style.css";

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

  //const { team } = useFetchTeam(API_URL);
  const { team } = useTeam();

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
                <th>Дата окончания</th>
                <th>Направление</th>
                <th>Описание</th>
                <th>Текст</th>
                <th>Статус</th>
                {/*
                <th>Ссылки</th>*/}
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
