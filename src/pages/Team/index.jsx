import React, { useState, useEffect } from "react";
import { getCookie } from "../../utils/getCookies";
import { formatDate } from "../../utils/dateUtils";
import "./style.css";
import { getTranslatedRole } from "../../utils/rolesTranslations";

function TeamPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = getCookie("authTokenPM");
        if (!token) {
          throw new Error("Токен авторизации отсутствует");
        }

        const response = await fetch(`${API_URL}/users`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Ошибка HTTPS: ${response.status}`);
        }

        const data = await response.json();
        setTasks(data.items);
        setLoading(false);
      } catch (err) {
        setError("Ошибка загрузки данных");
        console.error(err.message);
        setLoading(false);
      }
    };

    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="user">
      <h3 className="h3-mtmb">Команда</h3>

      {loading ? (
        <div className="loading">Загрузка данных...</div>
      ) : error ? (
        <div className="error error-message">{error}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <ul key={task.id} style={{ display: "flex" }}>
                <li style={{ marginRight: "10px" }}>
                  <b>Id:</b> {task.id}
                </li>
                <li style={{ marginRight: "10px" }}>
                  <b>Имя:</b> {task.name}
                </li>
                <li style={{ marginRight: "10px" }}>
                  <b>email:</b> {task.email}
                </li>
                <li style={{ marginRight: "10px" }}>
                  <b>Телеграм id</b> {task.telegram_id}
                </li>
                <li style={{ marginRight: "10px" }}>
                  <b>Создан:</b> {formatDate(task.created_at)}
                </li>
                <li style={{ display: "flex" }}>
                  <b>Роль: </b>
                  <div style={{ marginLeft: "10px" }}>
                    {task.roles && task.roles.length > 0
                      ? task.roles.map((link, index) => (
                          <div key={index}>{getTranslatedRole(link)}</div>
                        ))
                      : "-"}
                  </div>
                </li>
              </ul>
            ))
          ) : (
            <div>Нет данных для отображения</div>
          )}
        </div>
      )}
    </section>
  );
}

export default TeamPage;
