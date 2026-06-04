import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('mm_token');
    const u = localStorage.getItem('mm_user');
    if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    setReady(true);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData); setToken(authToken);
    localStorage.setItem('mm_token', authToken);
    localStorage.setItem('mm_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('mm_token');
    localStorage.removeItem('mm_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuth: !!token, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);