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
}) {
  const MAX_URGENCY_STARS = 5;
  console.log(task.links);

  return (
    <ul style={styles.taskInfoList}>
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

      <li className="headlineBlock">
        <b>Создатель:</b> {getUserName(task.created_by)}
      </li>
      <li className="headlineBlock">
        <b>Ответственный:</b> {getUserName(task.assigned_user_id)}
      </li>

      <li className="headlineBlock">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <b style={{ marginBottom: "10px" }}>Срок выполнения:</b>
          {formatDate(task.due_at) || "Не указано"}
        </div>
        {isAdmin && <EditBtn onDateChange={onDateChange} />}
      </li>

      <li className="headlineBlock">
        <b>Направление:</b>{" "}
        <div
          style={{
            display: "inline-block",
            padding: "4px 8px",
            backgroundColor: "#e7f1ff",
            color: "var(--color-blue)",
            borderRadius: "4px",
          }}
        >
          {getDirectionName(task.direction_id)}
        </div>
      </li>

      <li className="headlineBlock" style={styles.flexCenter}>
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
        <li style={styles.flexCenter} className="headlineBlock">
          <b>Ссылки:&nbsp;</b>
          <div style={styles.linksContainer}>
            {task.links.length === 0
              ? "нет ссылок"
              : task.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginRight: "10px" }}
                  >
                    {link.url}
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
