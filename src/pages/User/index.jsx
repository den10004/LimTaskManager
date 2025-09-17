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
  const [filteredTasks, setFilteredTasks] = useState([]);
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

  const fetchTasks = async (newOffset, newLimit, fetchAll = false) => {
    try {
      const token = getCookie("authTokenPM");
      if (!token) {
        throw new Error("Токен авторизации отсутствует");
      }

      const url = `${API_URL}/task?limit=${newLimit}&offset=${newOffset}`;

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

      setTasks((prevTasks) => {
        const existingIds = new Set(prevTasks.map((task) => task.id));
        const newTasks = data.items.filter((task) => !existingIds.has(task.id));
        return [...prevTasks, ...newTasks];
      });

      setHasMore(data.items.length === newLimit);
      setIsLoading(false);

      if (fetchAll && data.items.length === newLimit) {
        const nextOffset = newOffset + newLimit;
        fetchTasks(nextOffset, newLimit, true);
      }
    } catch (err) {
      console.error("Fetch error:", err.message);
      setError(`Ошибка загрузки данных: ${err.message}`);
      setIsLoading(false);
      setHasMore(false);
    }
  };

  useEffect(() => {
    fetchDirections(setDirections, setIsLoading, setError);
    fetchTasks(0, limit, searchName.trim() !== "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchName.trim() === "") {
      setFilteredTasks(tasks);
    } else {
      const lowerSearchName = searchName.toLowerCase();
      setFilteredTasks(
        tasks.filter((task) => {
          const user = team.find(
            (member) => member.id === task.assigned_user_id
          );
          return user?.name.toLowerCase().includes(lowerSearchName);
        })
      );
    }
  }, [searchName, tasks, team]);

  const handleLoadMore = () => {
    const newOffset = offset + 10;
    const newLimit = limit + 20;
    setOffset(newOffset);
    setLimit(newLimit);
    fetchTasks(newOffset, newLimit);
  };

  const handleSearch = (e) => {
    const newSearchName = e.target.value;
    setSearchName(newSearchName);
    setOffset(0);
    setLimit(20);
    setTasks([]);
    setFilteredTasks([]);
    setIsLoading(true);
    setHasMore(true);
    fetchTasks(0, 20, newSearchName.trim() !== "");
  };

  const handleSort = (direction) => {
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      const dateA = new Date(a.due_at);
      const dateB = new Date(b.due_at);
      return direction === "asc" ? dateA - dateB : dateB - dateA;
    });
    setFilteredTasks(sortedTasks);
    setSortDirection(direction);
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
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
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
      {hasMore && !loading && !error && !searchName.trim() && (
        <button className="create-btn" style={addBtn} onClick={handleLoadMore}>
          Загрузить ещё
        </button>
      )}
    </section>
  );
}

export default UserPage;
