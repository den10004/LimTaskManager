import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/dateUtils";
import { statusColors } from "../../utils/rolesTranslations";
import { useEffect, useState } from "react";

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

  //просрочка**1 сутки********
  const deadline = new Date(Date.parse(task.created_at) + 86400000)
    .toISOString()
    .replace("Z", "+00:00");
  const [isOverdue, setIsOverdue] = useState(new Date() > new Date(deadline));

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      setIsOverdue(now > deadlineDate);
    }, 10000);

    return () => clearInterval(interval);
  }, [deadline]);
  console.log(formatDate(deadline));

  /************************************************************************** */
  return (
    <tr onClick={handleRowClick} style={{ cursor: "pointer" }}>
      <td>{createdBy}</td>
      <td>{userName}</td>
      <td>{formatDate(task.created_at, "Не установлен")}</td>
      <td>{formatDate(task.due_at, "Не установлен")}</td>
      <td>{directionName}</td>
      <td>{task.title || "Нет текста"}</td>
      <td style={{ color: statusColors[task.status] || "inherit" }}>
        {task.status || "Не указан"}{" "}
        {task.status === "Ответственный назначен" && isOverdue && " ⌛"}
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
