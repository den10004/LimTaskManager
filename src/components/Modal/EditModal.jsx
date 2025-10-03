import { useState, useEffect } from "react";

function EditModal({
  isOpen,
  onClose,
  onSave,
  initialValue = "",
  loading = false,
  type = "description",
}) {
  const [newValue, setNewValue] = useState(initialValue);

  useEffect(() => {
    setNewValue(initialValue);
  }, [initialValue, type]);

  const handleSave = () => {
    onSave(newValue);
  };

  const handleClose = () => {
    setNewValue(initialValue);
    onClose();
  };

  if (!isOpen) return null;

  const isDateType = type === "date";
  const title = isDateType
    ? "Выберите срок выполнения"
    : "Редактирование описания";
  const inputType = isDateType ? "datetime-local" : "text";
  const minDate = isDateType
    ? new Date().toISOString().slice(0, 16)
    : undefined;
  const isSaveDisabled = loading || !newValue;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{title}</h2>
        <input
          type={inputType}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          min={minDate}
          style={{
            margin: "10px 0",
            width: "100%",
          }}
        />
        <div>
          <button
            className="create-btn modal-button"
            onClick={handleSave}
            disabled={isSaveDisabled}
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

export default EditModal;
