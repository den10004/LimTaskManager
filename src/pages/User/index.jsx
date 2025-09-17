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
  const [allTasks, setAllTasks] = useState([]); // Все задачи
  const [displayedTasks, setDisplayedTasks] = useState([]); // Отображаемые задачи (с пагинацией)
  const [directions, setDirections] = useState([]);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [sortDirection, setSortDirection] = useState(null);

  const API_URL = import.meta.env.VITE_API_KEY;
  const { team } = useTeam();

  // Функция для загрузки ВСЕХ задач
  const fetchAllTasks = async () => {
    try {
      const token = getCookie("authTokenPM");
      if (!token) {
        throw new Error("Токен авторизации отсутствует");
      }

      const url = `${API_URL}/task`;

      const response = await fetch(url, {
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
      setAllTasks(data.items || []);
      setIsLoading(false);
      setHasMore(false); // Все задачи загружены
    } catch (err) {
      console.error("Fetch error:", err.message);
      setError(`Ошибка загрузки данных: ${err.message}`);
      setIsLoading(false);
      setHasMore(false);
    }
  };

  useEffect(() => {
    fetchDirections(setDirections, setIsLoading, setError);
    fetchAllTasks(); // Загружаем все задачи
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Эффект для фильтрации, сортировки и пагинации
  useEffect(() => {
    let result = allTasks;

    // Фильтрация по имени
    if (searchName.trim() !== "") {
      const lowerSearchName = searchName.toLowerCase();
      result = result.filter((task) => {
        const user = team.find((member) => member.id === task.assigned_user_id);
        return user?.name.toLowerCase().includes(lowerSearchName);
      });
    }

    // Сортировка
    if (sortDirection) {
      result = [...result].sort((a, b) => {
        const dateA = new Date(a.due_at || 0);
        const dateB = new Date(b.due_at || 0);
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      });
    }

    // Применяем пагинацию
    const paginatedResult = result.slice(0, offset + limit);
    setDisplayedTasks(paginatedResult);

    // Проверяем, есть ли еще задачи для загрузки
    setHasMore(result.length > paginatedResult.length);
  }, [allTasks, searchName, team, sortDirection, offset, limit]);

  const handleLoadMore = () => {
    setOffset((prevOffset) => prevOffset + 10);
    setLimit((prevLimit) => prevLimit + 20);
  };

  const handleSearch = (e) => {
    const newSearchName = e.target.value;
    setSearchName(newSearchName);
    setOffset(0);
    setLimit(20);
  };

  const handleSort = (direction) => {
    setSortDirection(direction);
    setOffset(0);
    setLimit(20);
  };

  return (
    <section className="container">
      <h3 className="h3-mtmb">Список задач</h3>
      <input
        type="text"
        placeholder="Поиск по имени назначенного пользователя"
        value={searchName}
        onChange={handleSearch}
        style={{ marginBottom: "20px", padding: "8px", width: "100%" }}
      />

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
                <th style={{ display: "flex", alignItems: "center" }}>
                  Срок выполнения
                  <button
                    onClick={() => handleSort("asc")}
                    style={{
                      marginLeft: "5px",
                      padding: "0px 0px 0px 0px",
                      background:
                        sortDirection === "asc" ? "#ddd" : "transparent",
                    }}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleSort("desc")}
                    style={{
                      marginLeft: "5px",
                      padding: "0px 0px 0px 0px",
                      background:
                        sortDirection === "desc" ? "#ddd" : "transparent",
                    }}
                  >
                    ↓
                  </button>
                </th>
                <th>Направление</th>
                <th>Название</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody id="tableBody">
              {displayedTasks.length > 0 ? (
                displayedTasks.map((task) => (
                  <TaskTableRow
                    key={task.id}
                    task={task}
                    directions={directions}
                    team={team}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
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
