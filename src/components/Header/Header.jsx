import { useState } from "react";
import { NavLink } from "react-router-dom";
import Modal from "./../Modal";
import "./style.css";

function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  return (
    <>
      <header>
        <div>
          <b>Limaudio Project Management</b>
        </div>

        <ul>
          <li>
            <b className="user-email"></b>
          </li>
          <li>
            <NavLink to="/user" className="nav-link" activeClassName="active">
              Дашборд
            </NavLink>
          </li>
          <li>
            <NavLink to="/x" className="nav-link" activeClassName="active">
              Направления
            </NavLink>
          </li>
          <li>
            <NavLink to="/create" className="nav-link" activeClassName="active">
              Постановка задач
            </NavLink>
          </li>
          <li>
            <NavLink to="/team" className="nav-link" activeClassName="active">
              Команда
            </NavLink>
          </li>
          <li id="auth-button" onClick={openModal}>
            Войти
          </li>
        </ul>
      </header>
      {isModalOpen && <Modal />}
    </>
  );
}

export default Header;
