import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { getCookie } from "../../utils/getCookies";
import TaskTableRow from "../../components/TaskTableRow";
import { useTeam } from "../../contexts/TeamContext";
import { fetchDirections } from "../../hooks/useFetchDirection";
import {
  API_URL,
  ASSIGNED,
  COMPLETED,
  OVERDUE,
  PAGE_SIZE,
  WORK,
} from "../../utils/rolesTranslations";
import "./style.css";

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
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [sortDirection, setSortDirection] = useState(null);
  const [statusFilters, setStatusFilters] = useState({
    completed: true,
    overdue: true,
    assigned: true,
    work: true,
  });

  const { team } = useTeam();
  const timerRef = useRef(null);

  const resetPagination = useCallback(() => {
    setVisibleCount(PAGE_SIZE);
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
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Ошибка загрузки данных: ${err.message}`);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  const updatePendingTasks = useCallback(async () => {
    try {
      const token = getCookie("authTokenPM");
      if (!token) {
        scheduleNextUpdate(900000);
        return;
      }

      const now = new Date().getTime(); // В мс
      const tasksToUpdate = allTasks.filter((task) => {
        if (task.status !== ASSIGNED) return false;
        const createdAt = new Date(task.created_at).getTime();
        const timeDiffMs = now - createdAt;
        const timeDiffSec = timeDiffMs / 1000;
        return task.notified_pending === 0 && timeDiffSec >= 86700;
      });

      if (tasksToUpdate.length === 0) {
        // Нет задач для обновления — планируем следующий вызов
        scheduleNextUpdate(900000);
        return;
      }

      // Получения обновлённых данных по задачам
      const updatedTasks = await Promise.all(
        tasksToUpdate.map(async (task) => {
          const response = await fetch(`${API_URL}/task/${task.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          if (!response.ok) return task;
          return await response.json();
        })
      );

      let hasChanges = false;
      const newTasks = allTasks.map((task) => {
        const updatedTask = updatedTasks.find((ut) => ut.id === task.id);
        if (
          updatedTask &&
          updatedTask.notified_pending !== task.notified_pending
        ) {
          hasChanges = true;
          return { ...task, notified_pending: updatedTask.notified_pending };
        }
        return task;
      });

      if (hasChanges) {
        setAllTasks(newTasks);
      }

      // Расчёт минимального время до следующего обновления
      let minRemainingMs = Infinity;
      allTasks.forEach((task) => {
        if (task.status === ASSIGNED && task.notified_pending === 0) {
          const createdAt = new Date(task.created_at).getTime();
          const timeDiffMs = now - createdAt;
          const remainingMs = 86700 * 1000 - timeDiffMs;
          if (remainingMs > 0) {
            minRemainingMs = Math.min(minRemainingMs, remainingMs);
          }
        }
      });

      // Следующий вызов: minRemaining + буфер (5 мин), min 1 мин, max 15 мин
      const nextTimeout = Math.max(
        60000,
        Math.min(
          900000,
          minRemainingMs === Infinity ? 900000 : minRemainingMs + 300000
        )
      );
      scheduleNextUpdate(nextTimeout);
    } catch (err) {
      console.error("Update tasks error:", err);
      scheduleNextUpdate(900000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTasks, API_URL]);

  const scheduleNextUpdate = (timeout) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(updatePendingTasks, timeout);
  };

  useEffect(() => {
    fetchDirections(setDirections, setIsLoading, setError);
    fetchAllTasks();
  }, [fetchAllTasks]);

  useEffect(() => {
    scheduleNextUpdate(0);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatePendingTasks]);

  // Фильтрация по статусу
  const statusFilteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      if (task.status === COMPLETED && !statusFilters.completed) return false;
      if (task.status === OVERDUE && !statusFilters.overdue) return false;
      if (task.status === ASSIGNED && !statusFilters.assigned) return false;
      if (task.status === WORK && !statusFilters.work) return false;
      return true;
    });
  }, [allTasks, statusFilters]);

  // Фильтрация по поиску
  const searchFilteredTasks = useMemo(() => {
    if (!searchName.trim()) return statusFilteredTasks;
    const lowerSearch = searchName.toLowerCase();
    return statusFilteredTasks.filter((task) => {
      const user = team.find((m) => m.id === task.assigned_user_id);
      const userName = user?.name.toLowerCase() || "";
      const taskTitle = task.title?.toLowerCase() || "";

      return userName.includes(lowerSearch) || taskTitle.includes(lowerSearch);
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
    const result = sortedTasks.slice(0, visibleCount);
    setHasMore(sortedTasks.length > result.length);
    return result;
  }, [sortedTasks, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
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
        placeholder="Поиск по имени ответственного и названию задачи"
        value={searchName}
        onChange={handleSearch}
        className="searchInputStyle"
      />

      <div className="filtersContainerStyle">
        {Object.entries(statusFilters).map(([key, value]) => {
          let label = "";
          switch (key) {
            case "completed":
              label = COMPLETED;
              break;
            case "overdue":
              label = OVERDUE;
              break;
            case "assigned":
              label = ASSIGNED;
              break;
            case "work":
              label = WORK;
              break;
            default:
              break;
          }
          return (
            <label key={key} className="filterLabelStyle">
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
                <th>Ответственный</th>
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
        <button className="addBtnStyle" onClick={handleLoadMore}>
          Загрузить ещё
        </button>
      )}
    </section>
  );
}

export default Task;
