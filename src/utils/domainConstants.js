export const OVERDUE = "Просрочена";
export const COMPLETED = "Выполнена";
export const WORK = "В работе";
export const ASSIGNED = "Ответственный назначен";
export const ADMIN = "Администратор";

// Единый источник правды для размера страницы
export const PAGE_SIZE = 20;

// Плоский список статусов
export const taskStatus = [OVERDUE, COMPLETED, ASSIGNED, WORK];

export const statusColors = {
  [OVERDUE]: "rgb(254, 202, 202)",
  [COMPLETED]: "rgb(219, 234, 254)",
  [WORK]: "rgb(209, 250, 229)",
};

export const statusColorsC = {
  [OVERDUE]: "rgb(153, 27, 27)",
  [COMPLETED]: "rgb(30, 64, 175)",
  [WORK]: "rgb(6, 95, 70)",
};

export const URGENCY_COLORS = {
  low: "var(--color-green)",
  medium: "orange",
  high: "var(--color-err)",
};



