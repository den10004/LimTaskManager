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

  const getCookie = (name) => {
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        const token = parts.pop().split(";").shift();
        return token;
      }
      console.log("Cookie не найден");
      return null;
    } catch (error) {
      console.error("Ошибка при чтении cookie:", error);
      return null;
    }
  };

  useEffect(() => {
    const token = getCookie("authTokenPM");
    if (token) {
      setAuthToken(token);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const currentToken = getCookie("authTokenPM") || authToken;

    try {
      const response = await fetch(
        "https://task-manager.conversionpro-test.ru/task",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            direction_id: formData.direction_id,
            due_at: formData.due_at,
            assigned_user_id: formData.assigned_user_id,
            links: formData.links.filter((link) => link.trim() !== ""),
            files: [], // Если сервер ожидает массив файлов, но через JSON можно отправить только метаданные
          }),
        }
      );

      console.log(
        "Заголовки ответа:",
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Задача успешно создана:", result);
        alert("Задача успешно создана!");

        // Сброс формы
        setFormData({
          title: "",
          due_at: "",
          assigned_user_id: "",
          description: "",
          direction_id: "",
          files: [],
          links: [""],
        });
      } else {
        const errorText = await response.text();
        console.error(
          "Ошибка при создании задачи:",
          response.status,
          errorText
        );

        if (response.status === 401) {
          alert(
            "Ошибка авторизации (401). Возможно, токен устарел или недействителен. Пожалуйста, войдите заново."
          );
        } else {
          alert(
            `Ошибка при создании задачи (${response.status}). Пожалуйста, попробуйте снова.`
          );
        }
      }
    } catch (error) {
      console.error("Ошибка сети:", error);
      alert("Ошибка сети. Пожалуйста, проверьте соединение.");
    } finally {
      setIsLoading(false);
    }
  };

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
              type="date"
              id="due_at"
              name="due_at"
              value={formData.due_at}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="create__block">
            <label htmlFor="direction_id">Направление</label>
            <input
              type="text"
              id="direction_id"
              name="direction_id"
              value={formData.direction_id}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="create__block">
            <label htmlFor="assigned_user_id">Выбрать пользователя *</label>
            <input
              type="text"
              id="assigned_user_id"
              name="assigned_user_id"
              value={formData.assigned_user_id}
              onChange={handleInputChange}
              required
            />
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

          <div className="create__block">
            <div className="label">Файлы</div>
            <div className="file-upload">
              <img src="/files.svg" alt="загрузка файлов" />
              <div>
                Перетащите файлы сюда или&nbsp;
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("files").click();
                  }}
                >
                  загрузите
                </a>
                <input
                  type="file"
                  id="files"
                  name="files"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
              <span
                style={{
                  margin: "0 auto",
                  color: "rgba(156, 163, 175, 1)",
                  fontSize: "14px",
                }}
              >
                Поддержка нескольких типов файлов
              </span>
            </div>
            {formData.files.length > 0 && (
              <div style={{ marginTop: "10px" }}>
                Выбрано файлов: {formData.files.length}
              </div>
            )}
          </div>

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
