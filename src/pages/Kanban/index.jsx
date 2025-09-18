import { useEffect, useState, useRef } from "react";

import { getCookie } from "../../utils/getCookies";
import "./style.css";

function Kanban() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const boardRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - boardRef.current.offsetLeft);
    setScrollLeft(boardRef.current.scrollLeft);
    boardRef.current.style.cursor = "grabbing";
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      boardRef.current.style.cursor = "grab";
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    boardRef.current.style.cursor = "grab";
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - boardRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    boardRef.current.scrollLeft = scrollLeft - walk;
  };

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

  const getTaskSpan = (task) => {
    if (!task.created_at || !task.due_at) return null;
    const startDate = new Date(task.created_at).toISOString().split("T")[0];
    const endDate = new Date(task.due_at).toISOString().split("T")[0];
    const startIndex = uniqueDates.indexOf(startDate) + 1; // +1 for grid column
    const endIndex = uniqueDates.indexOf(endDate) + 1;
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex)
      return null;
    return { startIndex, span: endIndex - startIndex + 1, task };
  };

  const taskSpans = tasks
    .filter((task) => task.status !== "Задача выполнена")
    .map(getTaskSpan)
    .filter((span) => span !== null);

  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];

  const formattedDates = uniqueDates.map((date) => {
    const d = new Date(date);
    const day = d.getDate();
    const month = months[d.getMonth()];
    return `${day} ${month}`;
  });

  return (
    <section className="container">
      <h3 className="h3-mtmb">Доска</h3>

      {loading ? (
        <div className="loading">Загрузка данных...</div>
      ) : error ? (
        <div className="error error-message">{error}</div>
      ) : formattedDates ? (
        <div
          className="kanban-board"
          ref={boardRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div className="date-header">
            {formattedDates.map((date) => (
              <div key={date} className="date-column">
                {date}
              </div>
            ))}
          </div>
          <div
            className="task-grid"
            style={{
              gridTemplateColumns: `repeat(${uniqueDates.length}, 10rem)`,
            }}
          >
            {taskSpans.map(({ task, startIndex, span }, index) => {
              return (
                <a
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className={`task-bar ${
                    task.status === "Задача просрочена"
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                  style={{
                    gridColumn: `${startIndex} / ${startIndex + span}`,
                    gridRow: index + 1,
                  }}
                >
                  <h5 className="task-title">{task.title}</h5>
                </a>
              );
            })}
          </div>
        </div>
      ) : (
        <div>Данные задачи отсутствуют</div>
      )}
    </section>
  );
}

export default Kanban;
