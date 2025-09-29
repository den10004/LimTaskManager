import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCookie } from "../../utils/getCookies";
import { formatDate } from "../../utils/dateUtils";
import { fetchDirections } from "../../hooks/useFetchDirection";
import { useTeam } from "../../contexts/TeamContext";
import { taskStatus } from "../../utils/rolesTranslations";
import DateModal from "../../components/Modal/DateModal";
import { useAuth } from "../../contexts/AuthContext";
import Toast from "../../components/Toast";
import AddFiles from "../../components/AddFiles";

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
  },
  backButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    marginBottom: "20px",
  },
  taskTitle: {
    margin: "30px 0",
    color: "#333",
  },
  taskHeader: {
    margin: "30px 0",
  },
  form: {
    width: "100%",
    marginTop: "10px",
  },
  commentsWrap: {
    marginBottom: "15px",
    padding: "10px",
    backgroundColor: "#f5f5f5",
    borderRadius: "5px",
  },
  comments: {
    fontSize: "12px",
    color: "#666",
    marginTop: "5px",
  },
  flexColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  flexAlignCenter: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  flexCenter: {
    display: "flex",
    alignItems: "center",
  },
  taskInfoList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  statusForm: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  commentsSection: {
    margin: "10px 0",
  },
  commentsList: {
    margin: "10px 0",
  },
  fileUploadArea: {
    marginBottom: "15px",
  },
  fileDropZone: (isDragging) => ({
    cursor: "pointer",
    border: isDragging ? "2px dashed #3b82f6" : "2px dashed #d1d5db",
    backgroundColor: isDragging ? "#f0f9ff" : "transparent",
    transition: "all 0.2s ease",
    padding: "40px 20px",
    textAlign: "center",
    borderRadius: "8px",
  }),
  linksContainer: {
    marginLeft: "5px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  filesContainer: {
    marginLeft: "5px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  urgencyStars: {
    display: "flex",
    alignItems: "center",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    fontSize: "18px",
  },
  error: {
    color: "#dc2626",
    padding: "20px",
    background: "#fef2f2",
    borderRadius: "4px",
    margin: "20px 0",
  },
};

const MAX_URGENCY_STARS = 5;
const URGENCY_COLORS = {
  low: "var(--color-green)",
  medium: "orange",
  high: "var(--color-err)",
};

const TaskDetails = () => {
  const { id: taskId } = useParams();
  const navigate = useNavigate();
  const { team } = useTeam();
  const { userData } = useAuth();

  const [task, setTask] = useState(null);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [direction, setDirection] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newDueDate, setNewDueDate] = useState("");
  const [toast, setToast] = useState({ show: false, text: "", color: "" });

  const [loadings, setLoadings] = useState({
    comment: false,
    file: false,
    status: false,
    date: false,
    urgency: false,
  });

  const API_URL = import.meta.env.VITE_API_KEY;
  const token = getCookie("authTokenPM");

  const isAdmin = userData?.roles?.includes("admin");

  const userPermissions = useMemo(
    () => ({
      canEditUrgency: task?.created_by === userData?.id,
      canChangeStatus: userData?.id === task?.assigned_user_id,
      isAdmin: userData?.roles?.includes("admin"),
    }),
    [task, userData]
  );

  const filteredStatuses = useMemo(
    () =>
      taskStatus.filter(
        (status) =>
          status !== "В работе" || userData?.id === task?.assigned_user_id
      ),
    [task, userData]
  );

  const getUserName = useCallback(
    (userId) => {
      const user = team.find((user) => user.id === userId);
      return user?.name || "Неизвестный пользователь";
    },
    [team]
  );

  const getDirectionName = useCallback(
    (directionId) => {
      const directionItem = direction.find((dir) => dir.id === directionId);
      return directionItem?.name || "Не указано";
    },
    [direction]
  );

  const getUrgencyColor = useCallback((urgency) => {
    if (urgency <= 2) return URGENCY_COLORS.low;
    if (urgency === 3) return URGENCY_COLORS.medium;
    return URGENCY_COLORS.high;
  }, []);

  const normalizeLinks = useCallback((links) => {
    if (!links) return [];

    if (Array.isArray(links)) return links;

    if (typeof links === "string") {
      try {
        const parsed = JSON.parse(links);
        return Array.isArray(parsed) ? parsed : [links];
      } catch {
        return links.split(",").map((link) => link.trim());
      }
    }

    return [String(links)];
  }, []);

  const apiRequest = useCallback(
    async (endpoint, options = {}) => {
      if (!token) {
        throw new Error("Токен авторизации отсутствует");
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    [API_URL, token]
  );

  const fetchTask = useCallback(
    async (id) => {
      try {
        const taskData = await apiRequest(`/task/${id}`);
        setTask(taskData);
        setSelectedStatus(
          taskStatus.includes(taskData.status) ? taskData.status : ""
        );
      } catch (err) {
        console.error("Ошибка загрузки задачи:", err);
        setToast({ show: true, text: "Ошибка загрузки задачи", color: "red" });
        setError(err.message);
      }
    },
    [apiRequest]
  );

  const handleFileChange = useCallback((e) => {
    const newFiles = e.target.files;
    if (newFiles) {
      setFiles(Array.from(newFiles));
    }
  }, []);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoadings((prev) => ({ ...prev, comment: true }));

    try {
      const newComment = await apiRequest(`/task/${taskId}/comments`, {
        method: "POST",
        body: JSON.stringify({ text: comment.trim() }),
      });

      setTask((prev) => ({
        ...prev,
        comments: [...(prev?.comments || []), newComment],
      }));
      setComment("");
    } catch (err) {
      console.error(err);
      setToast({
        show: true,
        text: "Ошибка добавления комментария",
        color: "red",
      });
    } finally {
      setLoadings((prev) => ({ ...prev, comment: false }));
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;

    setLoadings((prev) => ({ ...prev, file: true }));

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("file", file));

      const response = await fetch(`${API_URL}/task/${taskId}/files`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Ошибка загрузки файлов");

      const newFiles = await response.json();
      const normalizedFiles = Array.isArray(newFiles)
        ? newFiles
        : newFiles?.file
        ? [newFiles.file]
        : newFiles
        ? [newFiles]
        : [];

      setTask((prev) => ({
        ...prev,
        files: [...(prev?.files || []), ...normalizedFiles],
      }));
      setFiles([]);
    } catch (err) {
      console.error(err);
      setToast({ show: true, text: "Ошибка загрузки файлов", color: "red" });
    } finally {
      setLoadings((prev) => ({ ...prev, file: false }));
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedStatus) return;

    setLoadings((prev) => ({ ...prev, status: true }));

    try {
      const updatedTask = await apiRequest(`/task/${taskId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: selectedStatus }),
      });

      setTask((prev) => ({ ...prev, status: updatedTask.status }));
    } catch (err) {
      console.error(err);
      setToast({ show: true, text: "Ошибка обновления статуса", color: "red" });
    } finally {
      setLoadings((prev) => ({ ...prev, status: false }));
    }
  };

  const handleUrgencyUpdate = async (newUrgency) => {
    setLoadings((prev) => ({ ...prev, urgency: true }));

    try {
      const updatedTask = await apiRequest(`/task/${taskId}/urgency`, {
        method: "PATCH",
        body: JSON.stringify({ urgency: newUrgency }),
      });

      setTask((prev) => ({ ...prev, urgency: updatedTask.urgency }));
      setToast({
        show: true,
        text: "Важность обновлена",
        color: "rgba(33, 197, 140, 1)",
      });
    } catch (err) {
      console.error(err);
      setToast({
        show: true,
        text: "Ошибка обновления важности",
        color: "red",
      });
    } finally {
      setLoadings((prev) => ({ ...prev, urgency: false }));
    }
  };

  const handleDateUpdate = async (date) => {
    if (!date) return;

    setLoadings((prev) => ({ ...prev, date: true }));

    try {
      const updatedTask = await apiRequest(`/task/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ deadline: date }),
      });

      setTask((prev) => ({
        ...prev,
        due_at: updatedTask.due_at || updatedTask.deadline,
        status: updatedTask.status || prev.status,
      }));

      if (updatedTask.status) {
        setSelectedStatus(updatedTask.status);
      }

      setShowDatePicker(false);
      setNewDueDate("");
    } catch (err) {
      console.error(err);
      setToast({ show: true, text: "Ошибка обновления срока", color: "red" });
    } finally {
      setLoadings((prev) => ({ ...prev, date: false }));
    }
  };

  const handleDeleteTask = async () => {
    const isConfirmed = window.confirm(
      `Удалить задачу "${task.title || "без названия"}"?`
    );

    if (!isConfirmed) return;

    try {
      await apiRequest(`/task/${taskId}`, { method: "DELETE" });
      navigate("/task", { replace: true });
    } catch (err) {
      console.error(err);
      setToast({ show: true, text: "Не удалось удалить задачу", color: "red" });
    }
  };

  useEffect(() => {
    fetchDirections(setDirection, setLoading, setError);
  }, []);

  useEffect(() => {
    if (taskId) {
      setLoading(true);
      fetchTask(taskId).finally(() => setLoading(false));
    }
  }, [taskId, fetchTask]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Загрузка данных...</div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => navigate("/task")}>
          ← Назад
        </button>
        <div style={styles.error}>{error || "Данные задачи отсутствуют"}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={() => navigate("/task")}>
        ← Назад
      </button>

      <h3 style={styles.taskTitle}>
        Задача #{task.id} - {task.title || "Не указано"}
      </h3>

      <div style={styles.taskHeader}>
        <TaskInfoSection
          isAdmin={isAdmin}
          task={task}
          getUserName={getUserName}
          getDirectionName={getDirectionName}
          formatDate={formatDate}
          normalizeLinks={normalizeLinks}
          userPermissions={userPermissions}
          getUrgencyColor={getUrgencyColor}
          loadings={loadings}
          onUrgencyChange={handleUrgencyUpdate}
          onDateChange={() => setShowDatePicker(true)}
        />

        <StatusUpdateSection
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          statuses={filteredStatuses}
          loading={loadings.status}
          onSubmit={handleStatusUpdate}
        />

        <CommentsSection
          comments={task.comments}
          getUserName={getUserName}
          formatDate={formatDate}
          comment={comment}
          onCommentChange={setComment}
          loading={loadings.comment}
          onSubmit={handleCommentSubmit}
        />

        <form onSubmit={handleFileUpload} style={styles.form}>
          <AddFiles formData={{ files }} handleFileChange={handleFileChange} />
          <button
            className="create-btn"
            style={{ width: "200px", marginTop: "10px" }}
            disabled={loadings.file || files.length === 0}
            type="submit"
          >
            {loadings.file ? "Загрузка..." : "Загрузить файлы"}
          </button>
        </form>

        {userPermissions.isAdmin && (
          <button
            className="delete-btn"
            style={{ width: "200px", marginTop: "10px" }}
            onClick={handleDeleteTask}
          >
            Удалить задачу
          </button>
        )}
      </div>

      <DateModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSave={handleDateUpdate}
        initialDate={newDueDate}
        loading={loadings.date}
      />

      <Toast
        text={toast.text}
        color={toast.color}
        onClose={() => setToast({ show: false, text: "", color: "" })}
      />
    </div>
  );
};

const TaskInfoSection = ({
  task,
  isAdmin,
  getUserName,
  getDirectionName,
  formatDate,
  normalizeLinks,
  userPermissions,
  getUrgencyColor,
  loadings,
  onUrgencyChange,
  onDateChange,
}) => (
  <ul style={styles.taskInfoList}>
    <li className={`status-badge status-${task.status || ""}`}>
      <b>Статус:</b> {task.status || "Не указано"}
    </li>

    <li>
      <b>Создатель:</b> {getUserName(task.created_by)}
    </li>
    <li>
      <b>Ответственный:</b> {getUserName(task.assigned_user_id)}
    </li>

    <li style={styles.flexAlignCenter}>
      <b>Срок выполнения:&nbsp;</b>
      {formatDate(task.due_at) || "Не указано"}&nbsp;&nbsp;
      {isAdmin && (
        <button className="create-btn" onClick={onDateChange}>
          Изменить
        </button>
      )}
    </li>

    <li>
      <b>Направление:</b> {getDirectionName(task.direction_id)}
    </li>
    <li>
      <b>Описание:</b> {task.description || "Не указано"}
    </li>

    <li style={styles.flexCenter}>
      <b>Важность:&nbsp;</b>
      <div style={styles.urgencyStars}>
        {[...Array(MAX_URGENCY_STARS)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= task.urgency;

          return (
            <span
              key={starValue}
              onClick={() =>
                userPermissions.canEditUrgency &&
                !loadings.urgency &&
                onUrgencyChange(starValue)
              }
              style={{
                cursor: userPermissions.canEditUrgency
                  ? loadings.urgency
                    ? "not-allowed"
                    : "pointer"
                  : "not-allowed",
                color: isFilled ? getUrgencyColor(task.urgency) : "#ddd",
                fontSize: "20px",
                marginRight: "2px",
                opacity: userPermissions.canEditUrgency
                  ? loadings.urgency
                    ? 0.6
                    : 1
                  : 0.6,
                transition: "all 0.2s ease",
              }}
              title={`Установить важность: ${starValue}`}
            >
              {isFilled ? "★" : "☆"}
            </span>
          );
        })}
      </div>
    </li>

    {task.links && (
      <li style={styles.flexCenter}>
        <b>Ссылки:&nbsp;</b>
        <div style={styles.linksContainer}>
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

    {task.files && task.files.length > 0 && (
      <li style={styles.flexCenter}>
        <b>Файлы: </b>
        <div style={styles.filesContainer}>
          {task.files.map((file, index) => (
            <div key={index} style={{ marginRight: "10px" }}>
              <a
                href={`${import.meta.env.VITE_API_KEY}${file.file_url}`}
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
  </ul>
);

const StatusUpdateSection = ({
  selectedStatus,
  onStatusChange,
  statuses,
  loading,
  onSubmit,
}) => (
  <form onSubmit={onSubmit} style={styles.statusForm}>
    <label htmlFor="status">
      <b>Статус:&nbsp;</b>
    </label>
    <select
      className="select-status"
      id="status"
      name="status"
      value={selectedStatus}
      onChange={(e) => onStatusChange(e.target.value)}
      required
      disabled={loading}
    >
      <option value="">Выберите статус</option>
      {statuses.map((status, index) => (
        <option key={index} value={status}>
          {status}
        </option>
      ))}
    </select>
    <button
      className="create-btn"
      style={{ width: "200px" }}
      disabled={loading || !selectedStatus}
      type="submit"
    >
      {loading ? "Обновление..." : "Обновить статус"}
    </button>
  </form>
);

const CommentsSection = ({
  comments,
  getUserName,
  formatDate,
  comment,
  onCommentChange,
  loading,
  onSubmit,
}) => (
  <div style={styles.commentsSection}>
    <b>Комментарии: </b>

    <div style={styles.commentsList}>
      {comments && comments.length > 0 ? (
        comments.map((commentItem, index) => (
          <div key={index} style={styles.commentsWrap}>
            <div>{commentItem.text || "Комментарий отсутствует"}</div>
            <div style={styles.comments}>
              <b>{getUserName(commentItem.user_id)},&nbsp;</b>
              <b>Дата создания:&nbsp;</b>
              {formatDate(commentItem.created_at) || "Не указано"}
            </div>
          </div>
        ))
      ) : (
        <div>Нет комментариев</div>
      )}
    </div>

    <form onSubmit={onSubmit} style={styles.form}>
      <textarea
        style={styles.form}
        type="text"
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder="Введите комментарий..."
        disabled={loading}
        required
      />
      <button
        className="create-btn"
        style={{ width: "250px", marginTop: "10px" }}
        disabled={loading || !comment.trim()}
        type="submit"
      >
        {loading ? "Отправка..." : "Добавить комментарий"}
      </button>
    </form>
  </div>
);

export default TaskDetails;
