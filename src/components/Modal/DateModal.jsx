import { useState } from "react";

function DateModal({
  isOpen,
  onClose,
  onSave,
  initialDate = "",
  loading = false,
}) {
  const [newDate, setNewDate] = useState(initialDate);

  const handleSave = () => {
    onSave(newDate);
  };

  const handleClose = () => {
    setNewDate(initialDate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Выберите срок выполнения</h2>
        <input
          type="datetime-local"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          style={{
            margin: "10px 0",
            width: "100%",
          }}
        />
        <div>
          <button
            className="create-btn modal-button"
            onClick={handleSave}
            disabled={loading || !newDate}
          >
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
          <button
            className="cancel-btn modal-button"
            onClick={handleClose}
            style={{ marginTop: "10px" }}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

export default DateModal;
