const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let inMemoryAccessToken = null;

export function setAccessToken(token) {
  inMemoryAccessToken = token;
}

export function getAccessToken() {
  return inMemoryAccessToken;
}

// Central fetch wrapper: attaches the JWT, retries once on 401 by
// refreshing via the httpOnly cookie, and throws a normal Error with
// the server's message so callers can show it directly.
export async function apiFetch(path, options = {}, _retry = false) {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = { ...(isFormData ? {} : { "Content-Type": "application/json" }), ...(options.headers || {}) };
  if (inMemoryAccessToken) headers.Authorization = `Bearer ${inMemoryAccessToken}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include", // send the httpOnly refresh cookie
  });

  if (res.status === 401 && !_retry && path !== "/api/auth/refresh") {
    const refreshed = await tryRefresh();
    if (refreshed) return apiFetch(path, options, true);
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new Error(body?.error || "Something went wrong. Please try again.");
  }
  return body;
}

async function tryRefresh() {
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, { method: "POST", credentials: "include" });
    if (!res.ok) return false;
    const data = await res.json();
    setAccessToken(data.accessToken);
    return true;
  } catch {
    return false;
  }
}

export const api = {
  get: (path) => apiFetch(path),
  post: (path, body, options) => apiFetch(path, { method: "POST", body: JSON.stringify(body), ...options }),
  put: (path, body) => apiFetch(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path, body) => apiFetch(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => apiFetch(path, { method: "DELETE" }),
  upload: (path, formData, method = "POST") =>
    apiFetch(path, { method, body: formData, headers: {} }).catch((e) => {
      throw e;
    }),
};

export { API_URL };
