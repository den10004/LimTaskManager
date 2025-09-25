import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { getCookie } from "../../utils/getCookies";
import { formatDate } from "../../utils/dateUtils";
import { fetchDirections } from "../../hooks/useFetchDirection";
import { useTeam } from "../../contexts/TeamContext";
import { taskStatus } from "../../utils/rolesTranslations";
import DateModal from "../../components/Modal/DateModal";
import { useAuth } from "../../contexts/AuthContext";
import Toast from "../../components/Toast";

const formStyle = {
  width: "100%",
  marginTop: "10px",
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
  const [isDragging, setIsDragging] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newDueDate, setNewDueDate] = useState("");
  const [dateLoading, setDateLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [toast, setToast] = useState({
    show: false,
    text: "",
    color: "",
  });

  const API_URL = import.meta.env.VITE_API_KEY;
  const { team } = useTeam();
  const { userData } = useAuth();
  const token = getCookie("authTokenPM");

  const getUserName = (userId) => {
    const foundUser = team.find((user) => user.id === userId);
    return foundUser ? foundUser.name : "Неизвестный пользователь";
  };

  const fetchTaskById = async (id) => {
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
        setToast({
          show: true,
          text: "Ошибка загрузки задачи",
          color: "red",
        });

        throw new Error("Ошибка загрузки задачи");
      }
      const data = await response.json();
      return data;
    } catch (err) {
      setToast({
        show: true,
        text: `Ошибка загрузки задачи: ${err.message}`,
        color: "red",
      });
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
        setSelectedStatus(
          taskData.status && taskStatus.includes(taskData.status)
            ? taskData.status
            : ""
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadTask();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      setFiles(Array.from(droppedFiles));
    }
  }, []);

  const handleAreaClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const AddComments = async (e) => {
    e.preventDefault();
    setCommentLoading(true);
    setError("");

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
    navigate("/task");
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

  const updateStatus = async (id) => {
    if (!selectedStatus) {
      setError("Выберите статус");
      return;
    }

    setError("");
    setStatusLoading(true);

    if (!token) {
      setError("Токен авторизации отсутствует");
      setStatusLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/task/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: selectedStatus }),
      });

      if (!response.ok) {
        throw new Error("Ошибка обновления статуса");
      }

      const updatedTask = await response.json();
      setTask((prevTask) => ({
        ...prevTask,
        status: updatedTask.status,
      }));
    } catch (err) {
      console.error(err);
      setError("Ошибка обновления статуса: " + err.message);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleInputChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleStatusSubmit = (e) => {
    e.preventDefault();
    updateStatus(id);
  };

  const updateDueDate = async (newDueDate) => {
    if (!newDueDate) {
      setError("Выберите дату и время");
      return;
    }
    setError("");
    setDateLoading(true);

    if (!token) {
      setError("Токен авторизации отсутствует");
      setDateLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/task/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deadline: newDueDate }),
      });

      if (!response.ok) {
        throw new Error("Ошибка обновления срока выполнения");
      }

      const updatedTask = await response.json();
      setTask((prevTask) => ({
        ...prevTask,
        due_at: updatedTask.due_at || updatedTask.deadline,
        status: updatedTask.status,
      }));
      if (updatedTask.status) {
        setSelectedStatus(updatedTask.status);
      }

      setShowDatePicker(false);
      setNewDueDate("");
    } catch (err) {
      console.error(err);
      setError("Ошибка обновления срока выполнения: " + err.message);
    } finally {
      setDateLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const isConfirmed = window.confirm(
      `Вы уверены, что хотите удалить задачу "${task.title || "без названия"}"?`
    );

    if (isConfirmed) {
      try {
        const token = getCookie("authTokenPM");
        if (!token) {
          throw new Error("Токен авторизации отсутствует");
        }

        const response = await fetch(`${API_URL}/task/${taskId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`${response.status}`);
        }
        window.location.href = "/task";
      } catch (err) {
        console.error("Ошибка при удалении задачи:", err.message);
        setToast({
          show: true,
          text: "Не удалось удалить задачу",
          color: "red",
        });
      }
    }
  };

  return (
    <div className="container">
      <button style={{ background: "transparent" }} onClick={handleBack}>
        ← Назад
      </button>

      {loading ? (
        <div className="loading">Загрузка данных...</div>
      ) : error ? (
        <div className="error error-message">{error}</div>
      ) : task ? (
        <>
          <h3 className="h3-mtmb">
            Задача #{task.id} - {task.title || "Не указано"}
          </h3>
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
                <b>Ответственный:</b> {getUserName(task.assigned_user_id)}
              </li>
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <b>Срок выполнения:&nbsp;</b>
                {formatDate(task.due_at) || "Не указано"}&nbsp;&nbsp;
                <button
                  className="create-btn"
                  onClick={() => setShowDatePicker(true)}
                >
                  Изменить
                </button>
              </li>
              <li>
                <b>Направление:</b> {getDirectionName(task.direction_id)}
              </li>
              <li>
                <b>Описание:</b> {task.description || "Не указано"}
              </li>
              <li style={{ display: "flex" }}>
                <b>Важность:&nbsp;</b>
                <div
                  style={{
                    color:
                      task.urgency <= 2
                        ? "var(--color-green)"
                        : task.urgency === 3
                        ? "orange"
                        : "var(--color-err)",
                  }}
                >
                  {"★".repeat(task.urgency) + "☆".repeat(5 - task.urgency)}
                </div>
              </li>

              {task.links && (
                <li style={{ display: "flex" }}>
                  <b>Ссылки:&nbsp;</b>
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

              <li>
                <form
                  onSubmit={handleStatusSubmit}
                  style={{
                    ...formStyle,
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <label htmlFor="status">
                    <b>Статус:&nbsp;</b>
                  </label>
                  <select
                    className="select-status"
                    id="status"
                    name="status"
                    value={selectedStatus}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Выберите статус</option>
                    {taskStatus
                      .filter((status) => {
                        if (
                          status === "В работе" &&
                          userData?.id != task?.assigned_user_id
                        ) {
                          return false;
                        }
                        return true;
                      })
                      .map((status, index) => (
                        <option key={index} value={status}>
                          {status}
                        </option>
                      ))}
                  </select>
                  <button
                    className="create-btn"
                    style={{ width: "200px" }}
                    disabled={statusLoading || !selectedStatus}
                  >
                    {statusLoading ? "Обновление..." : "Обновить статус"}
                  </button>
                </form>
              </li>
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
                <div style={{ margin: "10px 0 10px 0" }}>
                  {task.comments && task.comments.length > 0 ? (
                    task.comments.map((comment, index) => (
                      <div key={index} style={commentsWrap}>
                        <div>{comment.text || "Комментарий отсутствует"}</div>
                        <div style={comments}>
                          <b>{getUserName(comment.user_id)},&nbsp;</b>
                          <b>Дата создания:&nbsp;</b>
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
                style={formStyle}
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={commentLoading}
                required
              />
              <button
                className="create-btn"
                style={{ width: "250px", marginTop: "10px" }}
                disabled={commentLoading || comment.length === 0}
              >
                {commentLoading ? "Отправка..." : "Создать комментарий"}
              </button>
            </form>

            <form onSubmit={uploadFiles} style={formStyle}>
              <div className="create__block">
                <div className="label">Файлы</div>
                <div
                  className={`file-upload ${
                    isDragging ? "file-upload--dragging" : ""
                  }`}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleAreaClick}
                  style={{
                    cursor: "pointer",
                    border: isDragging
                      ? "2px dashed #3b82f6"
                      : "2px dashed #d1d5db",
                    backgroundColor: isDragging ? "#f0f9ff" : "transparent",
                    transition: "all 0.2s ease",
                  }}
                >
                  <img src="/files.svg" alt="загрузка файлов" />
                  <div>
                    Перетащите файл сюда или&nbsp;
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      загрузите
                    </a>
                  </div>{" "}
                  {/*
                  <span
                    style={{
                      margin: "0 auto",
                      color: "rgba(156, 163, 175, 1)",
                      fontSize: "14px",
                    }}
                  >
                    Поддержка нескольких типов файлов
                  </span>
*/}
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="files"
                    name="files"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </div>
                {files.length > 0 && (
                  <div style={{ marginTop: "10px" }}>
                    Выбрано файлов: {files.length}
                  </div>
                )}
              </div>
              <button
                className="create-btn"
                style={{ width: "200px", marginTop: "10px" }}
                disabled={fileLoading || files.length === 0}
              >
                {fileLoading ? "Загрузка..." : "Загрузить файлы"}
              </button>
            </form>
            {userData.roles.includes("admin") && (
              <button
                className="delete-btn"
                style={{ width: "200px", marginTop: "10px" }}
                onClick={() => handleDeleteTask(task.id)}
              >
                Удалить
              </button>
            )}
            {showDatePicker && (
              <DateModal
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onSave={updateDueDate}
                initialDate={newDueDate}
                loading={dateLoading}
              />
            )}
          </div>
        </>
      ) : (
        <div>Данные задачи отсутствуют</div>
      )}

      {toast.show && (
        <Toast
          text={toast.text}
          color={toast.color}
          onClose={() => setToast({ show: false, text: "", color: "" })}
        />
      )}
    </div>
  );
}

export default TaskDetails;
