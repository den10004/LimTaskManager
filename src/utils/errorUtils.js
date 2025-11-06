export function parseError(error) {
  if (!error) return { code: undefined, message: "" };
  if (typeof error === "string") return { code: undefined, message: error };
  const code = error.code ?? error.status ?? error?.response?.status;
  const message = error.message || error?.response?.data?.message || "";
  return { code, message };
}

export function isUnauthorized(error) {
  const { code, message } = parseError(error);
  if (code === 401) return true;
  const msg = (message || "").toLowerCase();
  return msg.includes("unauthorized") || msg.includes("401");
}

export async function parseResponseError(response) {
  if (!response) return { code: undefined, message: "" };
  const code = response.status;
  try {
    const data = await response.clone().json();
    return { code, message: data?.message || `HTTP ${code}` };
  } catch (_) {
    try {
      const text = await response.text();
      return { code, message: text || `HTTP ${code}` };
    } catch (_) {
      return { code, message: `HTTP ${code}` };
    }
  }
}






