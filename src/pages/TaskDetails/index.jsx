import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCookie } from "../../utils/getCookies";
import { formatDate } from "../../utils/dateUtils";

const formStyle = {
  marginTop: "10px",
  width: "100%",
};
const formtext = {
  width: "100%",
};

const commentsWrap = {
  marginBottom: "15px",
  padding: "10px",
  backgroundColor: "#f5f5f5",
  borderRadius: "5px",
};

const comments = {
  fontSize: "12px",
  color: "#666",
  marginTop: "5px",
};

function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentLoading, setCommentLoading] = useState(false);

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
      console.error(err);
      throw new Error("Ошибка загрузки задачи", err);
    }
  };

  const AddComments = async (e) => {
    e.preventDefault();
    setCommentLoading(true);
    setError("");
    const API_URL = import.meta.env.VITE_API_KEY;
    const token = getCookie("authTokenPM");

    if (!token) {
      setError("Токен авторизации отсутствует");
      setCommentLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/task/${id}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: comment }),
      });

      if (!response.ok) {
        throw new Error("Ошибка добавления комментария");
      }

      const newComment = await response.json();

      setTask((prevTask) => ({
        ...prevTask,
        comments: [...prevTask.comments, newComment],
      }));

      setComment("");
    } catch (err) {
      console.error(err);
      setError("Ошибка добавления комментария");
    } finally {
      setCommentLoading(false);
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

      {loading ? (
        <div className="loading">Загрузка данных...</div>
      ) : error ? (
        <div className="error">Ошибка: {error}</div>
      ) : (
        <>
          <h3 className="h3-mtmb">Задача #{task.id}</h3>
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
              </li>
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
              <li style={{ display: "flex", flexDirection: "column" }}>
                <b>Комментарии: </b>
                <div style={{ marginLeft: "5px", marginTop: "10px" }}>
                  {task.comments && task.comments.length > 0 ? (
                    task.comments.map((comment, index) => (
                      <div key={index} style={commentsWrap}>
                        <div>{comment.text}</div>
                        <div style={comments}>
                          <b>Дата создания:</b> {formatDate(comment.created_at)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>Нет комментариев</div>
                  )}
                </div>
              </li>
            </ul>

            <form onSubmit={AddComments} style={formStyle}>
              <textarea
                style={formtext}
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={commentLoading}
                required
              />
              <button
                className="create-btn modal-button"
                style={{ width: "200px" }}
                disabled={commentLoading}
              >
                {commentLoading ? "Отправка..." : "Создать комментарий"}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default TaskDetails;
