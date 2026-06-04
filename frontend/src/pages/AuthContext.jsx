import { createContext, useContext, useState, useCallback, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [accessToken, setAccessToken] = useState(() =>
    localStorage.getItem("access_token")
  );
  const [refreshToken, setRefreshToken] = useState(() =>
    localStorage.getItem("refresh_token")
  );

  const clearAuth = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  }, []);

  const login = useCallback((userData, nextAccessToken, nextRefreshToken) => {
    localStorage.setItem("access_token", nextAccessToken);
    localStorage.setItem("refresh_token", nextRefreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setAccessToken(nextAccessToken);
    setRefreshToken(nextRefreshToken);
  }, []);

  const logout = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      await fetch("/api/logout", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    clearAuth();
  }, [clearAuth]);

  const updateUser = useCallback((userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  useEffect(() => {
    async function syncUserFromBackend() {
      if (!accessToken) {
        clearAuth();
        return;
      }

      try {
        const res = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
          clearAuth();
          return;
        }

        const currentUser = await res.json();
        updateUser(currentUser);
      } catch (err) {
        console.log("Could not sync saved login:", err);
      }
    }

    syncUserFromBackend();
  }, [accessToken, clearAuth, updateUser]);

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
