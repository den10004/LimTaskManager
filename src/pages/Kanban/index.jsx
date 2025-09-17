import { useEffect, useState } from "react";
import { getCookie } from "../../utils/getCookies";
import "./style.css";

function Kanban() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEvents = async () => {
    const API_URL = import.meta.env.VITE_API_KEY;
    const token = getCookie("authTokenPM");
    if (!token) {
      setLoading(false);
      setError("Токен авторизации отсутствует");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/task`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Ошибка при загрузке задач");
      }
      const data = await response.json();
      setTasks(data.items || []);
      setLoading(false);
    } catch (error) {
      console.error("Error loading events:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Extract unique dates from created_at and due_at
  const getUniqueDates = () => {
    const dates = new Set();
    tasks.forEach((task) => {
      if (task.created_at)
        dates.add(new Date(task.created_at).toISOString().split("T")[0]);
      if (task.due_at)
        dates.add(new Date(task.due_at).toISOString().split("T")[0]);
    });
    return [...dates].sort();
  };

  const uniqueDates = getUniqueDates();

  // Calculate task spans for grid positioning
  const getTaskSpan = (task) => {
    if (!task.created_at || !task.due_at) return null;
    const startDate = new Date(task.created_at).toISOString().split("T")[0];
    const endDate = new Date(task.due_at).toISOString().split("T")[0];
    const startIndex = uniqueDates.indexOf(startDate) + 1; // +1 for grid column
    const endIndex = uniqueDates.indexOf(endDate) + 1;
    if (startIndex === -1 || endIndex === -1) return null;
    return { startIndex, span: endIndex - startIndex + 1, task };
  };

  const taskSpans = tasks.map(getTaskSpan).filter((span) => span !== null);

  if (loading) {
    return <div className="container">Загрузка...</div>;
  }

  if (error) {
    return <div className="container error">Ошибка: {error}</div>;
  }

  return (
    <section className="container">
      <h3 className="h3-mtmb">Доска</h3>
      <div className="kanban-board">
        <div className="date-header">
          {uniqueDates.map((date) => (
            <div key={date} className="date-column">
              {date}
            </div>
          ))}
        </div>
        <div
          className="task-grid"
          style={{
            gridTemplateColumns: `repeat(${uniqueDates.length}, 16rem)`,
          }}
        >
          {taskSpans.map(({ task, startIndex, span }, index) => (
            <a
              href={`/tasks/${task.id}`}
              key={task.id}
              target="_blank"
              rel="noopener noreferrer"
              className="task-bar"
              style={{
                gridColumn: `${startIndex} / span ${span}`,
                gridRow: index + 1,
              }}
            >
              <h5 className="task-title">{task.title}</h5>
              <p className="task-meta">
                {new Date(task.created_at).toLocaleDateString()} -{" "}
                {new Date(task.due_at).toLocaleDateString()}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Kanban;
