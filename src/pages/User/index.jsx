import React, { useState, useEffect } from "react";
import "./style.css";
import { getCookie } from "../../utils/getCookies";
import TaskTableRow from "../../components/TaskTableRow";

const addBtn = {
  display: "flex",
  margin: "30px auto",
};

function UserPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(10);

  const API_URL = import.meta.env.VITE_API_KEY;

  const fetchTasks = async (newOffset) => {
    try {
      const token = getCookie("authTokenPM");
      if (!token) {
        throw new Error("Токен авторизации отсутствует");
      }

      const response = await fetch(
        `${API_URL}/task?limit=20&offset=${newOffset}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка HTTPS: ${response.status}`);
      }

      const data = await response.json();
      setTasks((prevTasks) => [...prevTasks, ...data.items]);
      setLoading(false);
    } catch (err) {
      console.error(err.message);
      setError("Ошибка загрузки данных");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(offset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = () => {
    const newOffset = offset + 10;
    setOffset(newOffset);
    fetchTasks(newOffset);
  };

  return (
    <section className="user">
      <h3 className="h3-mtmb">Список задач</h3>

      {loading ? (
        <div className="loading">Загрузка данных Ascension.pyданных...</div>
      ) : error ? (
        <div className="error error-message">{error}</div>
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
      <button className="create-btn" style={addBtn} onClick={handleLoadMore}>
        Загрузить ещё
      </button>
    </section>
  );
}

export default UserPage;
