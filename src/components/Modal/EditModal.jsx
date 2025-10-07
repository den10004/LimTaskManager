import { useEffect, useState } from "react";
import { normalizeUrl } from "../../utils/rolesTranslations";

function EditModal({
  isOpen,
  onClose,
  onSave,
  initialValue = "",
  loading = false,
  type = "description",
}) {
  const [newValue, setNewValue] = useState("");
  const [showUrlError, setShowUrlError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (type === "link") {
        setNewValue("");
      } else {
        setNewValue(initialValue);
      }
      setShowUrlError(false);
    }
  }, [isOpen, initialValue, type]);

  const handleSave = () => {
    if (isLinkType) {
      const normalizedUrl = normalizeUrl(newValue);
      onSave(normalizedUrl);
    } else {
      onSave(newValue);
    }
  };

  const handleClose = () => {
    setNewValue("");
    setShowUrlError(false);
    onClose();
  };

  const handleUrlChange = (e) => {
    const value = e.target.value;
    setNewValue(value);

    if (value.trim()) {
      const normalized = normalizeUrl(value);
      setShowUrlError(!isValidUrl(normalized));
    } else {
      setShowUrlError(false);
    }
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (!isOpen) return null;

  const isDateType = type === "date";
  const isDescriptionType = type === "description";
  const isLinkType = type === "link";

  const title = isDateType
    ? "Выберите срок выполнения"
    : isLinkType
    ? "Добавить ссылку"
    : "Редактирование описания";

  const inputType = isDateType ? "datetime-local" : "text";
  const minDate = isDateType
    ? new Date().toISOString().slice(0, 16)
    : undefined;
  const isSaveDisabled = loading || !newValue.trim();

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{title}</h2>
        {isDescriptionType ? (
          <textarea
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            rows={6}
            style={{
              margin: "10px 0",
              width: "100%",
              resize: "vertical",
            }}
          />
        ) : isLinkType ? (
          <div>
            <input
              type="url"
              value={newValue}
              onChange={handleUrlChange}
              placeholder="example.com или https://example.com"
              style={{
                margin: "10px 0",
                width: "100%",
                padding: "8px",
                border: showUrlError ? "1px solid red" : "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            {showUrlError && (
              <div
                style={{
                  color: "red",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
              >
                Введите корректный URL
              </div>
            )}
            {newValue && !showUrlError && (
              <div
                style={{
                  color: "green",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
              >
                Будет сохранено как: {normalizeUrl(newValue)}
              </div>
            )}
          </div>
        ) : (
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
        )}
        <div>
          <button
            className="create-btn modal-button"
            onClick={handleSave}
            disabled={isSaveDisabled || (isLinkType && showUrlError)}
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
