export const roleTranslations = {
  admin: "администратор",
  sales_manager: "менеджер продаж",
};

export const getTranslatedRole = (role) => {
  return roleTranslations[role] || role;
};

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
  "Задача принята в работу",
];

export const statusColors = {
  "Задача просрочена": "red",
  Новая: "#24c5eeff",
  "Задача выполнена": "#2eac08ff",
  "Задача принята в работу": "#0950d3ff",
};

export const colorMap = {
  44247: "#ff6b6b",
  44086: "#4e96e9ff",
  43668: "#1bb830ff",
};
