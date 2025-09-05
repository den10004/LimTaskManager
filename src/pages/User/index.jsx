import React, { useState, useEffect } from "react";
import "./style.css";
import { getCookie } from "../../utils/getCookies";
import TaskTableRow from "../../components/TaskTableRow";

function UserPage() {
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

        const response = await fetch(`${API_URL}/task`, {
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
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <section className="user">
      <h3 className="h3-mtmb">Список задач</h3>

      {loading ? (
        <div className="loading">Загрузка данных...</div>
      ) : error ? (
        <div className="error">Ошибка: {error}</div>
      ) : (
        <table id="dataTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Пользователь</th>
              <th>Дата</th>
              <th>Описание</th>
              <th>Текст</th>
              <th>Статус</th>
              <th>Ссылки</th>
            </tr>
          </thead>
          <tbody id="tableBody">
            {tasks.length > 0 ? (
              tasks.map((task) => <TaskTableRow key={task.id} task={task} />)
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  Нет данных для отображения
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default UserPage;
