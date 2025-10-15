import { useEffect, useState } from "react";
import { formatDate } from "../../utils/dateUtils";
import AddUser from "../../components/Modal/AddUser";
import { useAuth } from "../../contexts/AuthContext";
import { useTeam } from "../../contexts/TeamContext";
import AddRole from "../../components/Modal/AddRole";
import Toast from "../../components/Toast";
import { getCookie } from "../../utils/getCookies";
import { ADMIN, API_URL } from "../../utils/rolesTranslations";

function TeamPage() {
  const { userData } = useAuth();
  const { team, loading, error } = useTeam();
  const rolesUser = userData.roles.join("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [rolesList, setRolesList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState("");
  const [toast, setToast] = useState({
    show: false,
    text: "",
    color: "",
  });

  const token = getCookie("authTokenPM");

  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      setRolesError("");

      const response = await fetch(`${API_URL}/roles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Ошибка загрузки списка ролей");
      }

      const data = await response.json();

      setRolesList(data.items);
    } catch (error) {
      setRolesError(error.message);
      console.error("Ошибка при загрузке ролей:", error);
    } finally {
      setRolesLoading(false);
    }
  };

  useEffect(() => {
    setUserList(team);
  }, [team]);

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolesUser, token]);

  const handleDeleteRole = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту роль?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/roles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setToast({
        show: true,
        text: "Роль успешно удалена",
        color: "rgba(33, 197, 140, 1)",
      });
      if (!response.ok) {
        setToast({
          show: true,
          text: "Ошибка загрузки задачи",
          color: "red",
        });
        throw new Error("Ошибка удаления роли");
      }
      setRolesList((prevRoles) => prevRoles.filter((role) => role.id !== id));
    } catch (error) {
      console.error("Ошибка при удалении роли:", error);
      setToast({
        show: true,
        text: "Ошибка при удалении роли:",
        error,
        color: "red",
      });
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить пользователя?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setUserList((prevUsers) => prevUsers.filter((user) => user.id !== id));
      setToast({
        show: true,
        text: "Пользователь успешно удалена",
        color: "rgba(33, 197, 140, 1)",
      });
      if (!response.ok) {
        setToast({
          show: true,
          text: "Ошибка загрузки пользователя",
          color: "red",
        });
        throw new Error("Ошибка удаления пользователя");
      }
    } catch (error) {
      console.error("Ошибка при удалении пользователя:", error);
      setToast({
        show: true,
        text: "Ошибка при удалении пользователя:",
        error,
        color: "red",
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setRoleOpen(false);
    setSelectedUser(null);
    setModalMode("");
  };

  const openCreateModal = () => {
    setIsModalOpen(true);
    setModalMode("create");
  };

  const openRoleModal = () => {
    setRoleOpen(true);
    setModalMode("create");
  };

  const openEditRoleModal = (role) => {
    setSelectedUser(role);
    setModalMode("edit");
    setRoleOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleUserActionSuccess = (action, userData) => {
    if (action === "create") {
      team.unshift(userData);
    } else if (action === "edit" && selectedUser) {
      const index = team.findIndex((u) => u.id === selectedUser.id);
      if (index !== -1) {
        team[index] = { ...team[index], ...userData };
      }
    }
  };

  const handleRoleCreated = (newRole) => {
    try {
      setRolesList((prevRoles) => {
        const roleExists = prevRoles.some(
          (role) => role.id === newRole.id || role.name === newRole.name
        );

        if (roleExists) {
          return prevRoles.map((role) =>
            role.id === newRole.id || role.name === newRole.name
              ? newRole
              : role
          );
        } else {
          return [newRole, ...prevRoles];
        }
      });
    } catch (error) {
      console.error("Ошибка при добавлении роли в список:", error);
    }
  };

  return (
    <section className="container">
      <h3 className="h3-mtmb">Команда</h3>

      {loading ? (
        <div className="loading">Загрузка данных...</div>
      ) : error ? (
        <div className="error error-message">{error}</div>
      ) : (
        <div className="container-scroll">
          {userList.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Телеграм</th>
                  <th>Создан</th>
                  <th>Роль</th>
                  <th>Записи</th>
                  <th className="lastRow"></th>
                </tr>
              </thead>
              <tbody>
                {userList.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.telegram_id}</td>
                    <td>{formatDate(user.created_at)}</td>

                    <td>
                      {user?.roles[0]?.[0]}{" "}
                      <span
                        style={{
                          color: "var(--color-err)",
                          fontWeight: "bold",
                        }}
                      >
                        {!user?.roles.length && "Роль не определена"}
                      </span>
                    </td>

                    <td style={{ textAlign: "center" }}>
                      {user.permissions &&
                      user.permissions.includes("Добавление записей")
                        ? "✅"
                        : "❌"}
                    </td>

                    <td className="lastRow">
                      {rolesUser === ADMIN && (
                        <div
                          className="btns-direction"
                          style={{ flexDirection: "end" }}
                        >
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Удалить
                          </button>
                          <button
                            className="change-btn"
                            onClick={() => openEditModal(user)}
                          >
                            Редактировать
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="error error-message">
              Нет данных для отображения
            </div>
          )}
        </div>
      )}

      {rolesUser === ADMIN && (
        <button
          type="submit"
          style={{ marginTop: "20px" }}
          className="create-btn"
          onClick={openCreateModal}
        >
          Создать пользователя
        </button>
      )}

      <h3 className="h3-mtmb">Роли</h3>

      {rolesLoading ? (
        <div className="loading">Загрузка данных...</div>
      ) : rolesError ? (
        <div className="error error-message">{rolesError}</div>
      ) : (
        <div className="container-scroll">
          {rolesList.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Имя</th>
                  <th className="lastRow"></th>
                </tr>
              </thead>
              <tbody>
                {rolesList.map((role) => {
                  const isCurrentUserRole = userData?.roles?.includes(
                    role.name
                  );

                  return (
                    <tr key={role.id}>
                      <td>{role.name}</td>

                      <td className="lastRow" style={{ display: "flex" }}>
                        {rolesUser === ADMIN && !isCurrentUserRole && (
                          <div
                            className="btns-direction"
                            style={{ flexDirection: "end" }}
                          >
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteRole(role.id)}
                            >
                              Удалить
                            </button>
                            <button
                              className="change-btn"
                              onClick={() => openEditRoleModal(role)}
                            >
                              Редактировать
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="error error-message">
              Нет данных для отображения
            </div>
          )}
        </div>
      )}

      {rolesUser === ADMIN && (
        <button
          type="submit"
          style={{ marginTop: "10px" }}
          className="create-btn"
          onClick={openRoleModal}
        >
          Создать роль
        </button>
      )}

      <AddUser
        isOpen={isModalOpen}
        onClose={closeModal}
        rolesList={rolesList}
        onUserCreated={handleUserActionSuccess}
        mode={modalMode}
        user={selectedUser}
      />

      <AddRole
        isOpen={roleOpen}
        onClose={closeModal}
        mode={modalMode}
        role={selectedUser}
        onRoleCreated={handleRoleCreated}
      />

      {toast.show && (
        <Toast
          text={toast.text}
          color={toast.color}
          onClose={() => setToast({ show: false, text: "", color: "" })}
        />
      )}
    </section>
  );
}

export default TeamPage;
