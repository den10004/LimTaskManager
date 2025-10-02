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

  return (
    <div className="create__block">
      <div className="label">Файлы</div>
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
        <input
          ref={fileInputRef}
          type="file"
          id="files"
          name="files"
          multiple
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      {formData.files.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          Выбрано файлов: {formData.files.files.length}
        </div>
      )}
    </div>
  );
}

export default AddFiles;
