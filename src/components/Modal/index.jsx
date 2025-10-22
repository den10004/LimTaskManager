import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./style.css";
import { API_URL } from "../../utils/rolesTranslations";

function Modal({ onCancel, onLoginSuccess }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const getErrorMessage = useCallback((error) => {
    if (error.message?.includes("status: 401")) {
      return "Неправильный логин или пароль";
    }
    if (error.message?.includes("status: ")) {
      const statusMatch = error.message.match(/status: (\d+)/);
      if (statusMatch) {
        return `Ошибка сервера: ${statusMatch[1]}`;
      }
    }
    return error.message || "Произошла неизвестная ошибка";
  }, []);

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      if (!email || !password) {
        setError("Пожалуйста, заполните все поля");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Введите корректный email");
        return;
      }

      setIsLoading(true);
      setError("");

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
      } catch (err) {
        console.error("Login error:", err);
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, login, onLoginSuccess, navigate, getErrorMessage]
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleCancel = useCallback(() => {
    setError("");
    onCancel();
  }, [onCancel]);

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content">
        <h2 id="modal-title">Вход в систему</h2>
        <form id="login-form" onSubmit={handleLogin} noValidate>
          <div className="form-group">
            <label htmlFor="email-input">Email:</label>
            <input
              id="email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              disabled={isLoading}
              placeholder="Введите ваш email"
              aria-describedby={error ? "error-message" : undefined}
            />
          </div>
          <div className="form-group" style={{ position: "relative" }}>
            <label htmlFor="password-input">Пароль:</label>
            <input
              id="password-input"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Введите ваш пароль"
              aria-describedby={error ? "error-message" : undefined}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
              disabled={isLoading}
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPassword ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
              )}
            </button>
          </div>
          {error && (
            <div id="error-message" className="error-message" role="alert">
              {error}
            </div>
          )}

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
          onClick={handleCancel}
          disabled={isLoading}
          type="button"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

export default Modal;
