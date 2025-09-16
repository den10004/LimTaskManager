import { useState } from "react";

const datePickerModalStyle = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "5px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  zIndex: 1000,
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  zIndex: 999,
};

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
    <>
      <div
        style={overlayStyle}
        onClick={handleClose}
        className="modal-backdrop"
      />
      <div style={datePickerModalStyle}>
        <h2>Выберите срок выполнения</h2>
        <input
          type="datetime-local"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          style={{
            marginBottom: "10px",
            width: "100%",
            zIndex: 1002,
          }}
        />
        <div style={{ display: "flex", gap: "10px", zIndex: 1002 }}>
          <button
            className="create-btn modal-button"
            onClick={handleSave}
            disabled={loading || !newDate}
            style={{ zIndex: 1002 }}
          >
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
          <button
            className="create-btn modal-button"
            onClick={handleClose}
            style={{ zIndex: 1002 }}
          >
            Отмена
          </button>
        </div>
      </div>
    </>
  );
}

export default DateModal;
