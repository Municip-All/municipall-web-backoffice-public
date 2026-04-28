"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";

export interface User {
  id: number;
  email: string;
  name: string;
  surname: string;
  role: string;
  cityId: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<{
    user: User | null;
    token: string | null;
    isLoading: boolean;
  }>({
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    // Check for stored session on mount
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    let user: User | null = null;
    if (storedUser) {
      try {
        user = JSON.parse(storedUser);
      } catch {
        user = null;
      }
    }

    // On utilise eslint-disable car c'est la seule façon propre de réhydrater 
    // le localStorage dans Next.js sans provoquer de décalage d'hydratation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthState({
      token: storedToken,
      user,
      isLoading: false,
    });
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    setAuthState({
      token: newToken,
      user: newUser,
      isLoading: false,
    });
  }, []);

  const updateUser = useCallback((updatedUser: Partial<User>) => {
    setAuthState(prev => {
      if (!prev.user) return prev;
      const newUser = { ...prev.user, ...updatedUser };
      localStorage.setItem("auth_user", JSON.stringify(newUser));
      return { ...prev, user: newUser };
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setAuthState({
      token: null,
      user: null,
      isLoading: false,
    });
  }, []);

  const value = useMemo(() => ({
    user: authState.user,
    token: authState.token,
    isAuthenticated: !!authState.token,
    isLoading: authState.isLoading,
    login,
    updateUser,
    logout,
  }), [authState, login, updateUser, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
