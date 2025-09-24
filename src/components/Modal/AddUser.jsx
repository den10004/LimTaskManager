import { useState, useEffect } from "react";
import { getCookie } from "../../utils/getCookies";
import "./style.css";

function AddUser({ isOpen, onClose, rolesList, onUserCreated, mode, user }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roles, setRoles] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [canAddRecords, setCanAddRecords] = useState(false);

  const API_URL = import.meta.env.VITE_API_KEY;
  const token = getCookie("authTokenPM");

  console.log(user);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setName("");
        setEmail("");
        setTelegram("");
        setPassword("");
        setConfirmPassword("");
        setRoles("");
        setIsLoading(false);
        setError("");
        setCanAddRecords(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && user) {
        setName(user.name || "");
        setEmail(user.email || "");
        setTelegram(user.telegram_id || "");
        setRoles(user.roles?.[0] || "");
        setPassword("");
        setConfirmPassword("");
        setCanAddRecords(
          user.permissions?.includes("Добавление записей") || false
        );
      } else {
        setName("");
        setEmail("");
        setTelegram("");
        setPassword("");
        setConfirmPassword("");
        setRoles("");
        setCanAddRecords(false);
      }
      setIsLoading(false);
      setError("");
    }
  }, [isOpen, mode, user]);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (error) setError("");
  };

  const handleCheckboxChange = (e) => {
    setCanAddRecords(e.target.checked);
  };

  const handleUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      setIsLoading(false);
      return;
    }

    try {
      const selectedRole = rolesList.find((role) => role.name === roles);

      const formData = {
        name,
        email,
        password,
        telegram_id: telegram,
        roles: selectedRole
          ? [selectedRole.name, selectedRole.description]
          : [],
        permissions: canAddRecords ? ["Добавление записей"] : [],
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

      const newUser = await response.json();

      if (onUserCreated) {
        onUserCreated("create", newUser);
      }

      onClose();
    } catch (err) {
      setError(err.message || "Произошла ошибка при создании пользователя");
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password && password !== confirmPassword) {
      setError("Пароли не совпадают");
      setIsLoading(false);
      return;
    }

    try {
      const selectedRole = rolesList.find((role) => role.name === roles);

      const formData = {};

      if (name) formData.name = name;
      if (password) formData.password = password;
      if (telegram !== undefined) formData.telegram_id = telegram;
      if (selectedRole)
        formData.roles = [selectedRole.name, selectedRole.description];

      // Добавляем permissions как массив
      formData.permissions = canAddRecords ? ["Добавление записей"] : [];

      if (Object.keys(formData).length === 0) {
        setError("Нет данных для обновления");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Ошибка при обновлении пользователя"
        );
      }

      const updatedUser = await response.json();

      if (onUserCreated) {
        onUserCreated("edit", updatedUser);
      }

      onClose();
    } catch (err) {
      setError(err.message || "Произошла ошибка при обновлении пользователя");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        {mode === "create" ? (
          <h2>Создать пользователя</h2>
        ) : (
          <h2>Редактирование пользователя</h2>
        )}
        <form
          id="login-form"
          onSubmit={mode === "create" ? handleUser : handleUpdateUser}
        >
          <div className="form-group">
            <label>Имя:</label>
            <input
              type="text"
              required={mode === "create"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              placeholder="Введите имя"
            />
          </div>

          {mode === "create" && (
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                required={mode === "create"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="Введите email"
              />
            </div>
          )}

          <div className="form-group">
            <label>Пароль:</label>
            <input
              type="password"
              required={mode === "create"}
              value={password}
              onChange={handlePasswordChange}
              disabled={isLoading}
              placeholder={"Введите пароль (минимум 6 символов)"}
              minLength={6}
            />
            {password.length > 0 && password.length < 6 && (
              <small className="error-message">
                Пароль слишком короткий. Минимальная длина: 6 символов
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Повторите пароль:</label>
            <input
              type="password"
              required={mode === "create"}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              disabled={isLoading}
              placeholder={"Повторите пароль"}
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
              value={roles}
              required={mode === "create"}
              onChange={(e) => setRoles(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Выберите роль</option>
              {rolesList.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.description}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label
              style={{ display: "flex", alignItems: "center", gap: "5px" }}
            >
              <input
                type="checkbox"
                checked={canAddRecords}
                onChange={handleCheckboxChange}
                disabled={isLoading}
              />
              Добавление записей
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="create-btn modal-button"
            disabled={isLoading}
          >
            {isLoading
              ? "Загрузка..."
              : mode === "create"
              ? "Создать"
              : "Сохранить"}
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
