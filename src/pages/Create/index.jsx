import "./style.css";

function CreatePage() {
  return (
    <section className="page" style={{ flex: 1 }}>
      <div className="create">
        <div className="create__headline">
          <h3>Создать новую задачу</h3>
          <p>Заполните детали чтобы создать новую задачу</p>
        </div>
        <form className="create__form">
          <div className="create__block">
            <label htmlFor="theme">Тема задачи *</label>
            <input type="text" id="theme" name="theme" required />
          </div>
          <div className="create__block">
            <label htmlFor="deadline">Срок исполнения</label>
            <input type="text" id="deadline" name="deadline" required />
          </div>
          <div className="create__block">
            <label htmlFor="user">Выбрать пользователя *</label>
            <input type="text" id="user" name="user" required />
          </div>

          <div className="create__block">
            <label htmlFor="description">Описание задачи *</label>
            <textarea
              type="text"
              id="description"
              name="description"
              required
            ></textarea>
          </div>

          <div className="create__block">
            <div className="label" htmlFor="file">
              Файлы *
            </div>

            <div className="file-upload">
              <img src="/files.svg" alt="загрузка файлов" />

              <div>
                Перетащите файлы сюда или&nbsp;
                <a href="#">загрузите</a>
                <input
                  type="file"
                  id="file-input"
                  multiple
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
          </div>

          <div>
            <div
              className="create__block"
              id="links-container"
              style={{ marginBottom: "10px" }}
            >
              <label htmlFor="links">Ссылки *</label>
              <input type="text" id="links" name="links" required />
            </div>
            <a
              href="#"
              className="add-link"
              id="add-link"
              style={{ marginTop: "10px" }}
            >
              Добавить ещё ссылку
            </a>
          </div>

          <div className="create__btns">
            <button className="cancel-btn">Отмена</button>
            <button className="create-btn">Создать задачу</button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default CreatePage;
