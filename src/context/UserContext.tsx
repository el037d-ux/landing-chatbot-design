import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const AUTH_URL = "https://functions.poehali.dev/43173cf5-6a15-477a-b57b-72f11019ab4b";
const STATUS_URL = "https://functions.poehali.dev/e173392a-d801-4fb1-8a22-1d4eae8245b0";

export type UserStatus = {
  user: { id: number; email: string; name: string } | null;
  plan: "free" | "7days" | "30days";
  expires_at: string | null;
  usage: { lessons: number; games: number; analyses: number };
  limits: { lessons: number; games: number; analyses: number };
  can_use: { lessons: boolean; games: boolean; analyses: boolean };
};

type UserContextType = {
  token: string | null;
  status: UserStatus | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  incrementUsage: (resource: "lessons" | "games" | "analyses") => Promise<void>;
  refreshStatus: () => Promise<void>;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("urok_token"));
  const [status, setStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(() => !!localStorage.getItem("urok_token"));

  const fetchStatus = async (t: string) => {
    try {
      const res = await fetch(STATUS_URL, {
        headers: { "Authorization": `Bearer ${t}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.ok) setStatus(data);
    } catch (e) { console.error("fetchStatus error", e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (token) fetchStatus(token);
    else setLoading(false);
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();
      if (data.ok) {
        localStorage.setItem("urok_token", data.token);
        setToken(data.token);
        await fetchStatus(data.token);
        return { ok: true };
      }
      return { ok: false, error: data.error };
    } catch {
      return { ok: false, error: "Ошибка соединения" };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", email, password, name }),
      });
      const data = await res.json();
      if (data.ok) {
        localStorage.setItem("urok_token", data.token);
        setToken(data.token);
        await fetchStatus(data.token);
        return { ok: true };
      }
      return { ok: false, error: data.error };
    } catch {
      return { ok: false, error: "Ошибка соединения" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("urok_token");
    setToken(null);
    setStatus(null);
  };

  const incrementUsage = async (resource: "lessons" | "games" | "analyses") => {
    if (!token) return;
    try {
      const res = await fetch(STATUS_URL, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "increment", resource }),
      });
      const data = await res.json();
      if (data.ok) setStatus(data);
    } catch (e) { console.error("incrementUsage error", e); }
  };

  const refreshStatus = async () => {
    if (token) await fetchStatus(token);
  };

  return (
    <UserContext.Provider value={{ token, status, loading, login, register, logout, incrementUsage, refreshStatus }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}