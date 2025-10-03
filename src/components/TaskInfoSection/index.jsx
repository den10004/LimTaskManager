const styles = {
  statusForm: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  flexAlignCenter: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  filesContainer: {
    marginLeft: "5px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  taskInfoList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  flexCenter: {
    display: "flex",
    alignItems: "center",
  },
  linksContainer: {
    marginLeft: "5px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
};

function TaskInfoSection({
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
  onDescriptionChange,
  selectedStatus,
  onStatusChange,
  statuses,
  loadingStatus,
  onStatusUpdate,
}) {
  const MAX_URGENCY_STARS = 5;

  return (
    <ul style={styles.taskInfoList}>
      <li className={`status-badge status-${task.status || ""}`}>
        <b>Статус:</b>
        &nbsp;{task.status || "Не указано"}
      </li>

      <li>
        <form onSubmit={onStatusUpdate} style={styles.statusForm}>
          <select
            id="status"
            name="status"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            required
            disabled={loadingStatus}
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
            disabled={loadingStatus || !selectedStatus}
            type="submit"
          >
            {loadingStatus ? "Обновление..." : "Обновить статус"}
          </button>
        </form>
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
          <button className="change-btn" onClick={onDateChange}>
            Редактирование
          </button>
        )}
      </li>

      <li>
        <b>Направление:</b> {getDirectionName(task.direction_id)}
      </li>
      <li>
        <b>Описание:</b> {task.description || "Не указано"}
        <button className="change-btn" onClick={onDescriptionChange}>
          Редактирование
        </button>
      </li>

      <li style={styles.flexCenter}>
        <b>Важность:&nbsp;</b>
        <div style={styles.flexCenter}>
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
            {normalizeLinks(task.links).length === 0
              ? "нет ссылок"
              : normalizeLinks(task.links).map((link, index) => (
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
}

export default TaskInfoSection;
