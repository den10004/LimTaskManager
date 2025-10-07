import { useState, useEffect } from "react";
import { getCookie } from "../../utils/getCookies";
import "./style.css";

function AddRole({
  isOpen,
  onClose,
  loading = false,
  mode,
  role,
  onRoleCreated,
}) {
  //const [roleRus, setRoleRus] = useState("");
  const [roleLat, setRoleLat] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_KEY;
  const token = getCookie("authTokenPM");

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && role) {
        setRoleLat(role.name || "");
      } else {
        setRoleLat("");
      }
      setError("");
    }
  }, [isOpen, mode, role]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roleLat.trim()) {
      setError("Все поля обязательны для заполнения");
      return;
    }

    if (roleLat.length < 2) {
      setError("Название роли должно содержать минимум 2 символа");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const formData = {
        name: roleLat.trim(),
        //   description: roleRus.trim(),
      };

      let url = `${API_URL}/roles`;
      let method = "POST";

      if (mode === "edit" && role) {
        url = `${API_URL}/roles/${role.id}`;
        method = "PATCH";
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Ошибка при ${mode === "edit" ? "редактировании" : "создании"} роли`
        );
      }

      const result = await response.json();

      const roleData = result.item || result.role || result;

      const updatedRole = {
        id: roleData.id || (mode === "edit" ? role.id : Date.now()),
        name: roleData.name || roleLat.trim(),
        //  description: roleData.description || roleRus.trim(),
      };

      if (onRoleCreated) {
        onRoleCreated(updatedRole);
      }

      handleClose();
    } catch (error) {
      setError(
        error.message ||
          `Произошла ошибка при ${
            mode === "edit" ? "редактировании" : "создании"
          } роли`
      );
      console.error(
        `Ошибка при ${mode === "edit" ? "редактировании" : "создании"} роли:`,
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
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
            <label>Введите роль</label>
            <input
              type="text"
              required
              value={roleLat}
              onChange={(e) => setRoleLat(e.target.value)}
              disabled={isLoading || loading}
              minLength={2}
              placeholder="Например: Администратор"
            />
          </div>
          {error && <div className="error-message">{error}</div>}

          <div className="modal-buttons">
            <button
              type="submit"
              className="create-btn modal-button"
              disabled={isLoading || loading}
            >
              {isLoading
                ? mode === "create"
                  ? "Сохранение..."
                  : "Создание..."
                : mode === "edit"
                ? "Сохранить"
                : "Создать"}
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
