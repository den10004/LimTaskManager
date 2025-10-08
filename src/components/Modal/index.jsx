import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./style.css";

function Modal({ onCancel, onLoginSuccess }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const API_URL = import.meta.env.VITE_API_KEY;
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      if (data.token) {
        const userData = {
          email: data.user.email,
          id: data.user.id,
          name: data.user.name,
          roles: data.user.roles,
          telegram_id: data.user.telegram_id,
        };

        login(data.token, userData, data.refresh_token);
        onLoginSuccess();
        navigate("/task");
      } else {
        throw new Error("Отсутствует токен в ответе");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.message?.includes("status: 401")) {
        setError("Неправильный логин или пароль");
      } else if (error.message?.includes("status:")) {
        const statusMatch = error.message.match(/status: (\d+)/);
        if (statusMatch) {
          setError(`Ошибка сервера: ${statusMatch[1]}`);
        } else {
          setError(error.message);
        }
      } else {
        setError(error.message || "Произошла неизвестная ошибка");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Вход в систему</h2>
        <form id="login-form" onSubmit={handleLogin}>
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
          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="create-btn modal-button"
            disabled={isLoading}
          >
            {isLoading ? "Загрузка..." : "Войти"}
          </button>
        </form>
        <button
          className="cancel-btn modal-button"
          onClick={onCancel}
          disabled={isLoading}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

export default Modal;
