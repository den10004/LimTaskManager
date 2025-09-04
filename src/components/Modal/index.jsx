import React from "react";
import "./style.css";

function Modal() {
  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "8px",
        width: "300px",
      }}
    >
      <h2>Вход в систему</h2>
      <form id="login-form">
        <div style={{ marginBottom: "15px" }}>
          <label>Email:</label>
          <input
            type="email"
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Пароль:</label>
          <input
            type="password"
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <button
          type="submit"
          class="create-btn"
          style={{ width: "100%", padding: "10px" }}
        >
          Войти
        </button>
      </form>
      <button
        id="modal-cancel-btn"
        className="cancel-btn"
        style={{
          marginTop: "10px",
          width: "100%",
          padding: "10px",
          border: "1px solid black",
        }}
      >
        Отмена
      </button>
    </div>
  );
}

export default Modal;
