import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";

function Modal({ onCancel, onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function setCookie(name, value, options = {}) {
    let updatedOptions = Object.assign(
      { path: "/", httpOnly: true, sameSite: "lax" },
      options
    );

    if (window.location.protocol === "https:") {
      updatedOptions.secure = true;
    } else {
      delete updatedOptions.secure;
    }

    const expires = updatedOptions.expires
      ? `expires=${updatedOptions.expires.toUTCString()};`
      : "";
    document.cookie = `${name}=${encodeURIComponent(
      value
    )};${expires}${Object.entries(updatedOptions)
      .filter(([, v]) => v !== undefined && !["path", "sameSite"].includes(v))
      .map(([k, v]) => (k === "httpOnly" ? ";httponly" : `${k}=${v}`))
      .join("")}`;
  }

  const LoginUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    fetch("https://task-manager.conversionpro-test.ru/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        if (data.token) {
          setCookie("authTokenPM", data.token);

          const userData = {
            email: data.user.email,
            id: data.user.id,
            name: data.user.name,
            roles: data.user.roles,
            telegram_id: data.user.telegram_id,
          };
          localStorage.setItem("userData", JSON.stringify(userData));
          setIsLoading(false);
          onLoginSuccess();
          navigate("/user");
          window.location.reload();
        } else {
          throw new Error("Отсутствует токен в ответе");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Ошибка: " + error.message);
      });
  };

  return (
    <div className="modal-backdrop">
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "300px",
        }}
      >
        <h2>Вход в систему</h2>
        <form id="login-form" onSubmit={LoginUser}>
          <div style={{ marginBottom: "15px" }}>
            <label>Email:</label>
            <input
              type="email"
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Пароль:</label>
            <input
              type="password"
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="create-btn"
            style={{ width: "100%", padding: "10px" }}
            disabled={isLoading}
          >
            {isLoading ? "Загрузка..." : "Войти"}
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
          onClick={onCancel}
          disabled={isLoading}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

export default Modal;
