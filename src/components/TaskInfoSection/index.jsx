import EditBtn from "../UI/EditBtn";

const styles = {
  taskInfoList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  filesContainer: {
    marginLeft: "5px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  flexCenter: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
};

function TaskInfoSection({
  task,
  isAdmin,
  getUserName,
  getDirectionName,
  formatDate,
  userPermissions,
  getUrgencyColor,
  loadings,
  onUrgencyChange,
  onDateChange,
  onDeleteLink,
  onAddLink,
}) {
  const MAX_URGENCY_STARS = 5;

  return (
    <div style={styles.taskInfoList}>
      <div
        className="headlineBlock"
        style={{
          borderBottom: "1px solid #e9ecef",
          marginBottom: "16px",
          paddingBottom: "12px",
        }}
      >
        <b>Описание задачи</b>
      </div>
      <div className="taskDetailContainder">
        <div className="taskDetailItem">
          <div>Создатель</div>
          <b>{getUserName(task.created_by)}</b>
        </div>
        <div className="taskDetailItem">
          <div>Ответственный</div>
          <b>{getUserName(task.assigned_user_id)}</b>
        </div>
        <div className="taskDetailItem">
          <div style={{ marginBottom: "10px" }}>Срок выполнения:</div>
          <b>{formatDate(task.due_at) || "Не указано"}</b>

          {isAdmin && <EditBtn onDateChange={onDateChange} />}
        </div>
        <div className="taskDetailItem">
          <div>Направление</div>
          <div
            style={{
              padding: "4px 8px",
              backgroundColor: "#e7f1ff",
              color: "var(--color-blue)",
              borderRadius: "4px",
              width: "fit-content",
            }}
          >
            {getDirectionName(task.direction_id)}
          </div>
        </div>
        <div className="taskDetailItem">
          <div>Важность:</div>
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
        </div>
      </div>

      {task.files && task.files.length > 0 && (
        <div style={styles.flexCenter}>
          <div style={{ color: "var(--color-gray)" }}>Файлы:&nbsp;</div>
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
        </div>
      )}

      {task.links && (
        <div style={styles.flexCenter}>
          <div style={{ color: "var(--color-gray)" }}>Ссылки:&nbsp;</div>
          <div style={styles.flexCenter}>
            {task.links.length === 0
              ? "нет ссылок"
              : task.links.map((link, index) => (
                  <div style={{ position: "relative" }} key={index}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginRight: "10px" }}
                    >
                      {link.url}
                    </a>
                    {isAdmin && (
                      <div
                        style={{
                          position: "absolute",
                          top: "-5px",
                          right: "-5px",
                        }}
                      >
                        <button
                          className="crossBtn"
                          onClick={() => onDeleteLink(link.id)}
                          title="Удалить ссылку"
                        >
                          x
                        </button>
                      </div>
                    )}
                  </div>
                ))}
          </div>
        </div>
      )}
      <button className="create-btn" onClick={onAddLink}>
        Добавить ссылки
      </button>
    </div>
  );
}
export default TaskInfoSection;
