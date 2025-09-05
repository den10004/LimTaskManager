export const getCookie = (name) => {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const token = parts.pop().split(";").shift();
      return token;
    }
    console.log("Cookie не найден");
    return null;
  } catch (error) {
    console.error("Ошибка при чтении cookie:", error);
    return null;
  }
};
