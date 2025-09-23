import { useState } from "react";
import "./style.css";

function AddRole({ isOpen, onClose, loading = false }) {
  const [roleRus, setRoleRus] = useState("");
  const [roleLat, setRoleLat] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {};

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Создать роль</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Введите роль на русском</label>
            <input
              type="text"
              required
              value={roleRus}
              onChange={(e) => setRoleRus(e.target.value)}
              disabled={loading}
              minLength={2}
            />
          </div>

          <div className="form-group">
            <label>Введите роль на латинице</label>
            <input
              type="text"
              required
              value={roleLat}
              onChange={(e) => setRoleLat(e.target.value)}
              disabled={loading}
              minLength={2}
            />
          </div>
          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="create-btn modal-button"
            disabled={loading}
          >
            {loading ? "Загрузка..." : "Сохранить"}
          </button>
        </form>
        <button
          className="cancel-btn modal-button"
          onClick={onClose}
          disabled={loading}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

export default AddRole;
