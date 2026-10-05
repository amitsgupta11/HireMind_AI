"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "hiremind-token";

const DASHBOARD_BY_ROLE = {
  CANDIDATE: "/candidate/dashboard",
  RECRUITER: "/recruiter/dashboard",
  ADMIN: "/admin/dashboard",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Rehydrate session from a stored token on first load.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }
    authApi
      .me(stored)
      .then((res) => {
        setToken(stored);
        setUser(res.data.user);
      })
      .catch(() => {
        window.localStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = useCallback((sessionUser, sessionToken) => {
    setUser(sessionUser);
    setToken(sessionToken);
    window.localStorage.setItem(STORAGE_KEY, sessionToken);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const res = await authApi.login(credentials);
      persistSession(res.data.user, res.data.token);
      router.push(DASHBOARD_BY_ROLE[res.data.user.role] || "/");
      return res.data.user;
    },
    [persistSession, router]
  );

  const register = useCallback(
    async (payload) => {
      const res = await authApi.register(payload);
      persistSession(res.data.user, res.data.token);
      router.push(DASHBOARD_BY_ROLE[res.data.user.role] || "/");
      return res.data.user;
    },
    [persistSession, router]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem(STORAGE_KEY);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { DASHBOARD_BY_ROLE };
