import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Modal from "./../Modal";
import { useAuth } from "../../contexts/AuthContext";
import "./style.css";

function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, userData, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);

  const handleLoginSuccess = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <header>
        <div>
          <NavLink to="/">Limaudio Project Management</NavLink>{" "}
          {userData && <b>{userData.email}</b>}
        </div>
        <ul>
          {isAuthenticated && (
            <>
              <li>
                <b className="user-email"></b>
              </li>
              <li>
                <NavLink
                  to="/kanban"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Доска
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/calendar"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Календарь
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/task"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Задачи
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/directions"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Направления
                </NavLink>
              </li>
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
          <li
            id="auth-button"
            onClick={isAuthenticated ? handleLogout : openModal}
          >
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
