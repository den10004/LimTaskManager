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

const STATUS_LABELS = {
  completed: COMPLETED,
  overdue: OVERDUE,
  assigned: ASSIGNED,
  work: WORK,
};

const STATUS_MAP = {
  [COMPLETED]: "completed",
  [OVERDUE]: "overdue",
  [ASSIGNED]: "assigned",
  [WORK]: "work",
};

const UPDATE_CONFIG = {
  BUFFER_MS: 300000, // 5 минут
  MIN_TIMEOUT: 60000, // 1 минута
  MAX_TIMEOUT: 900000, // 15 минут
  PENDING_THRESHOLD_SEC: 86700, // ~24 часа - 5 минут
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
    completed: true,
    overdue: true,
    assigned: true,
    work: true,
  });

  const { team } = useTeam();
  const timerRef = useRef(null);

  // Вспомогательные функции
  const getStatusKey = useCallback((status) => {
    return STATUS_MAP[status] || "";
  }, []);

  const resetPagination = useCallback(() => {
    setVisibleCount(PAGE_SIZE);
  }, []);

  const getAuthToken = useCallback(() => getCookie("authTokenPM"), []);

  const fetchTaskData = useCallback(
    async (url, options = {}) => {
      const token = getAuthToken();
      if (!token) throw new Error("Токен авторизации отсутствует");

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }

      return await response.json();
    },
    [getAuthToken]
  );

  const isTaskPendingUpdate = useCallback((task, currentTime) => {
    if (task.status !== ASSIGNED || task.notified_pending !== 0) return false;

    const createdAt = new Date(task.created_at).getTime();
    const timeDiffSec = (currentTime - createdAt) / 1000;
    return timeDiffSec >= UPDATE_CONFIG.PENDING_THRESHOLD_SEC;
  }, []);

  const calculateNextUpdateTimeout = useCallback((tasks, currentTime) => {
    let minRemainingMs = Infinity;

    tasks.forEach((task) => {
      if (task.status === ASSIGNED && task.notified_pending === 0) {
        const createdAt = new Date(task.created_at).getTime();
        const timeDiffMs = currentTime - createdAt;
        const remainingMs =
          UPDATE_CONFIG.PENDING_THRESHOLD_SEC * 1000 - timeDiffMs;

        if (remainingMs > 0) {
          minRemainingMs = Math.min(minRemainingMs, remainingMs);
        }
      }
    });

    return Math.max(
      UPDATE_CONFIG.MIN_TIMEOUT,
      Math.min(
        UPDATE_CONFIG.MAX_TIMEOUT,
        minRemainingMs === Infinity
          ? UPDATE_CONFIG.MAX_TIMEOUT
          : minRemainingMs + UPDATE_CONFIG.BUFFER_MS
      )
    );
  }, []);

  const fetchAllTasks = useCallback(async () => {
    try {
      const data = await fetchTaskData(`${API_URL}/task`);
      setAllTasks(data.items || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Ошибка загрузки данных: ${err.message}`);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [fetchTaskData]);

  const updatePendingTasks = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        scheduleNextUpdate(UPDATE_CONFIG.MAX_TIMEOUT);
        return;
      }

      const now = new Date().getTime();
      const tasksToUpdate = allTasks.filter((task) =>
        isTaskPendingUpdate(task, now)
      );

      if (tasksToUpdate.length === 0) {
        scheduleNextUpdate(UPDATE_CONFIG.MAX_TIMEOUT);
        return;
      }

      // Обновление данных задач
      const updatedTasks = await Promise.all(
        tasksToUpdate.map((task) =>
          fetchTaskData(`${API_URL}/task/${task.id}`).catch(() => task)
        )
      );

      // Обновление состояния только если есть изменения
      const hasChanges = updatedTasks.some(
        (updatedTask, index) =>
          updatedTask.notified_pending !== tasksToUpdate[index].notified_pending
      );

      if (hasChanges) {
        const taskMap = new Map(updatedTasks.map((task) => [task.id, task]));
        const newTasks = allTasks.map((task) =>
          taskMap.has(task.id)
            ? {
                ...task,
                notified_pending: taskMap.get(task.id).notified_pending,
              }
            : task
        );
        setAllTasks(newTasks);
      }

      const nextTimeout = calculateNextUpdateTimeout(allTasks, now);
      scheduleNextUpdate(nextTimeout);
    } catch (err) {
      console.error("Update tasks error:", err);
      scheduleNextUpdate(UPDATE_CONFIG.MAX_TIMEOUT);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    allTasks,
    fetchTaskData,
    getAuthToken,
    isTaskPendingUpdate,
    calculateNextUpdateTimeout,
  ]);

  const scheduleNextUpdate = useCallback(
    (timeout) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
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
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [scheduleNextUpdate]);

  // Мемоизированные вычисления
  const statusFilteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      const statusKey = getStatusKey(task.status);
      return statusKey ? statusFilters[statusKey] : false;
    });
  }, [allTasks, statusFilters, getStatusKey]);

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

  const sortedTasks = useMemo(() => {
    if (!sortDirection) return searchFilteredTasks;

    return [...searchFilteredTasks].sort((a, b) => {
      const dateA = new Date(a.due_at || 0);
      const dateB = new Date(b.due_at || 0);
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [searchFilteredTasks, sortDirection]);

  const displayedTasks = useMemo(() => {
    const result = sortedTasks.slice(0, visibleCount);
    setHasMore(sortedTasks.length > result.length);

    return result;
  }, [sortedTasks, visibleCount]);

  // Обработчики событий
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  const handleSearch = (e) => {
    setSearchName(e.target.value);
    resetPagination();
  };

  const handleSort = (direction) => {
    setSortDirection((current) => (current === direction ? null : direction));
    resetPagination();
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilters((prev) => ({ ...prev, [status]: !prev[status] }));
    resetPagination();
  };

  const renderFilters = () => (
    <div className="filtersContainerStyle">
      {Object.entries(statusFilters).map(([key, value]) => (
        <label key={key} className="filterLabelStyle">
          <input
            type="checkbox"
            checked={value}
            onChange={() => handleStatusFilterChange(key)}
          />
          {STATUS_LABELS[key]}
        </label>
      ))}
    </div>
  );

  const renderTableHeader = () => (
    <thead>
      <tr>
        <th>Назначил</th>
        <th>Ответственный</th>
        {/*<th>Создано</th>*/}
        <th style={{ display: "flex", alignItems: "center" }}>
          Срок <br /> выполнения
          <button
            onClick={() => handleSort("asc")}
            style={sortButtonStyle(sortDirection === "asc")}
            aria-label="Сортировка по возрастанию"
          >
            ↑
          </button>
          <button
            onClick={() => handleSort("desc")}
            style={sortButtonStyle(sortDirection === "desc")}
            aria-label="Сортировка по убыванию"
          >
            ↓
          </button>
        </th>
        <th>Направление</th>
        <th style={{ width: "300px", minWidth: "300px", maxWidth: "300px" }}>
          Название
        </th>
        <th>Статус</th>
        <th>Приоритет</th>
      </tr>
    </thead>
  );

  const renderTableBody = () => (
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
  );

  const renderContent = () => {
    if (loading) {
      return <div className="loading">Загрузка данных...</div>;
    }

    if (error) {
      return <div className="error error-message">{error}</div>;
    }

    return (
      <div className="container-scroll">
        <table id="dataTable">
          {renderTableHeader()}
          {renderTableBody()}
        </table>
      </div>
    );
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
        aria-label="Поиск задач"
      />

      {renderFilters()}
      {renderContent()}

      {hasMore && !loading && !error && (
        <button className="addBtnStyle" onClick={handleLoadMore}>
          Загрузить ещё
        </button>
      )}
    </section>
  );
}

export default Task;
