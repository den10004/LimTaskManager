import { useState } from "react";
import "./style.css";
import { getCookie } from "../../utils/getCookies";

function DirectionModal({ isOpen, onClose, onDirectionAdded }) {
  const [direction, setDirection] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_KEY;

  if (!isOpen) return null;

  const handleDirection = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const token = getCookie("authTokenPM");
      if (!token) {
        throw new Error("Токен авторизации отсутствует");
      }

      const newDirection = { name: direction, id: Date.now() }; // Temporary ID for optimistic update
      if (typeof onDirectionAdded === "function") {
        onDirectionAdded(newDirection, true); // Pass new direction for optimistic update
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

      const addedDirection = await response.json(); // Get the server response
      setDirection("");
      if (typeof onDirectionAdded === "function") {
        onDirectionAdded(addedDirection, false); // Trigger server refresh
      }
      onClose(); // Close the modal
    } catch (err) {
      setError("Ошибка при добавлении направления");
      console.error(err.message);
      if (typeof onDirectionAdded === "function") {
        onDirectionAdded(null, false); // Revert optimistic update on error
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Добавить направление</h2>
        <form id="login-form" onSubmit={handleDirection}>
          <div className="form-group">
            <input
              type="text"
              required
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="create-btn modal-button"
            disabled={isLoading}
          >
            {isLoading ? "Загрузка..." : "Отправить"}
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
