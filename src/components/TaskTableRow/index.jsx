import React from "react";
import { formatDate } from "../../utils/dateUtils";

function TaskTableRow({ task }) {
  return (
    <tr>
      <td>{task.id}</td>
      <td>{task.assigned_user_id || "Не указан"}</td>
      <td>{formatDate(task.due_at, "Не установлен")}</td>
      <td>{task.description || "Нет описания"}</td>
      <td>{task.text || "Нет текста"}</td>
      <td>{task.status || "Не указан"}</td>
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
