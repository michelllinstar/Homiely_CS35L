import { createContext, useContext, useState, useCallback } from "react";

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
    await fetch("/api/logout", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    localStorage.clear();
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
