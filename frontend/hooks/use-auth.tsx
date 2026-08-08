"use client";
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import type { User } from "@/lib/types";

interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000") + "/api/v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage once on mount
  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t && u) {
      try {
        setToken(t);
        setUser(JSON.parse(u));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const persist = useCallback((accessToken: string, u: User) => {
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(u));
    setToken(accessToken);
    setUser(u);
  }, []);

  async function authRequest(path: string, body: unknown) {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Request failed");
    return json;
  }

  async function login(email: string, password: string) {
    const res = await authRequest("/auth/login", { email, password });
    persist(res.data.accessToken, res.data.user);
  }

  async function register(name: string, email: string, password: string, role: string) {
    const res = await authRequest("/auth/register", { name, email, password, role });
    persist(res.data.accessToken, res.data.user);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  return (
    <Ctx.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
