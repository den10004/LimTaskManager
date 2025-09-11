import { useState } from "react";
import "./style.css";
import { getCookie } from "../../utils/getCookies";

function AddUser({ isOpen, onClose, onUserCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_KEY;
  const token = getCookie("authTokenPM");

  const handleUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formData = {
        name,
        email,
        password,
        telegram_id: telegram,
        roles: [roles],
      };
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Ошибка при создании пользователя");
      }
      setName("");
      setEmail("");
      setPassword("");
      setTelegram("");
      setRoles("");
      setIsLoading(false);
      if (onUserCreated) {
        onUserCreated();
      }

      onClose();
    } catch (err) {
      setError(err.message || "Произошла ошибка при создании пользователя");
      setIsLoading(false);
    }
  };
  if (!isOpen) return null;

  const roless = [
    { admin: "Администратор" },
    { sales_manager: "Менеджер продаж" },
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Создать пользователя</h2>
        <form id="login-form" onSubmit={handleUser}>
          <div className="form-group">
            <label>Имя:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              placeholder="Введите имя"
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder="Введите ваш email"
            />
          </div>
          <div className="form-group">
            <label>Пароль:</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Введите ваш пароль"
            />
          </div>
          <div className="form-group">
            <label>Телеграм:</label>
            <input
              type="text"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              disabled={isLoading}
              placeholder="Введите телеграм (не обзязательно)"
            />
          </div>
          <div className="form-group">
            <label>Роль:</label>
            <select
              id="role"
              name="role"
              value={roles}
              onChange={(e) => setRoles(e.target.value)}
              required
            >
              <option value="">Выберите роль</option>
              {roless?.map((roleObj, id) => {
                const key = Object.keys(roleObj)[0];
                const value = roleObj[key];
                return (
                  <option key={id} value={key}>
                    {value}
                  </option>
                );
              })}
            </select>
          </div>
          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="create-btn modal-button"
            disabled={isLoading}
          >
            {isLoading ? "Загрузка..." : "Создать"}
          </button>
        </form>
        <button
          className="cancel-btn modal-button"
          onClick={onClose}
          disabled={isLoading}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

export default AddUser;
