/*
export const roleTranslations = {
  admin: "администратор",
  sales_manager: "менеджер продаж",
};

export const getTranslatedRole = (role) => {
  return roleTranslations[role] || role;
};
*/
export const restrictedDirections = [
  "Дистрибуция",
  "Партнерская программа",
  "Строительство",
];

export const taskStatus = [
  "Задача просрочена",
  "Задача выполнена",
  "Ответственный назначен",
  "Новая",
  "Задача в работе",
];

export const statusColors = {
  "Задача просрочена": "var(--color-err)",
  Новая: "var(--color-blue)",
  "Задача выполнена": "var(--color-green)",
  "Задача в работе": "var(--color-blue)",
};

export const colorMap = {
  44247: "var(--color-err)",
  44086: "var(--color-blue)",
  43668: "var(--color-green)",
};
