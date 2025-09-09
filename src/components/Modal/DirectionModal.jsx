import { useState, useEffect } from "react";
import "./style.css";
import { getCookie } from "../../utils/getCookies";

function DirectionModal({
  isOpen,
  onClose,
  onDirectionAdded,
  onDirectionEdited,
  mode,
  directionToEdit,
}) {
  const [direction, setDirection] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    if (mode === "edit" && directionToEdit) {
      setDirection(directionToEdit.name);
    } else {
      setDirection("");
    }
  }, [mode, directionToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const token = getCookie("authTokenPM");
      if (!token) {
        throw new Error("Токен авторизации отсутствует");
      }

      if (mode === "add") {
        const newDirection = { name: direction, id: Date.now() };
        if (typeof onDirectionAdded === "function") {
          onDirectionAdded(newDirection, true);
        }

        const response = await fetch(`${API_URL}/directions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: direction }),
        });

        if (!response.ok) {
          throw new Error(`Ошибка HTTPS: ${response.status}`);
        }

        const addedDirection = await response.json();
        setDirection("");
        if (typeof onDirectionAdded === "function") {
          onDirectionAdded(addedDirection, false);
        }
      } else if (mode === "edit" && directionToEdit) {
        const updatedDirection = { name: direction, id: directionToEdit.id };
        if (typeof onDirectionEdited === "function") {
          onDirectionEdited(updatedDirection);
        }

        const response = await fetch(
          `${API_URL}/directions/${directionToEdit.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: direction }),
          }
        );

        if (!response.ok) {
          throw new Error(`Ошибка HTTPS: ${response.status}`);
        }

        const editedDirection = await response.json();
        if (typeof onDirectionEdited === "function") {
          onDirectionEdited(editedDirection);
        }
      }

      onClose();
    } catch (err) {
      setError(
        `Ошибка при ${
          mode === "add" ? "добавлении" : "редактировании"
        } направления`
      );
      console.error(err.message);
      if (mode === "add" && typeof onDirectionAdded === "function") {
        onDirectionAdded(null, false);
      } else if (mode === "edit" && typeof onDirectionEdited === "function") {
        onDirectionEdited(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>
          {mode === "add"
            ? "Добавить направление"
            : "Редактировать направление"}
        </h2>
        <form id="direction-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              required
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              disabled={isLoading}
              placeholder="Введите название направления"
            />
          </div>
          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="create-btn modal-button"
            disabled={isLoading}
          >
            {isLoading
              ? "Загрузка..."
              : mode === "add"
              ? "Добавить"
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

export default DirectionModal;
