import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
  ApiUser,
  loginRequest,
} from '@/services/api';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type User = ApiUser;

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isSignedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const savedToken = await AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
      const savedUser = await AsyncStorage.getItem(AUTH_USER_STORAGE_KEY);
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to restore session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await loginRequest(email, password);
      
      await AsyncStorage.multiSet([
        [AUTH_TOKEN_STORAGE_KEY, data.token],
        [AUTH_USER_STORAGE_KEY, JSON.stringify(data.user)],
      ]);
      
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      // Log the full error for debugging
      console.error('Login error details:', error);
      
      // Provide a user-friendly error message
      if (error instanceof TypeError) {
        throw new Error('Unable to connect to the API server. Please check your API base URL configuration.');
      }
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY]);
      
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setToken(null);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isSignedIn: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
