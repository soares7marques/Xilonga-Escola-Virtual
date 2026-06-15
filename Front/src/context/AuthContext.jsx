import React, { createContext, useContext, useState } from 'react';
import { clearAuthSession, isTokenValid } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(isTokenValid());

  const login = () => setIsAuthenticated(true);
  const logout = () => {
    clearAuthSession();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
