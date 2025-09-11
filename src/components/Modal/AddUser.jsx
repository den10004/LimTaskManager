import { useState } from "react";
import "./style.css";
import { getCookie } from "../../utils/getCookies";
import { roleTranslations } from "../../utils/rolesTranslations";

function AddUser({ isOpen, onClose, onUserCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roles, setRoles] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_KEY;
  const token = getCookie("authTokenPM");

  // Функция для сброса ошибки при изменении паролей
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError(""); // Сбрасываем ошибку при изменении пароля
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (error) setError(""); // Сбрасываем ошибку при изменении подтверждения пароля
  };

  const handleUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Проверка совпадения паролей
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      setIsLoading(false);
      return;
    }

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
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 409) {
          throw new Error("Пользователь с таким email уже существует");
        }
        throw new Error(
          errorData.message || "Ошибка при создании пользователя"
        );
      }
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
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
              onChange={handlePasswordChange} // Используем новую функцию
              disabled={isLoading}
              placeholder="Введите пароль"
            />
          </div>

          <div className="form-group">
            <label>Повторите пароль:</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={handleConfirmPasswordChange} // Используем новую функцию
              disabled={isLoading}
              placeholder="Повторите пароль"
            />
          </div>

          <div className="form-group">
            <label>Телеграм:</label>
            <input
              type="text"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              disabled={isLoading}
              placeholder="Введите телеграм (не обязательно)"
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
              {Object.entries(roleTranslations).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
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
