export const OVERDUE = "Просрочено";
export const COMPLETED = "Выполнена";
export const WORK = "В работе";
export const ASSIGNED = "Ответственный назначен";

export const taskStatus = [
  [OVERDUE],
  [COMPLETED],
  [ASSIGNED],
  // "Новая",
  [WORK],
];

export const statusColors = {
  [OVERDUE]: "var(--color-err)",
  // Новая: "var(--color-blue)",
  [COMPLETED]: "var(--color-blue)",
  [WORK]: "var(--color-green)",
};
