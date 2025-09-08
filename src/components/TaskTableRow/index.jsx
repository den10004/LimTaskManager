import { formatDate } from "../../utils/dateUtils";
import { useNavigate } from "react-router-dom";

function TaskTableRow({ task }) {
  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate(`/tasks/${task.id}`);
  };
  const statusColors = {
    "Задача просрочена": "red",
    Новая: "green",
  };

  return (
    <tr onClick={handleRowClick} style={{ cursor: "pointer" }}>
      <td>{task.id}</td>
      <td>{task.assigned_user_id || "Не указан"}</td>
      <td>{formatDate(task.due_at, "Не установлен")}</td>
      <td>{task.description || "Нет описания"}</td>
      <td>{task.text || "Нет текста"}</td>
      <td style={{ color: statusColors[task.status] || "inherit" }}>
        {task.status || "Не указан"}
      </td>
      <td>
        {task.links && task.links.length > 0
          ? task.links.map((link, index) => (
              <div key={index}>
                <a href={link} target="_blank" rel="noopener noreferrer">
                  {link}
                </a>
              </div>
            ))
          : "-"}
      </td>
    </tr>
  );
}

export default TaskTableRow;
