import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCookie } from "../../utils/getCookies";
import { formatDate } from "../../utils/dateUtils";
import { fetchDirections } from "../../hooks/useFetchDirection";

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
const taskHeader = {
  margin: "30px 0",
};

function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentLoading, setCommentLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [direction, setDirection] = useState([]);

  const API_URL = import.meta.env.VITE_API_KEY;

  const fetchTaskById = async (id) => {
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
      throw new Error(`Ошибка загрузки задачи: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchDirections(setDirection, setIsLoading, setError);
  }, []);

  useEffect(() => {
    const loadTask = async () => {
      try {
        setIsLoading(true);
        const taskData = await fetchTaskById(id);
        setTask(taskData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadTask();
    }
  }, [id]); // Добавляем id в зависимости

  const AddComments = async (e) => {
    e.preventDefault();
    setCommentLoading(true);
    setError("");
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
        comments: [...(prevTask?.comments || []), newComment],
      }));

      setComment("");
    } catch (err) {
      console.error(err);
      setError("Ошибка добавления комментария");
    } finally {
      setCommentLoading(false);
    }
  };

  const uploadFiles = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;

    setFileLoading(true);
    setError("");
    const token = getCookie("authTokenPM");

    if (!token) {
      setError("Токен авторизации отсутствует");
      setFileLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      files.forEach((file) => {
        formDataToSend.append("file", file);
      });

      const fileResponse = await fetch(`${API_URL}/task/${id}/files`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!fileResponse.ok) {
        throw new Error("Ошибка загрузки файлов");
      }

      const newFiles = await fileResponse.json();

      const normalizedFiles = Array.isArray(newFiles)
        ? newFiles
        : newFiles && newFiles.file
        ? [newFiles.file]
        : newFiles
        ? [newFiles]
        : [];

      setTask((prevTask) => ({
        ...prevTask,
        files: [...(prevTask?.files || []), ...normalizedFiles],
      }));

      setFiles([]);
    } catch (err) {
      console.error(err);
      setError("Ошибка загрузки файлов");
    } finally {
      setFileLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/user");
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
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
        console.error(e);
        return links.split(",").map((link) => link.trim());
      }
    }

    return [String(links)];
  };

  const getDirectionName = (direction_id) => {
    const foundDirection = direction.find((dir) => dir.id === direction_id);
    return foundDirection ? foundDirection.name : "Не указано";
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
      ) : task ? (
        <>
          <h3 className="h3-mtmb">Задача #{task.id}</h3>
          <div style={taskHeader}>
            <ul
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <li className={`status-badge status-${task.status || ""}`}>
                <b>Статус:</b> {task.status || "Не указано"}
              </li>
              <li>
                <b>Пользователь:</b> {task.id || "Не указано"}
              </li>
              <li>
                <b>Дата создания:</b> {formatDate(task.due_at) || "Не указано"}
              </li>
              <li>
                <b>Направление:</b> {getDirectionName(task.direction_id)}
              </li>
              <li>
                <b>Описание:</b> {task.description || "Не указано"}
              </li>
              <li>
                <b>Текст:</b> {task.title || "Не указано"}
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
              {task.files && (
                <li style={{ display: "flex" }}>
                  <b>Файлы: </b>
                  <div style={{ marginLeft: "5px", display: "flex" }}>
                    {task.files.map((file, index) => (
                      <div key={index} style={{ marginRight: "10px" }}>
                        <a
                          href={`${import.meta.env.VITE_API_KEY}${
                            file.file_url
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {file.file_name || "Файл без имени"}
                        </a>
                      </div>
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
                        <div>{comment.text || "Комментарий отсутствует"}</div>
                        <div style={comments}>
                          <b>Дата создания:</b>{" "}
                          {formatDate(comment.created_at) || "Не указано"}
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

            <form onSubmit={uploadFiles} style={formStyle}>
              <div className="create__block">
                <div className="label">Файлы</div>
                <div className="file-upload">
                  <img src="/files.svg" alt="загрузка файлов" />
                  <div>
                    Перетащите файлы сюда или&nbsp;
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById("files").click();
                      }}
                    >
                      загрузите
                    </a>
                    <input
                      type="file"
                      id="files"
                      name="files"
                      multiple
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </div>
                  <span
                    style={{
                      margin: "0 auto",
                      color: "rgba(156, 163, 175, 1)",
                      fontSize: "14px",
                    }}
                  >
                    Поддержка нескольких типов файлов
                  </span>
                </div>
                {files.length > 0 && (
                  <div style={{ marginTop: "10px" }}>
                    Выбрано файлов: {files.length}
                  </div>
                )}
              </div>
              <button
                className="create-btn modal-button"
                style={{ width: "200px", marginTop: "10px" }}
                disabled={fileLoading || files.length === 0}
              >
                {fileLoading ? "Загрузка..." : "Загрузить файлы"}
              </button>
            </form>
          </div>
        </>
      ) : (
        <div>Данные задачи отсутствуют</div>
      )}
    </div>
  );
}

export default TaskDetails;
