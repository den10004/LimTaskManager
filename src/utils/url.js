export const normalizeUrl = (url) => {
  if (!url) return "";
  const trimmed = url.trim();
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    // already has a scheme (http, https, mailto, tel, etc.)
    return trimmed;
  }
  if (trimmed.startsWith("www.")) {
    return "https://" + trimmed;
  }
  return "https://" + trimmed;
};



