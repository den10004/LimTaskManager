import { useEffect, useState } from "react";
import { formatDate } from "../../utils/dateUtils";
import { getTranslatedRole } from "../../utils/rolesTranslations";
import AddUser from "../../components/Modal/AddUser";
import { useAuth } from "../../contexts/AuthContext";
import { useTeam } from "../../contexts/TeamContext";
import AddRole from "../../components/Modal/AddRole";
import { getCookie } from "../../utils/getCookies";

function TeamPage() {
  const { userData } = useAuth();
  const { team, loading, error } = useTeam();
  const rolesUser = userData.roles.join("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [rolesList, setRolesList] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState("");

  const API_URL = import.meta.env.VITE_API_KEY;
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
  console.log(rolesList);
  useEffect(() => {
    if (rolesUser === "admin") {
      fetchRoles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolesUser, token]);

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

  return (
    <section className="container">
      <h3 className="h3-mtmb">Команда</h3>

      {rolesLoading ? (
        <div className="loading">Загрузка данных...</div>
      ) : error ? (
        <div className="error error-message">{error}</div>
      ) : (
        <div className="container-scroll">
          {team.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Телеграм</th>
                  <th>Создан</th>
                  <th>Роль</th>
                  <th className="lastRow"></th>
                </tr>
              </thead>
              <tbody>
                {team.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.telegram_id}</td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>
                      {user.roles && user.roles.length > 0
                        ? user.roles.map((link, index) => {
                            const translatedRole = getTranslatedRole(link);
                            return <div key={index}>{translatedRole}</div>;
                          })
                        : "-"}
                    </td>
                    <td className="lastRow">
                      {rolesUser === "admin" && (
                        <button
                          className="change-btn"
                          onClick={() => openEditModal(user)}
                        >
                          Редактирование
                        </button>
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

      {rolesUser === "admin" && (
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

      {loading ? (
        <div className="loading">Загрузка данных...</div>
      ) : rolesError ? (
        <div className="error error-message">{error}</div>
      ) : (
        <div className="container-scroll">
          {team.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Имя латиницей</th>
                </tr>
              </thead>
              <tbody>
                {team.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
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

      {rolesUser === "admin" && (
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
        onUserCreated={handleUserActionSuccess}
        mode={modalMode}
        user={selectedUser}
      />

      <AddRole isOpen={roleOpen} onClose={closeModal} mode={modalMode} />
    </section>
  );
}

export default TeamPage;
