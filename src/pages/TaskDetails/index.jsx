import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCookie } from "../../utils/getCookies";
import { formatDate } from "../../utils/dateUtils";

function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTaskById = async (id) => {
    const API_URL = import.meta.env.VITE_API_KEY;
    const token = getCookie("authTokenPM");
    if (!token) {
      throw new Error("Токен авторизации отсутствует");
    }

    try {
      const response = await fetch(`${API_URL}/task/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Ошибка загрузки задачи");
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error in fetchTaskById:", err);
      throw new Error("Ошибка загрузки задачи", err);
    }
  };

  useEffect(() => {
    const loadTask = async () => {
      try {
        setLoading(true);
        const taskData = await fetchTaskById(id);
        setTask(taskData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadTask();
    }
  }, [id]);

  const handleBack = () => {
    navigate("/user");
  };

  if (loading) {
    return (
      <div className="task-details-page">
        <div>Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-details-page">
        <button onClick={handleBack}>Назад</button>
        <div className="error">Ошибка: {error}</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="task-details-page">
        <button onClick={handleBack}>Назад</button>
        <div>Задача не найдена</div>
      </div>
    );
  }

  const normalizeLinks = (links) => {
    if (!links) return [];

    if (Array.isArray(links)) {
      return links;
    }

    if (typeof links === "string") {
      try {
        const parsed = JSON.parse(links);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.log(e);
        return links.split(",").map((link) => link.trim());
      }
    }

    return [String(links)];
  };

  return (
    <div>
      <button style={{ background: "transparent" }} onClick={handleBack}>
        ← Назад
      </button>
      <h3 class="h3-mtmb">Задача #{task.id}</h3>
      <div className="task-header">
        <ul
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <li className={`status-badge status-${task.status}`}>
            <b>Статус:</b> {task.status}
          </li>
          <li>
            <b>Пользователь:</b> {task.id}
          </li>
          <li>
            <b>Дата создания:</b> {formatDate(task.due_at)}
          </li>
          <li>
            <b>Описание:</b> {task.description}
          </li>
          <li>
            <b>Текст:</b> {task.title}
          </li>{" "}
          {task.links && (
            <li style={{ display: "flex" }}>
              <b>Ссылки: </b>
              <div style={{ marginLeft: "5px" }}>
                {normalizeLinks(task.links).map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginRight: "10px" }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default TaskDetails;
