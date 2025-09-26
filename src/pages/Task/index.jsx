import { useState, useEffect, useMemo, useCallback } from "react";
import { getCookie } from "../../utils/getCookies";
import TaskTableRow from "../../components/TaskTableRow";
import { useTeam } from "../../contexts/TeamContext";
import { fetchDirections } from "../../hooks/useFetchDirection";

const INITIAL_LIMIT = 20;
const addBtnStyle = { display: "flex", margin: "30px auto" };
const searchInputStyle = {
  marginBottom: "20px",
  padding: "8px",
  width: "100%",
};
const filtersContainerStyle = {
  marginBottom: "20px",
  display: "flex",
  gap: "15px",
  flexWrap: "wrap",
};
const filterLabelStyle = { display: "flex", alignItems: "center", gap: "5px" };
const sortButtonStyle = (active) => ({
  marginLeft: "5px",
  padding: "0",
  background: active ? "#ddd" : "transparent",
  border: "none",
  cursor: "pointer",
});

function Task() {
  const [allTasks, setAllTasks] = useState([]);
  const [directions, setDirections] = useState([]);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const [hasMore, setHasMore] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [sortDirection, setSortDirection] = useState(null);
  const [statusFilters, setStatusFilters] = useState({
    completed: true,
    overdue: true,
    assigned: true,
    work: true,
  });

  const API_URL = import.meta.env.VITE_API_KEY;
  const { team } = useTeam();

  const resetPagination = useCallback(() => {
    setOffset(0);
    setLimit(INITIAL_LIMIT);
  }, []);

  const fetchAllTasks = useCallback(async () => {
    try {
      const token = getCookie("authTokenPM");
      if (!token) throw new Error("Токен авторизации отсутствует");

      const response = await fetch(`${API_URL}/task`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);

      const data = await response.json();
      setAllTasks(data.items || []);
      setHasMore(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Ошибка загрузки данных: ${err.message}`);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchDirections(setDirections, setIsLoading, setError);
    fetchAllTasks();
  }, [fetchAllTasks]);

  // Фильтрация по статусу
  const statusFilteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      if (task.status === "Выполнена" && !statusFilters.completed) return false;
      if (task.status === "Просрочена" && !statusFilters.overdue) return false;
      if (task.status === "Ответственный назначен" && !statusFilters.assigned)
        return false;
      if (task.status === "В работе" && !statusFilters.work) return false;
      return true;
    });
  }, [allTasks, statusFilters]);

  // Фильтрация по поиску
  const searchFilteredTasks = useMemo(() => {
    if (!searchName.trim()) return statusFilteredTasks;
    const lowerSearch = searchName.toLowerCase();
    return statusFilteredTasks.filter((task) => {
      const user = team.find((m) => m.id === task.assigned_user_id);
      return user?.name.toLowerCase().includes(lowerSearch);
    });
  }, [statusFilteredTasks, searchName, team]);

  // Сортировка
  const sortedTasks = useMemo(() => {
    if (!sortDirection) return searchFilteredTasks;
    return [...searchFilteredTasks].sort((a, b) => {
      const dateA = new Date(a.due_at || 0);
      const dateB = new Date(b.due_at || 0);
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [searchFilteredTasks, sortDirection]);

  // Пагинация
  const displayedTasks = useMemo(() => {
    const result = sortedTasks.slice(0, offset + limit);
    setHasMore(sortedTasks.length > result.length);
    return result;
  }, [sortedTasks, offset, limit]);

  const handleLoadMore = () => {
    setOffset((prev) => prev + 10);
    setLimit((prev) => prev + 20);
  };

  const handleSearch = (e) => {
    setSearchName(e.target.value);
    resetPagination();
  };

  const handleSort = (direction) => {
    setSortDirection(direction);
    resetPagination();
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilters((prev) => ({ ...prev, [status]: !prev[status] }));
    resetPagination();
  };

  return (
    <section className="container">
      <h3 className="h3-mtmb">Список задач</h3>

      <input
        type="text"
        placeholder="Поиск по имени назначенного пользователя"
        value={searchName}
        onChange={handleSearch}
        style={searchInputStyle}
      />

      <div style={filtersContainerStyle}>
        {Object.entries(statusFilters).map(([key, value]) => {
          let label = "";
          switch (key) {
            case "completed":
              label = "Выполнена";
              break;
            case "overdue":
              label = "Просрочена";
              break;
            case "assigned":
              label = "Ответственный назначен";
              break;
            case "work":
              label = "В работе";
              break;
            default:
              break;
          }
          return (
            <label key={key} style={filterLabelStyle}>
              <input
                type="checkbox"
                checked={value}
                onChange={() => handleStatusFilterChange(key)}
              />
              {label}
            </label>
          );
        })}
      </div>

      {loading ? (
        <div className="loading">Загрузка данных...</div>
      ) : error ? (
        <div className="error error-message">{error}</div>
      ) : (
        <div className="container-scroll">
          <table id="dataTable">
            <thead>
              <tr>
                <th>Назначил</th>
                <th>Назначено</th>
                <th>Дата создания</th>
                <th style={{ display: "flex", alignItems: "center" }}>
                  Срок выполнения
                  <button
                    onClick={() => handleSort("asc")}
                    style={sortButtonStyle(sortDirection === "asc")}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleSort("desc")}
                    style={sortButtonStyle(sortDirection === "desc")}
                  >
                    ↓
                  </button>
                </th>
                <th>Направление</th>
                <th>Название</th>
                <th>Статус</th>
                <th>Важность</th>
              </tr>
            </thead>
            <tbody>
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
        <button style={addBtnStyle} onClick={handleLoadMore}>
          Загрузить ещё
        </button>
      )}
    </section>
  );
}

export default Task;
