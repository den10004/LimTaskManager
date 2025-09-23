import { useState } from "react";
import { getCookie } from "../../utils/getCookies";
import "./style.css";

function AddRole({ isOpen, onClose, loading = false, mode, onRoleCreated }) {
  const [roleRus, setRoleRus] = useState("");
  const [roleLat, setRoleLat] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_KEY;
  const token = getCookie("authTokenPM");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roleRus.trim() || !roleLat.trim()) {
      setError("Все поля обязательны для заполнения");
      return;
    }

    if (roleRus.length < 2 || roleLat.length < 2) {
      setError("Название роли должно содержать минимум 2 символа");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const formData = {
        name: roleLat.trim(),
        description: roleRus.trim(),
      };

      const response = await fetch(`${API_URL}/roles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка при создании роли");
      }

      const createdRole = await response.json();

      const roleData = createdRole.item || createdRole.role || createdRole;

      const newRole = {
        id: roleData.id || Date.now(),
        name: roleData.name || roleLat.trim(),
        description: roleData.description || roleRus.trim(),
      };

      if (onRoleCreated) {
        onRoleCreated(newRole);
      }

      handleClose();
    } catch (error) {
      setError(error.message || "Произошла ошибка при создании роли");
      console.error("Ошибка при создании роли:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setRoleRus("");
    setRoleLat("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{mode === "edit" ? "Редактировать роль" : "Создать роль"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Введите роль на русском</label>
            <input
              type="text"
              required
              value={roleRus}
              onChange={(e) => setRoleRus(e.target.value)}
              disabled={isLoading || loading}
              minLength={2}
              placeholder="Например: Администратор"
            />
          </div>

          <div className="form-group">
            <label>Введите роль на латинице</label>
            <input
              type="text"
              required
              value={roleLat}
              onChange={(e) => setRoleLat(e.target.value)}
              disabled={isLoading || loading}
              minLength={2}
              placeholder="Например: admin"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-buttons">
            <button
              type="submit"
              className="create-btn modal-button"
              disabled={isLoading || loading}
            >
              {isLoading ? "Создание..." : "Сохранить"}
            </button>
          </div>
        </form>
        <button
          type="button"
          className="cancel-btn modal-button"
          onClick={handleClose}
          disabled={isLoading || loading}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

export default AddRole;
