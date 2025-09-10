import { formatDate } from "../../utils/dateUtils";
import { getTranslatedRole } from "../../utils/rolesTranslations";
import useFetchTeam from "../../hooks/useFetchTeam";

function TeamPage() {
  const API_URL = import.meta.env.VITE_API_KEY;

  const { team, loading, error } = useFetchTeam(API_URL);

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
                        ? task.roles.map((link, index) => (
                            <div key={index}>{getTranslatedRole(link)}</div>
                          ))
                        : "-"}
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
    </section>
  );
}

export default TeamPage;
