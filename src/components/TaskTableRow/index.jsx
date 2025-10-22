import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/dateUtils";
import { ASSIGNED, statusColors } from "../../utils/rolesTranslations";

function TaskTableRow({ task, directions, team }) {
  const navigate = useNavigate();
  const directionName =
    directions?.find((dir) => dir.id === task.direction_id)?.name || "";

  const handleRowClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  const user = team.find((member) => member.id === task.assigned_user_id);
  const userName = user ? user.name : "Пользователь не указан";

  const userCreated = team.find((member) => member.id === task.created_by);
  const createdBy = userCreated ? userCreated.name : "Пользователь не указан";

  return (
    <tr onClick={handleRowClick} style={{ cursor: "pointer" }}>
      <td>{createdBy}</td>
      <td>{userName}</td>
      {/*
      <td>{formatDate(task.created_at).split(" ")[0] || "Не установлен"}</td>*/}
      <td>{formatDate(task.due_at, "Не установлен")}</td>
      <td>{directionName}</td>
      <td className="truncate-cell">{task.title || "Нет текста"}</td>
      <td>
        <div
          className="info"
          style={{
            background: statusColors[task.status] || "inherit",
            border:
              task.status === ASSIGNED ? "1px solid var(--color-text)" : `none`,
            color:
              task.status === ASSIGNED
                ? "var(--color-text)"
                : `var(--color-background)`,
          }}
        >
          {task.status || "Не указан"}
          {task.status === ASSIGNED && task.notified_pending === 1 && " ⌛"}
        </div>
      </td>
      <td
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
      </td>
    </tr>
  );
}

export default TaskTableRow;
