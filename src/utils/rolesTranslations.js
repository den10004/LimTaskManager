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
