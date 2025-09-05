/**
 * @param {string} dateString
 * @param {string} emptyText
 * @returns {string}
 */
export const formatDate = (dateString, emptyText = "") => {
  if (!dateString) return emptyText;

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Неверная дата";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error("Ошибка при форматировании даты:", error);
    return "Ошибка даты";
  }
};

/**

 * @param {string} dateString
 * @param {string} emptyText
 * @returns {string} 
 */
export const formatDateOnly = (dateString, emptyText = "") => {
  if (!dateString) return emptyText;

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Неверная дата";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  } catch (error) {
    console.error("Ошибка при форматировании даты:", error);
    return "Ошибка даты";
  }
};

/**
 * @param {string} dateString
 * @param {string} emptyText
 * @returns {string}
 */
export const formatTimeOnly = (dateString, emptyText = "") => {
  if (!dateString) return emptyText;

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Неверная дата";
    }

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  } catch (error) {
    console.error("Ошибка при форматировании времени:", error);
    return "Ошибка времени";
  }
};
