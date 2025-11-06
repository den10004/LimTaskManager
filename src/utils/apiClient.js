import { getCookie } from "./getCookies";
import { API_URL } from "./config";

let refreshPromise = null;

async function refreshToken() {
  if (!refreshPromise) {
    const refreshT = getCookie("refreshToken");
    refreshPromise = (async () => {
      if (!refreshT) throw new Error("No refresh token");
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshT }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      // write cookies (same logic as AuthContext.setCookie)
      const setCookie = (name, value, days) => {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        let cookieString = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/`;
        if (window.location.protocol === "https:") cookieString += ";secure";
        cookieString += ";samesite=strict";
        document.cookie = cookieString;
      };
      setCookie("authTokenPM", data.token, 7);
      if (data.refresh_token) setCookie("refreshToken", data.refresh_token, 30);
      return data.token;
    })()
      .catch((e) => {
        // clear cookies on failure
        document.cookie = "authTokenPM=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
        document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
        throw e;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function shouldAttachAuth(url) {
  if (typeof url !== "string") return true;
  if (url.includes("/auth/login") || url.includes("/auth/refresh")) return false;
  return true;
}

export async function request(url, options = {}) {
  const opts = { ...options };
  const headers = opts.headers instanceof Headers
    ? Object.fromEntries(opts.headers.entries())
    : { ...(opts.headers || {}) };

  if (shouldAttachAuth(url)) {
    const token = getCookie("authTokenPM");
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  opts.headers = headers;

  let res = await fetch(url, opts);
  if (res.status === 401 && shouldAttachAuth(url) && headers.Authorization) {
    try {
      const newToken = await refreshToken();
      const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
      res = await fetch(url, { ...opts, headers: retryHeaders });
    } catch (e) {
      throw e;
    }
  }
  return res;
}

export async function json(url, options = {}) {
  const res = await request(url, options);
  if (!res.ok) {
    let message = "";
    try {
      const data = await res.clone().json();
      message = data?.message || "";
    } catch (_) {
      message = await res.text().catch(() => "");
    }
    const err = new Error(message || `HTTP ${res.status}`);
    // attach HTTP status code for normalization utils
    err.code = res.status;
    throw err;
  }
  return res.json();
}



