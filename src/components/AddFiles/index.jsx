import { useState, useRef, useCallback } from "react";

function AddFiles({ formData, handleFileChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const event = {
          target: {
            files: files,
            name: "files",
          },
        };
        handleFileChange(event);
      }
    },
    [handleFileChange]
  );

  const handleAreaClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleRemoveFile = useCallback(
    (indexToRemove) => {
      const currentFiles = formData.files || [];
      const updatedFiles = currentFiles.filter(
        (_, index) => index !== indexToRemove
      );
      const event = {
        target: {
          files: updatedFiles,
          name: "files",
          isRemoval: true,
        },
      };

      handleFileChange(event);
    },
    [formData.files, handleFileChange]
  );

  const filesToDisplay = formData.files || [];
  const filesCount = filesToDisplay.length;

  return (
    <div className="create__block">
      <div
        className={`file-upload ${isDragging ? "file-upload--dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleAreaClick}
        style={{
          cursor: "pointer",
          border: isDragging ? "2px dashed #3b82f6" : "2px dashed #d1d5db",
          backgroundColor: isDragging ? "#f0f9ff" : "transparent",
          transition: "all 0.2s ease",
          padding: "10px",
        }}
      >
        <img src="/files.svg" alt="загрузка файлов" />
        <div>
          Перетащите файл сюда или&nbsp;
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            загрузите
          </a>
        </div>
        {
          <span
            style={{
              margin: "0 auto",
              color: "rgba(156, 163, 175, 1)",
              fontSize: "14px",
            }}
          >
            Поддержка нескольких типов файлов
          </span>
        }
        <input
          ref={fileInputRef}
          type="file"
          id="files"
          name="files[]"
          multiple
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      {filesToDisplay.length > 0 && (
        <ul style={{ marginTop: "20px" }}>
          {filesToDisplay.map((file, index) => (
            <li
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <span style={{ flex: 1 }}>{file.name}</span>
              <button
                className="delete-btn"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemoveFile(index);
                }}
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
      {filesCount > 0 && (
        <div style={{ marginTop: "10px" }}>Выбрано файлов: {filesCount}</div>
      )}
    </div>
  );
}

export default AddFiles;
