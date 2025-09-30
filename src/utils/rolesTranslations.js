export const OVERDUE = "Просрочена";
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
  [COMPLETED]: "#db9fe9",
  [WORK]: "var(--color-green)",
};
/*
export const colorMap = {
  44247: "var(--color-err)",
  44086: "var(--color-blue)",
  43668: "var(--color-green)",
};
*/
