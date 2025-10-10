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

const STATUS_CONFIG = {
  [COMPLETED]: { label: COMPLETED, key: "completed" },
  [OVERDUE]: { label: OVERDUE, key: "overdue" },
  [ASSIGNED]: { label: ASSIGNED, key: "assigned" },
  [WORK]: { label: WORK, key: "work" },
};

const SORT_DIRECTIONS = {
  ASC: "asc",
  DESC: "desc",
};

const UPDATE_TIMEOUTS = {
  MIN: 60000, // 1 минута
  MAX: 900000, // 15 минут
  BUFFER: 300000, // 5 минут
};

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
    [COMPLETED]: true,
    [OVERDUE]: true,
    [ASSIGNED]: true,
    [WORK]: true,
  });

  const { team } = useTeam();
  const timerRef = useRef(null);

  const resetPagination = useCallback(() => {
    setVisibleCount(PAGE_SIZE);
  }, []);

  const handleFetchError = useCallback((error) => {
    console.error("Fetch error:", error);
    const message = error.message.includes("Токен")
      ? "Ошибка авторизации"
      : `Ошибка загрузки данных: ${error.message}`;
    setError(message);
    setHasMore(false);
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
      handleFetchError(err);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL, handleFetchError]);

  const isTaskEligibleForUpdate = useCallback((task) => {
    const createdAt = new Date(task.created_at).getTime();
    const timeDiffSec = (Date.now() - createdAt) / 1000;
    return timeDiffSec >= 86700;
  }, []);

  const fetchUpdatedTasks = useCallback(
    async (tasks, token) => {
      return Promise.all(
        tasks.map(async (task) => {
          const response = await fetch(`${API_URL}/task/${task.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          return response.ok ? await response.json() : task;
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [API_URL]
  );

  const updateTasksState = useCallback(
    (updatedTasks) => {
      let hasChanges = false;
      const newTasks = allTasks.map((task) => {
        const updatedTask = updatedTasks.find((ut) => ut.id === task.id);
        if (updatedTask?.notified_pending !== task.notified_pending) {
          hasChanges = true;
          return { ...task, notified_pending: updatedTask.notified_pending };
        }
        return task;
      });

      if (hasChanges) setAllTasks(newTasks);
      return hasChanges;
    },
    [allTasks]
  );

  const calculateNextUpdateTimeout = useCallback((tasks) => {
    const now = Date.now();
    let minRemainingMs = Infinity;

    tasks.forEach((task) => {
      if (task.status === ASSIGNED && task.notified_pending === 0) {
        const createdAt = new Date(task.created_at).getTime();
        const timeDiffMs = now - createdAt;
        const remainingMs = 86700 * 1000 - timeDiffMs;

        if (remainingMs > 0) {
          minRemainingMs = Math.min(minRemainingMs, remainingMs);
        }
      }
    });

    return Math.max(
      UPDATE_TIMEOUTS.MIN,
      Math.min(
        UPDATE_TIMEOUTS.MAX,
        minRemainingMs === Infinity
          ? UPDATE_TIMEOUTS.MAX
          : minRemainingMs + UPDATE_TIMEOUTS.BUFFER
      )
    );
  }, []);

  const updatePendingTasks = useCallback(async () => {
    try {
      const token = getCookie("authTokenPM");
      if (!token) {
        scheduleNextUpdate(UPDATE_TIMEOUTS.MAX);
        return;
      }

      const pendingTasks = allTasks.filter(
        (task) =>
          task.status === ASSIGNED &&
          task.notified_pending === 0 &&
          isTaskEligibleForUpdate(task)
      );

      if (pendingTasks.length === 0) {
        scheduleNextUpdate(UPDATE_TIMEOUTS.MAX);
        return;
      }

      const updatedTasks = await fetchUpdatedTasks(pendingTasks, token);
      const hasChanges = updateTasksState(updatedTasks);

      if (hasChanges) {
        const nextTimeout = calculateNextUpdateTimeout(allTasks);
        scheduleNextUpdate(nextTimeout);
      } else {
        scheduleNextUpdate(UPDATE_TIMEOUTS.MAX);
      }
    } catch (err) {
      console.error("Update tasks error:", err);
      scheduleNextUpdate(UPDATE_TIMEOUTS.MAX);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    allTasks,
    API_URL,
    isTaskEligibleForUpdate,
    fetchUpdatedTasks,
    updateTasksState,
    calculateNextUpdateTimeout,
  ]);

  const scheduleNextUpdate = useCallback(
    (timeout) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(updatePendingTasks, timeout);
    },
    [updatePendingTasks]
  );

  useEffect(() => {
    fetchDirections(setDirections, setIsLoading, setError);
    fetchAllTasks();
  }, [fetchAllTasks]);

  useEffect(() => {
    scheduleNextUpdate(0);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scheduleNextUpdate]);

  // Исправленная фильтрация
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = allTasks.filter(
      (task) => statusFilters[task.status] ?? true
    );

    if (searchName.trim()) {
      const lowerSearch = searchName.toLowerCase();
      filtered = filtered.filter((task) => {
        const user = team.find((m) => m.id === task.assigned_user_id);
        return user?.name.toLowerCase().includes(lowerSearch);
      });
    }

    if (sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.due_at || 0);
        const dateB = new Date(b.due_at || 0);
        return sortDirection === SORT_DIRECTIONS.ASC
          ? dateA - dateB
          : dateB - dateA;
      });
    }

    return filtered;
  }, [allTasks, statusFilters, searchName, team, sortDirection]);

  // Пагинация
  const displayedTasks = useMemo(() => {
    const result = filteredAndSortedTasks.slice(0, visibleCount);
    setHasMore(filteredAndSortedTasks.length > visibleCount);
    return result;
  }, [filteredAndSortedTasks, visibleCount]);

  // Обработчики с сбросом пагинации
  const withPaginationReset = useCallback(
    (fn) =>
      (...args) => {
        fn(...args);
        resetPagination();
      },
    [resetPagination]
  );

  const handleSearch = withPaginationReset((e) => {
    setSearchName(e.target.value);
  });

  const handleSort = withPaginationReset((direction) => {
    setSortDirection(direction);
  });

  const handleStatusFilterChange = withPaginationReset((status) => {
    setStatusFilters((prev) => ({ ...prev, [status]: !prev[status] }));
  });

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  return (
    <section className="container">
      <h3 className="h3-mtmb">Список задач</h3>

      <input
        type="text"
        placeholder="Поиск по имени назначенного пользователя"
        value={searchName}
        onChange={handleSearch}
        className="searchInputStyle"
      />

      <div className="filtersContainerStyle">
        {Object.entries(STATUS_CONFIG).map(([status, { label }]) => (
          <label key={status} className="filterLabelStyle">
            <input
              type="checkbox"
              checked={statusFilters[status]}
              onChange={() => handleStatusFilterChange(status)}
            />
            {label}
          </label>
        ))}
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
                    onClick={() => handleSort(SORT_DIRECTIONS.ASC)}
                    style={sortButtonStyle(
                      sortDirection === SORT_DIRECTIONS.ASC
                    )}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleSort(SORT_DIRECTIONS.DESC)}
                    style={sortButtonStyle(
                      sortDirection === SORT_DIRECTIONS.DESC
                    )}
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
