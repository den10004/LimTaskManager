import AddFiles from "../../components/AddFiles";
import Toast from "../../components/Toast";
import { useNavigate } from "react-router-dom";
import { useTeam } from "../../contexts/TeamContext";
import { fetchDirections } from "../../hooks/useFetchDirection";
import { getCookie } from "../../utils/getCookies";
import "./style.css";
import { useState, useEffect } from "react";
import { API_URL } from "../../utils/config";
import { normalizeUrl } from "../../utils/url";
import { request, json } from "../../utils/apiClient";
import { parseError, parseResponseError } from "../../utils/errorUtils";

function CreatePage() {
  const [formData, setFormData] = useState({
    title: "",
    due_at: "",
    assigned_user_id: "",
    urgency: 0,
    description: "",
    direction_id: "",

    files: [],
    links: [""],
  });

  const [toast, setToast] = useState({
    show: false,
    text: "",
    color: "",
  });
  const [authToken, setAuthToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    const newFiles = Array.from(e.target.files || []);

    setFormData((prev) => {
      const currentFiles = prev.files || [];

      if (e.target.isRemoval) {
        return {
          ...prev,
          files: newFiles,
        };
      } else {
        return {
          ...prev,
          files: [...currentFiles, ...newFiles],
        };
      }
    });
    if (e.target.type === "file") {
      e.target.value = "";
    }
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
      links: [...prev.links, "https://"],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const taskData = await json(`${API_URL}/task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          direction_id: formData.direction_id,
          due_at: formData.due_at,
          assigned_user_id: formData.assigned_user_id,
          urgency: formData.urgency,
          links: formData.links.filter((link) => link.trim() !== ""),
        }),
      });
      const taskId = taskData.id;

      if (formData.files.length > 0) {
        const FormDataNew = new FormData();
        formData.files.forEach((file) => {
          FormDataNew.append("files[]", file);
        });
        FormDataNew.append("uploadType", "multiple");

        const fileResponse = await request(`${API_URL}/task/${taskId}/files`, {
          method: "POST",
          body: FormDataNew,
        });

        if (!fileResponse.ok) {
          const fileErr = await parseResponseError(fileResponse);
          console.error("Ошибка при загрузке файлов:", fileErr.code, fileErr.message);
          setToast({
            show: true,
            text: `Ошибка при загрузке файлов (${fileErr.code}). ${fileErr.message}`,
            color: "red",
          });
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
      setToast({
        show: true,
        text: "Задача успешно создана",
        color: "rgba(33, 197, 140, 1)",
      });
      setTimeout(() => {
        navigate("/task");
      }, 3000);
    } catch (error) {
      const err = parseError(error);
      console.error("Ошибка сети:", err.message);
      setToast({
        show: true,
        text: `Ошибка сети. ${err.message || "Пожалуйста, проверьте соединения"}`,
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { team, loading, error: teamError } = useTeam();

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
            <label htmlFor="due_at">Срок исполнения *</label>
            <div className="inputdate-wrapper">
              <input
                type="datetime-local"
                id="due_at"
                name="due_at"
                value={formData.due_at}
                onChange={handleInputChange}
                min={new Date().toISOString().slice(0, 16)}
                className="datetime-input"
                required
              />
              <span className="calendar-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 2V6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 2V6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 10H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>

          <div className="create__block">
            <label htmlFor="direction_id">Направление *</label>
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
            <label htmlFor="assigned_user_id">Выбрать ответственного *</label>
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
                <option value="">Выберите пользователя</option>
                {team?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="create__block">
            <label htmlFor="urgency">Важность задачи *</label>
            <select
              id="urgency"
              name="urgency"
              value={formData.urgency}
              onChange={handleInputChange}
              required
            >
              <option value=""></option>
              {[1, 2, 3, 4, 5]?.map((number) => (
                <option key={number} value={number}>
                  {number}
                </option>
              ))}
            </select>
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
                  onBlur={(e) => {
                    const normalizedUrl = normalizeUrl(e.target.value);
                    if (normalizedUrl !== e.target.value) {
                      handleLinkChange(index, normalizedUrl);
                    }
                  }}
                  placeholder="https://example.com"
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
      {toast.show && (
        <Toast
          text={toast.text}
          color={toast.color}
          onClose={() => setToast({ show: false, text: "", color: "" })}
        />
      )}
    </section>
  );
}

export default CreatePage;
