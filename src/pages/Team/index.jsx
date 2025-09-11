import { formatDate } from "../../utils/dateUtils";
import { getTranslatedRole } from "../../utils/rolesTranslations";
import useFetchTeam from "../../hooks/useFetchTeam";
import AddUser from "../../components/Modal/AddUser";
import { useState } from "react";

function TeamPage() {
  const API_URL = import.meta.env.VITE_API_KEY;

  const { team, loading, error, refetch } = useFetchTeam(API_URL);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setIsModalOpen(true);
    setModalMode("create");
  };

  const openEditModal = (taskId) => {
    setSelectedTaskId(taskId);
    setModalMode("edit");
    setIsModalOpen(true);
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
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {team.map((task) => (
                  <tr key={task.id}>
                    <td>{task.id}</td>
                    <td>{task.name}</td>
                    <td>{task.email}</td>
                    <td>{task.telegram_id}</td>
                    <td>{formatDate(task.created_at)}</td>
                    <td>
                      {task.roles && task.roles.length > 0
                        ? task.roles.map((link, index) => {
                            const translatedRole = getTranslatedRole(link);
                            return <div key={index}>{translatedRole}</div>;
                          })
                        : "-"}
                    </td>
                    <td>
                      <button
                        className="create-btn"
                        onClick={() => openEditModal(task.id)}
                      >
                        Редактирование
                      </button>
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

          <button
            type="submit"
            className="create-btn"
            onClick={openCreateModal}
          >
            Coздать пользователя
          </button>
        </div>
      )}
      <AddUser
        isOpen={isModalOpen}
        onClose={closeModal}
        onUserCreated={refetch}
        mode={modalMode}
        id={selectedTaskId}
      />
    </section>
  );
}

export default TeamPage;
