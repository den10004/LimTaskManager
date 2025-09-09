function AddFiles({ formData, handleFileChange }) {
  return (
    <div className="create__block">
      <div className="label">Файлы</div>
      <div className="file-upload">
        <img src="/files.svg" alt="загрузка файлов" />
        <div>
          Перетащите файлы сюда или&nbsp;
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("files").click();
            }}
          >
            загрузите
          </a>
          <input
            type="file"
            id="files"
            name="files"
            multiple
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>
        <span
          style={{
            margin: "0 auto",
            color: "rgba(156, 163, 175, 1)",
            fontSize: "14px",
          }}
        >
          Поддержка нескольких типов файлов
        </span>
      </div>

      {formData.files.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          Выбрано файлов: {formData.files.length}
        </div>
      )}
    </div>
  );
}

export default AddFiles;
