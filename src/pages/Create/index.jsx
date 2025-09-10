import AddFiles from "../../components/AddFiles/AddFiles";
import { fetchDirections } from "../../hooks/useFetchDirection";
import useFetchTeam from "../../hooks/useFetchTeam";
import { getCookie } from "../../utils/getCookies";
import "./style.css";
import { useState, useEffect } from "react";

function CreatePage() {
  const [formData, setFormData] = useState({
    title: "",
    due_at: "",
    assigned_user_id: "",
    description: "",
    direction_id: "",
    files: [],
    links: [""],
  });

  const [authToken, setAuthToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = getCookie("authTokenPM");
    if (token) {
      setAuthToken(token);
    }
    fetchDirections(setDirection, setIsLoading, setError);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      files,
    }));
  };

  const handleLinkChange = (index, value) => {
    const newLinks = [...formData.links];
    newLinks[index] = value;
    setFormData((prev) => ({
      ...prev,
      links: newLinks,
    }));
  };

  const addLink = () => {
    setFormData((prev) => ({
      ...prev,
      links: [...prev.links, ""],
    }));
  };

  const API_URL = import.meta.env.VITE_API_KEY;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const currentToken = getCookie("authTokenPM") || authToken;

    try {
      const taskResponse = await fetch(`${API_URL}/task`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          direction_id: formData.direction_id,
          due_at: formData.due_at,
          assigned_user_id: formData.assigned_user_id,
          links: formData.links.filter((link) => link.trim() !== ""),
          files: [],
        }),
      });

      if (!taskResponse.ok) {
        const errorText = await taskResponse.text();
        console.error(
          "Ошибка при создании задачи:",
          taskResponse.status,
          errorText
        );
        if (taskResponse.status === 401) {
          alert(
            "Ошибка авторизации (401). Возможно, токен устарел или недействителен. Пожалуйста, войдите заново."
          );
        } else {
          alert(
            `Ошибка при создании задачи (${taskResponse.status}). Пожалуйста, попробуйте снова.`
          );
        }
        setIsLoading(false);
        return;
      }

      const taskData = await taskResponse.json();
      const taskId = taskData.id;

      if (formData.files.length > 0) {
        const formDataToSend = new FormData();
        formData.files.forEach((file) => {
          formDataToSend.append("file", file);
        });

        const fileResponse = await fetch(`${API_URL}/task/${taskId}/files`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
          body: formDataToSend,
        });

        if (!fileResponse.ok) {
          const errorText = await fileResponse.text();
          console.error(
            "Ошибка при загрузке файлов:",
            fileResponse.status,
            errorText
          );
          alert(
            `Ошибка при загрузке файлов (${fileResponse.status}). Пожалуйста, попробуйте снова.`
          );
          setIsLoading(false);
          return;
        }
      }

      setFormData({
        title: "",
        due_at: "",
        assigned_user_id: 0,
        description: "",
        direction_id: 0,
        files: [],
        links: [""],
      });
      alert("Задача успешно создана!");
    } catch (error) {
      console.error("Ошибка сети:", error);
      alert("Ошибка сети. Пожалуйста, проверьте соединение.");
    } finally {
      setIsLoading(false);
    }
  };

  const { team, loading, error: teamError } = useFetchTeam(API_URL);

  return (
    <section className="page" style={{ flex: 1 }}>
      <div className="create">
        <div className="create__headline">
          <h3>Создать новую задачу</h3>
          <p>Заполните детали чтобы создать новую задачу</p>
          {!authToken && (
            <div style={{ color: "red", marginTop: "10px" }}>
              Внимание: токен авторизации не найден!
            </div>
          )}
          {error && (
            <div style={{ color: "red", marginTop: "10px" }}>{error}</div>
          )}
        </div>
        <form className="create__form" onSubmit={handleSubmit}>
          <div className="create__block">
            <label htmlFor="title">Тема задачи *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="create__block">
            <label htmlFor="due_at">Срок исполнения</label>
            <input
              type="datetime-local"
              id="due_at"
              name="due_at"
              value={formData.due_at}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="create__block">
            <label htmlFor="direction_id">Направление</label>
            <select
              id="direction_id"
              name="direction_id"
              value={formData.direction_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Выберите направление</option>
              {direction?.map((dir) => (
                <option key={dir.id} value={dir.id}>
                  {dir.name}
                </option>
              ))}
            </select>
          </div>

          <div className="create__block">
            <label htmlFor="assigned_user_id">Выбрать пользователя *</label>
            {loading ? (
              <div className="loading">Загрузка пользователей...</div>
            ) : teamError ? (
              <div className="error error-message">{teamError}</div>
            ) : (
              <select
                type="text"
                id="assigned_user_id"
                name="assigned_user_id"
                value={formData.assigned_user_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Выберите направление *</option>
                {team?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="create__block">
            <label htmlFor="description">Описание задачи *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>
          <AddFiles formData={formData} handleFileChange={handleFileChange} />

          <div>
            {formData.links.map((link, index) => (
              <div
                key={index}
                className="create__block"
                style={{ marginBottom: "10px" }}
              >
                <label htmlFor={`link-${index}`}>Ссылка {index + 1}</label>
                <input
                  type="text"
                  id={`link-${index}`}
                  value={link}
                  onChange={(e) => handleLinkChange(index, e.target.value)}
                />
              </div>
            ))}
            <a
              href="#"
              className="add-link"
              onClick={(e) => {
                e.preventDefault();
                addLink();
              }}
              style={{ marginTop: "10px" }}
            >
              Добавить ещё ссылку
            </a>
          </div>

          <div className="create__btns">
            <button type="button" className="cancel-btn" disabled={isLoading}>
              Отмена
            </button>
            <button
              type="submit"
              className="create-btn"
              disabled={isLoading || !authToken}
            >
              {isLoading ? "Создание..." : "Создать задачу"}
            </button>
          </div>

          {!authToken && (
            <div
              style={{ color: "red", marginTop: "20px", textAlign: "center" }}
            >
              Ошибка: Токен авторизации не найден. Пожалуйста, войдите в
              систему.
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

export default CreatePage;
