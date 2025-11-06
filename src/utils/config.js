export const API_URL =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_KEY;

if (!API_URL) {
  // eslint-disable-next-line no-console
  console.error(
    "API base URL is not set. Please define VITE_API_URL in your environment."
  );
}


