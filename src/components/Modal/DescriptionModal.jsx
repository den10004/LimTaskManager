import { useState } from "react";

function DescriptionModal({
  isOpen,
  onClose,
  onSave,
  initialDescr = "",
  loading = false,
}) {
  const [newDescription, setNewDescription] = useState(initialDescr);

  const handleSave = () => {
    onSave(newDescription);
  };

  const handleClose = () => {
    setNewDescription(initialDescr);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Редактирование описания</h2>
        <input
          type="text"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          style={{
            margin: "10px 0",
            width: "100%",
          }}
        />
        <div>
          <button
            className="create-btn modal-button"
            onClick={handleSave}
            disabled={loading || !newDescription}
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

export default DescriptionModal;
