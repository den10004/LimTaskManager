export const OVERDUE = "Просрочена";
export const COMPLETED = "Выполнена";
export const WORK = "В работе";
export const ASSIGNED = "Ответственный назначен";
export const ADMIN = "Администратор";

const envApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_KEY;
if (!envApiUrl) {
  // eslint-disable-next-line no-console
  console.error(
    "API base URL is not set. Please define VITE_API_URL in your environment."
  );
}
export const API_URL = envApiUrl;

export const PAGE_SIZE = 20;

export const taskStatus = [
  [OVERDUE],
  [COMPLETED],
  [ASSIGNED],
  // "Новая",
  [WORK],
];

export const statusColors = {
  [OVERDUE]: "rgb(254, 202, 202)",
  // Новая: "var(--color-blue)",
  [COMPLETED]: "rgb(219, 234, 254)",
  [WORK]: "rgb(209, 250, 229)",
};

export const statusColorsC = {
  [OVERDUE]: "rgb(153, 27, 27)",
  // Новая: "var(--color-blue)",
  [COMPLETED]: "rgb(30, 64, 175)",
  [WORK]: "rgb(6, 95, 70)",
};

export const URGENCY_COLORS = {
  low: "var(--color-green)",
  medium: "orange",
  high: "var(--color-err)",
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
