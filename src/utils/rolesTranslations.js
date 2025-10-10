export const OVERDUE = "Просрочена";
export const COMPLETED = "Выполнена";
export const WORK = "В работе";
export const ASSIGNED = "Ответственный назначен";
export const ADMIN = "Администратор";

export const API_URL = import.meta.env.VITE_API_KEY;

export const PAGE_SIZE = 20;

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

export const normalizeUrl = (url) => {
  if (!url) return "";

  if (url.startsWith("https://") || url.startsWith("http://")) {
    return url;
  }

  if (url.startsWith("www.")) {
    return "https://" + url;
  }

  return "https://" + url;
};
