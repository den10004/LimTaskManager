import { useState } from "react";
import { formatDate } from "../../utils/dateUtils";
import { getTranslatedRole } from "../../utils/rolesTranslations";
import AddUser from "../../components/Modal/AddUser";
import { useAuth } from "../../contexts/AuthContext";
import { useTeam } from "../../contexts/TeamContext";

function TeamPage() {
  const { userData } = useAuth();
  const { team, loading, error } = useTeam();
  const rolesUser = userData.roles.join("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setModalMode("");
  };

  const openCreateModal = () => {
    setIsModalOpen(true);
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

      {loading ? (
        <div className="loading">Загрузка данных...</div>
      ) : error ? (
        <div className="error error-message">{error}</div>
      ) : (
        <div className="container-scroll">
          {team.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
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
                    <td>{user.id}</td>
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

          {rolesUser === "admin" && (
            <button
              type="submit"
              className="create-btn"
              onClick={openCreateModal}
            >
              Создать пользователя
            </button>
          )}
        </div>
      )}
      <AddUser
        isOpen={isModalOpen}
        onClose={closeModal}
        onUserCreated={handleUserActionSuccess}
        mode={modalMode}
        user={selectedUser}
      />
    </section>
  );
}

export default TeamPage;
