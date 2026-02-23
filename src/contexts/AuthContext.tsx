"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { AuthUser, getMe, login, logout, register } from "@/lib/api/auth";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    birthDate?: string;
    gender?: "MALE" | "FEMALE" | "NONE";
    interests?: string[];
    marketingConsent?: boolean;
  }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ACCESS_KEY = "ef_access_token";
const REFRESH_KEY = "ef_refresh_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
  });

  // 초기 로드: localStorage에서 토큰 복원
  useEffect(() => {
    const token = localStorage.getItem(ACCESS_KEY);
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    getMe(token)
      .then((user) =>
        setState({ user, accessToken: token, isLoading: false }),
      )
      .catch(() => {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        setState({ user: null, accessToken: null, isLoading: false });
      });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await login(email, password);
    localStorage.setItem(ACCESS_KEY, res.accessToken);
    localStorage.setItem(REFRESH_KEY, res.refreshToken);
    setState({ user: res.user as AuthUser, accessToken: res.accessToken, isLoading: false });
  }, []);

  const signUp = useCallback(
    async (data: {
      email: string;
      password: string;
      name?: string;
      phone?: string;
      birthDate?: string;
      gender?: "MALE" | "FEMALE" | "NONE";
      interests?: string[];
      marketingConsent?: boolean;
    }) => {
      const res = await register(data);
      localStorage.setItem(ACCESS_KEY, res.accessToken);
      localStorage.setItem(REFRESH_KEY, res.refreshToken);
      const user = await getMe(res.accessToken);
      setState({ user, accessToken: res.accessToken, isLoading: false });
    },
    [],
  );

  const signOut = useCallback(async () => {
    const token = localStorage.getItem(ACCESS_KEY);
    const refreshToken = localStorage.getItem(REFRESH_KEY) ?? undefined;
    if (token) {
      await logout(token, refreshToken).catch(() => null);
    }
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setState({ user: null, accessToken: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
