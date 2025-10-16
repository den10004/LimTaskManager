import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCookie } from "../../utils/getCookies";
import { formatDate } from "../../utils/dateUtils";
import { fetchDirections } from "../../hooks/useFetchDirection";
import { useTeam } from "../../contexts/TeamContext";
import {
  API_URL,
  ASSIGNED,
  OVERDUE,
  statusColors,
  taskStatus,
  WORK,
} from "../../utils/rolesTranslations";
import { useAuth } from "../../contexts/AuthContext";
import Toast from "../../components/Toast";
import AddFiles from "../../components/AddFiles";
import CommentsSection from "../../components/Comments";
import EditModal from "../../components/Modal/EditModal";
import EditBtn from "../../components/UI/EditBtn";
import TaskInfoSection from "../../components/TaskInfoSection";

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
    padding: "0 0 10px 0",
  },

  form: {
    width: "100%",
    marginTop: "10px",
  },

  flexColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
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
  statusForm: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
};

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
  const [descriptionUpdate, setDescriptionUpdate] = useState(false);
  const [newDueDate, setNewDueDate] = useState("");
  const [toast, setToast] = useState({ show: false, text: "", color: "" });

  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const [loadings, setLoadings] = useState({
    comment: false,
    file: false,
    status: false,
    date: false,
    urgency: false,
    desc: false,
  });

  const token = getCookie("authTokenPM");

  const isAdmin = userData?.roles?.includes("Администратор");

  const userPermissions = useMemo(
    () => ({
      canEditUrgency: task?.created_by === userData?.id,
      canChangeStatus: userData?.id === task?.assigned_user_id,
      isAdmin: userData?.roles?.includes("Администратор"),
    }),
    [task, userData]
  );

  const filteredStatuses = useMemo(
    () =>
      taskStatus.filter((statusArray) => {
        const isOverdue = statusArray.includes(OVERDUE);
        if (isOverdue) return false;
        const hasWorkAccess =
          !statusArray.includes(WORK) ||
          userData?.id === task?.assigned_user_id;

        return hasWorkAccess;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [task, userData, taskStatus, WORK]
  );

  const getUserName = useCallback(
    (userId) => {
      const user = team.find((user) => user.id === userId);
      return user?.name || "Пользователь не указан";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        navigate("/task");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiRequest]
  );

  const handleFileChange = useCallback((e) => {
    const newFiles = e.target.files;

    if (!newFiles) {
      setFiles([]);
      return;
    }

    const newFilesArray = Array.from(newFiles);

    if (e.target.isRemoval) {
      setFiles(newFilesArray);
    } else {
      setFiles((prevFiles) => [...prevFiles, ...newFilesArray]);
    }
    if (e.target.type === "file") {
      e.target.value = "";
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
      setToast({
        show: true,
        text: "Комментарий добавлен",
        color: "rgba(33, 197, 140, 1)",
      });
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

  const commentDetele = async (commentId) => {
    const isConfirmed = window.confirm(
      "Вы уверены, что хотите удалить комментарий?"
    );

    if (!isConfirmed) {
      return;
    }
    try {
      await apiRequest(`/task/${taskId}/comments/${commentId}`, {
        method: "DELETE",
      });
      setTask((prev) => ({
        ...prev,
        comments: prev.comments.filter((comment) => comment.id !== commentId),
      }));

      setToast({
        show: true,
        text: "Комментарий удалён",
        color: "rgba(33, 197, 140, 1)",
      });
    } catch (err) {
      console.error(err);
      setToast({
        show: true,
        text: "Ошибка удаления комментария",
        color: "red",
      });
    }
  };

  const commentChange = async (commentId, newText) => {
    if (!newText.trim()) return;
    try {
      await apiRequest(`/task/${taskId}/comments/${commentId}`, {
        method: "PATCH",
        body: JSON.stringify({ text: newText.trim() }),
      });

      setTask((prev) => ({
        ...prev,
        comments: prev.comments.map((comment) =>
          comment.id === commentId
            ? { ...comment, text: newText.trim() }
            : comment
        ),
      }));

      setToast({
        show: true,
        text: "Комментарий отредактирован",
        color: "rgba(33, 197, 140, 1)",
      });
    } catch (err) {
      console.error(err);
      setToast({
        show: true,
        text: "Ошибка редактирования комментария",
        color: "red",
      });
    }
  };

  // Добавить в компонент TaskDetails
  const handleDeleteLink = async (linkId) => {
    const isConfirmed = window.confirm(
      "Вы уверены, что хотите удалить ссылку?"
    );

    if (!isConfirmed) return;

    try {
      await apiRequest(`/task/${taskId}/links/${linkId}`, {
        method: "DELETE",
      });

      setTask((prev) => ({
        ...prev,
        links: prev.links.filter((link) => link.id !== linkId),
      }));

      setToast({
        show: true,
        text: "Ссылка удалена",
        color: "rgba(33, 197, 140, 1)",
      });
    } catch (err) {
      console.error(err);
      setToast({
        show: true,
        text: "Ошибка удаления ссылки",
        color: "red",
      });
    }
  };

  const handleAddLink = async (url) => {
    if (!url.trim()) return;

    try {
      const newLink = await apiRequest(`/task/${taskId}/links`, {
        method: "POST",
        body: JSON.stringify({ url: url.trim() }),
      });

      setTask((prev) => ({
        ...prev,
        links: [...(prev?.links || []), newLink],
      }));

      setToast({
        show: true,
        text: "Ссылка добавлена",
        color: "rgba(33, 197, 140, 1)",
      });
      setShowAddLinkModal(false);
      setNewLinkUrl("");
    } catch (err) {
      console.error(err);
      setToast({
        show: true,
        text: "Ошибка добавления ссылки",
        color: "red",
      });
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;

    setLoadings((prev) => ({ ...prev, file: true }));

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files[]", file));
      formData.append("uploadType", "multiple");

      const response = await fetch(`${API_URL}/task/${taskId}/files`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      setToast({
        show: true,
        text: "Файл загружен",
        color: "rgba(33, 197, 140, 1)",
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
      setToast({
        show: true,
        text: "Статус обновлён",
        color: "rgba(33, 197, 140, 1)",
      });
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

  const handleDescriptionUpdate = async (desc) => {
    if (!desc) return;
    setLoadings((prev) => ({ ...prev, desc: true }));
    try {
      const updatedTask = await apiRequest(`/task/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ description: desc }),
      });

      setTask((prev) => ({
        ...prev,
        description: updatedTask.description || updatedTask.desc || desc,
      }));
      setToast({
        show: true,
        text: "Описание обновлено",
        color: "rgba(33, 197, 140, 1)",
      });

      setDescriptionUpdate(false);
    } catch (err) {
      console.error(err);
      setToast({ show: true, text: "Ошибка обновления", color: "red" });
    } finally {
      setLoadings((prev) => ({ ...prev, desc: false }));
    }
  };

  const handleDateUpdate = async (date) => {
    if (!date) return;

    setLoadings((prev) => ({ ...prev, date: true }));

    try {
      const updatedTask = await apiRequest(`/task/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({
          deadline: date,
          notified_pending: 0,
          notified_30: 0,
          notified_10: 0,
          notified_0: 0,
        }),
      });

      setTask((prev) => ({
        ...prev,
        due_at: updatedTask.due_at || updatedTask.deadline,
        status: updatedTask.status || prev.status,
      }));
      setToast({
        show: true,
        text: "Дата обновлена",
        color: "rgba(33, 197, 140, 1)",
      });
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

      <h3
        style={{
          marginBottom: "10px",
          hyphens: "auto",
          wordWrap: "break-word",
        }}
      >
        Задача #{task.id} - {task.title || "Не указано"}
      </h3>
      <div className="taskDetailHeader">
        <div
          className="info"
          style={{
            alignItems: "center",
            padding: "6px 12px",
            borderRadius: "20px",
            color: statusColors[task.status] || "inherit",
            border:
              task.status === ASSIGNED
                ? "1px solid var(--color-text)"
                : `1px solid ${statusColors[task.status]}`,
          }}
        >
          {task.status}
        </div>

        <form onSubmit={handleStatusUpdate} style={styles.statusForm}>
          <select
            id="status"
            name="status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            required
            disabled={loadings.status}
          >
            <option value="">Выберите статус</option>
            {filteredStatuses.map((status, index) => (
              <option key={index} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            className="create-btn"
            disabled={loadings.status || !selectedStatus}
            type="submit"
          >
            {loadings.status ? "Обновление..." : "Обновить статус"}
          </button>
        </form>
      </div>

      <div className="taskDetailContainder">
        <div>
          <div className="taskCard">
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
              onDescriptionChange={() => setDescriptionUpdate(true)}
              onDeleteLink={handleDeleteLink}
              onAddLink={() => setShowAddLinkModal(true)}
            />
          </div>

          <div className="taskCard">
            <div
              className="headlineBlock"
              style={{
                borderBottom: "1px solid #e9ecef",
                marginBottom: "16px",
                paddingBottom: "12px",
              }}
            >
              <b>Описание</b>
              {isAdmin && (
                <EditBtn onDateChange={() => setDescriptionUpdate(true)} />
              )}
            </div>
            <div
              style={{
                wordWrap: "break-word",
                overflowWrap: "break-word",
                hyphens: "auto",
              }}
            >
              {task.description || "Не указано"}
            </div>
          </div>
          <div className="taskCard">
            <div
              className="headlineBlock"
              style={{
                borderBottom: "1px solid #e9ecef",
                marginBottom: "16px",
                paddingBottom: "12px",
              }}
            >
              <b>Файлы</b>
            </div>

            <form onSubmit={handleFileUpload} style={styles.form}>
              <AddFiles
                formData={{ files }}
                handleFileChange={handleFileChange}
              />
              <button
                className="create-btn"
                style={{
                  marginTop: "10px",
                }}
                disabled={loadings.file || files.length === 0}
                type="submit"
              >
                {loadings.file ? "Загрузка..." : "Загрузить файлы"}
              </button>
            </form>
          </div>
        </div>
        <div>
          <CommentsSection
            comments={task.comments}
            getUserName={getUserName}
            formatDate={formatDate}
            comment={comment}
            onCommentChange={setComment}
            loading={loadings.comment}
            onSubmit={handleCommentSubmit}
            onCommentDelete={commentDetele}
            commentChange={commentChange}
          />
        </div>
      </div>
      {userPermissions.isAdmin && (
        <button
          className="delete-btn"
          style={{ width: "200px", margin: "10px 0 0 auto" }}
          onClick={handleDeleteTask}
        >
          Удалить задачу
        </button>
      )}
      <EditModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSave={handleDateUpdate}
        initialDate={newDueDate}
        loading={loadings.date}
        type="date"
      />
      <EditModal
        isOpen={descriptionUpdate}
        onClose={() => setDescriptionUpdate(false)}
        onSave={handleDescriptionUpdate}
        initialValue={task?.description || ""}
        loading={loadings.desc}
        type="description"
      />
      <EditModal
        isOpen={showAddLinkModal}
        onClose={() => {
          setShowAddLinkModal(false);
          setNewLinkUrl("");
        }}
        onSave={handleAddLink}
        initialValue={newLinkUrl}
        loading={false}
        type="link"
        placeholder="Введите URL ссылки"
        title="Добавить ссылку"
      />
      {toast.show && (
        <Toast
          text={toast.text}
          color={toast.color}
          onClose={() => setToast({ show: false, text: "", color: "" })}
        />
      )}
    </div>
  );
};

export default TaskDetails;
