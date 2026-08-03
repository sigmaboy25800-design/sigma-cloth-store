"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { api, setAccessToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On first load, try to silently refresh using the httpOnly cookie
    // so a page reload doesn't log the user out.
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.accessToken);
          const me = await api.get("/api/users/me");
          setUser(me);
        }
      } catch {
        /* not logged in */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email, password) {
    const data = await api.post("/api/auth/login", { email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }

  async function signup(payload) {
    return api.post("/api/auth/signup", payload);
  }

  async function logout() {
    await api.post("/api/auth/logout", {});
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
