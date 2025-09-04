import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Modal from "./../Modal";
import "./style.css";

function Header() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const openModal = () => setIsModalOpen(true);

  const handleLoginSuccess = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const token = getCookie("authTokenPM");
    setIsAuthenticated(!!token);
  }, []);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const Logout = () => {
    document.cookie =
      "authTokenPM=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
    localStorage.removeItem("userData");
    navigate("/");
    window.location.reload();
    setIsAuthenticated(false);
  };
  return (
    <>
      <header>
        <div>
          <NavLink to="/">Limaudio Project Management</NavLink>
          <b></b>
        </div>

        <ul>
          {isAuthenticated && (
            <>
              <li>
                <b className="user-email"></b>
              </li>
              <li>
                <NavLink
                  to="/user"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Дашборд
                </NavLink>
              </li>
              <li>Направления</li>
              <li>
                <NavLink
                  to="/create"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Постановка задач
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/team"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Команда
                </NavLink>
              </li>
            </>
          )}
          <li id="auth-button" onClick={isAuthenticated ? Logout : openModal}>
            {isAuthenticated ? "Выйти" : "Войти"}
          </li>
        </ul>
      </header>
      {isModalOpen && (
        <Modal onCancel={handleCancel} onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default Header;
