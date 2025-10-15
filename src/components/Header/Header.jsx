import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Modal from "./../Modal";
import { useAuth } from "../../contexts/AuthContext";
import { useUser } from "../../contexts/UserContext";
import "./style.css";

function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, userData, logout } = useAuth();
  const { userInfo } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasAddPermission =
    userInfo?.permissions?.includes("Добавление записей");

  const navLinks = [
    { to: "/kanban", label: "Доска" },
    { to: "/calendar", label: "Календарь" },
    { to: "/task", label: "Задачи" },
    { to: "/directions", label: "Направления" },
    { to: "/team", label: "Команда" },
  ];

  if (hasAddPermission) {
    navLinks.splice(4, 0, { to: "/create", label: "Постановка задач" });
  }

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

  const getInitials = (name) => {
    if (!name) return "";

    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return (
      words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <header>
      <div>
        <div
          style={{ alignItems: "center", textAlign: "center", display: "flex" }}
        >
          <NavLink to="/">
            <svg
              version="1.1"
              viewBox="0 0 1400 222"
              width="140"
              height="35"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="g7" transform="translate(-307.62,-889.08)">
                <path
                  d="m 546.17,889.09 c -16.34,0 -32.15,6.81 -43.37,18.69 l -112.91,119.55 h 81.1 l 76.04,-80.51 v 104.91 c 0,0 -65.32,0 -65.32,0 l -55.63,58.96 h 65.02 v 0.21 H 605.99 V 889.08 h -59.82 z"
                  id="path1"
                ></path>
                <path
                  id="polygon1"
                  d="m 392.53,1110.7 55.63,-58.96 H 366.58 V 889.09 h -58.96 v 221.61 z"
                ></path>
                <path
                  id="polygon2"
                  d="m 724.6,1078.69 h 4.12 74.76 v -17.01 H 728.72 V 920.93 h -20.91 v 157.76 z"
                ></path>
                <path
                  id="rect2"
                  d="m 828.84003,920.92999 h 20.91 V 1078.69 h -20.91 z"
                ></path>
                <path
                  id="polygon3"
                  d="M 966.23,1049.54 914.54,920.93 h -8.99 -11.27 -6.61 v 157.76 h 20.8 v -61.55 l -2.01,-66.15 51.75,127.7 h 15.82 l 51.85,-127.52 -2.01,65.97 v 61.55 h 20.8 V 920.93 h -6.5 -11.38 -8.99 z"
                ></path>
                <path
                  d="m 1142.08,920.93 h -13.76 l -60.13,157.76 h 21.34 l 14.99,-41.28 h 65.98 l 15.03,41.28 h 21.45 l -60.35,-157.76 z m -31.34,99.36 26.74,-73.61 26.79,73.61 z"
                  id="path3"
                ></path>
                <path
                  d="m 1316.53,1027.65 c 0,8.23 -1.52,15.02 -4.55,20.37 -3.03,5.35 -7.28,9.32 -12.73,11.92 -5.46,2.6 -11.83,3.9 -19.13,3.9 -7.3,0 -13.56,-1.3 -19.01,-3.9 -5.45,-2.6 -9.7,-6.57 -12.73,-11.92 -3.03,-5.35 -4.55,-12.14 -4.55,-20.37 V 920.92 h -20.7 v 106.73 c 0,11.85 2.51,21.71 7.53,29.58 5.02,7.88 11.85,13.78 20.48,17.72 8.63,3.94 18.29,5.9 28.98,5.9 10.69,0 19.63,-1.97 28.33,-5.9 8.7,-3.94 15.69,-9.84 20.97,-17.72 5.27,-7.87 7.91,-17.73 7.91,-29.58 V 920.92 h -20.8 z"
                  id="path4"
                ></path>
                <path
                  d="m 1465.13,940.92 c -6.17,-6.46 -13.53,-11.41 -22.05,-14.84 -8.52,-3.43 -17.95,-5.15 -28.28,-5.15 h -44.64 v 157.76 h 42.69 c 10.98,0 20.86,-1.71 29.63,-5.15 8.78,-3.43 16.29,-8.36 22.54,-14.79 6.25,-6.43 11.03,-14.21 14.36,-23.35 3.32,-9.14 4.98,-19.41 4.98,-30.83 v -9.43 c 0,-11.41 -1.66,-21.69 -4.98,-30.83 -3.32,-9.14 -8.07,-16.94 -14.25,-23.4 z m -1.46,63.66 c 0,11.49 -1.9,21.51 -5.69,30.07 -3.79,8.56 -9.44,15.21 -16.96,19.94 -7.51,4.73 -16.9,7.1 -28.17,7.1 h -21.78 V 938.06 h 23.73 c 7.8,0 14.72,1.26 20.75,3.79 6.03,2.53 11.14,6.23 15.33,11.11 4.19,4.88 7.37,10.83 9.54,17.88 2.17,7.04 3.25,15.08 3.25,24.11 v 9.64 z"
                  id="path5"
                ></path>
                <path
                  id="rect5"
                  d="m 1517.3,920.92999 h 20.91 V 1078.69 h -20.91 z"
                ></path>
                <path
                  d="m 1693.11,963.02 c -3,-9.35 -7.3,-17.33 -12.89,-23.95 -5.6,-6.61 -12.28,-11.65 -20.05,-15.12 -7.77,-3.47 -16.45,-5.2 -26.06,-5.2 -9.61,0 -17.86,1.73 -25.63,5.2 -7.76,3.47 -14.46,8.51 -20.1,15.12 -5.63,6.61 -9.99,14.59 -13.06,23.95 -3.07,9.36 -4.61,19.96 -4.61,31.8 v 9.97 c 0,11.85 1.55,22.46 4.66,31.85 3.11,9.39 7.49,17.37 13.16,23.95 5.67,6.57 12.39,11.6 20.15,15.06 7.76,3.47 16.31,5.2 25.63,5.2 9.32,0 18.29,-1.73 26.06,-5.2 7.76,-3.47 14.43,-8.49 19.99,-15.06 5.56,-6.57 9.82,-14.55 12.79,-23.95 2.96,-9.39 4.44,-20.01 4.44,-31.85 v -9.97 c 0,-11.85 -1.5,-22.45 -4.5,-31.8 z m -16.2,41.77 c 0,9.46 -0.94,17.82 -2.82,25.08 -1.88,7.26 -4.64,13.36 -8.29,18.31 -3.65,4.95 -8.11,8.69 -13.38,11.21 -5.27,2.53 -11.31,3.79 -18.09,3.79 -6.78,0 -12.37,-1.26 -17.61,-3.79 -5.24,-2.53 -9.75,-6.27 -13.54,-11.21 -3.79,-4.95 -6.7,-11.05 -8.72,-18.31 -2.02,-7.26 -3.03,-15.62 -3.03,-25.08 V 994.6 c 0,-9.39 1.01,-17.7 3.03,-24.92 2.02,-7.22 4.89,-13.29 8.61,-18.2 3.72,-4.91 8.2,-8.63 13.44,-11.16 5.24,-2.53 11.11,-3.79 17.61,-3.79 6.5,0 12.73,1.26 18.04,3.79 5.31,2.53 9.81,6.25 13.49,11.16 3.68,4.91 6.48,10.98 8.4,18.2 1.91,7.22 2.87,15.53 2.87,24.92 v 10.19 z"
                  id="path6"
                ></path>
              </g>
            </svg>
          </NavLink>
        </div>
        <div className="header__account">
          {userData && (
            <>
              <div className="header__user">
                <div className="circle">{getInitials(userData.name)}</div>
                <div>
                  <b>{userData.name}</b>
                  <p>{userData.email}</p>
                  {userData?.roles?.map((role, index) => (
                    <p key={index}>{role}</p>
                  ))}

                  {[...new Set(userInfo?.permissions || [])]?.map(
                    (permission, index) => (
                      <p key={index}>{permission}</p>
                    )
                  )}
                </div>
              </div>
            </>
          )}
          <div>
            <button
              className="delete-btn"
              id="auth-button"
              onClick={isAuthenticated ? handleLogout : openModal}
            >
              {isAuthenticated ? "Выйти" : "Войти"}
            </button>
          </div>
        </div>
      </div>
      <ul>
        {isAuthenticated && (
          <>
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </>
        )}
      </ul>
      {isModalOpen && (
        <Modal onCancel={handleCancel} onLoginSuccess={handleLoginSuccess} />
      )}
    </header>
  );
}

export default Header;
