import React, { useState, useEffect } from "react";
import "./style.css";
import { getCookie } from "../../utils/getCookies";

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
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();
        setTasks(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) {
    return (
      <section className="user">
        <h3 className="h3-mtmb">Список задач</h3>
        <div className="loading">Загрузка данных...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="user">
        <h3 className="h3-mtmb">Список задач</h3>
        <div className="error">Ошибка: {error}</div>
      </section>
    );
  }

  return (
    <section className="user">
      <h3 className="h3-mtmb">Список задач</h3>
      <table id="dataTable">
        <thead>
          <tr>
            <th>ID</th>
            <th>Пользователь</th>
            <th>Описание</th>
            <th>Текст</th>
          </tr>
        </thead>
        <tbody id="tableBody">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.id}</td>
                <td>{task.user || "Не указан"}</td>
                <td>{task.description || "Нет описания"}</td>
                <td>{task.text || "Нет текста"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                Нет данных для отображения
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export default UserPage;
