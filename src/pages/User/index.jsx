import React from "react";
import "./style.css";

function UserPage() {
  return (
    <section className="user">
      <h3 className="h3-mtmb">Список задач</h3>
      <table id="dataTable">
        <thead>
          <tr>
            <th>ID</th>
            <th>Пользователь</th>
            <th>Описание</th>
            <th>Текст</th>
          </tr>
        </thead>
        <tbody id="tableBody"></tbody>
      </table>
    </section>
  );
}

export default UserPage;
