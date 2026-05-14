import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  email: string;
  name?: string;
}

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
      const savedToken = await AsyncStorage.getItem('authToken');
      const savedUser = await AsyncStorage.getItem('authUser');
      
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
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
        } catch (parseError) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Save token and user to state and storage
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('authUser', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      // Log the full error for debugging
      console.error('Login error details:', error);
      
      // Provide a user-friendly error message
      if (error instanceof TypeError) {
        // Network/CORS error
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection and ensure the API server is running.');
      }
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if available
      if (token) {
        await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {
          // Logout endpoint might not exist, continue anyway
        });
      }

      // Clear local state and storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('authUser');
      
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if API call fails
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
