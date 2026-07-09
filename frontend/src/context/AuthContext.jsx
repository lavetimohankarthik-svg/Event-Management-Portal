import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";
import { disconnectSocket } from "@/lib/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("recstacy_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("recstacy_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        const normalized = { ...data.user, id: data.user._id };
        setUser(normalized);
        localStorage.setItem("recstacy_user", JSON.stringify(normalized));
      } catch {
        localStorage.removeItem("recstacy_token");
        localStorage.removeItem("recstacy_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("recstacy_token", token);
    localStorage.setItem("recstacy_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("recstacy_token");
    localStorage.removeItem("recstacy_user");
    disconnectSocket();
    setUser(null);
  };

  const updateUser = (patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem("recstacy_user", JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
