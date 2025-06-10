import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';

export interface User {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  locationEnabled?: boolean;
  notificationsEnabled?: boolean; // HINZUGEFÜGT
  isActive?: boolean; // HINZUGEFÜGT
  lastSeen?: string; // HINZUGEFÜGT
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<any>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // ADD THIS

  const API_BASE_URL = 'http://localhost:1113';

  // Check for existing token on mount
  useEffect(() => {
    const checkStoredToken = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        console.log('🔐 Checking stored token: Token found');
        setToken(storedToken);
        
        try {
          console.log('👤 Fetching user data...');
          const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ User data received:', data);
            
            // 🔥 KORRIGIERT: Detaillierte User-Daten-Verarbeitung mit DEBUG
            console.log('🔧 DEBUG: Processing user data...');
            console.log('   Raw data object:', data);
            console.log('   data.user object:', data.user);
            console.log('   data.user._id:', data.user?._id);
            console.log('   data.user.id:', data.user?.id);
            console.log('   data.user.locationEnabled:', data.user?.locationEnabled);
            
            const userData = {
              ...data.user,
              // 🔥 KORRIGIERT: Stelle sicher dass BEIDE ID-Felder gesetzt sind
              id: data.user._id || data.user.id,
              _id: data.user._id || data.user.id,
              // 🔥 KORRIGIERT: locationEnabled standardmäßig TRUE (außer explizit false)
              locationEnabled: data.user.locationEnabled !== false // Default true
            };
            
            console.log('🔧 DEBUG: Processed user data:');
            console.log('   Final userData object:', userData);
            console.log('   Final id:', userData.id);
            console.log('   Final _id:', userData._id);
            console.log('   Final locationEnabled:', userData.locationEnabled);
            console.log('   Final username:', userData.username);
            
            setUser(userData);
          } else {
            console.log('⚠️ Token invalid, clearing storage');
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            console.log('⚠️ Please login again');
          }
        } catch (error) {
          console.error('❌ Auth initialization error:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    checkStoredToken();
  }, [API_BASE_URL]);

  const register = async (username: string, email: string, password: string) => {
    console.log('📝 Attempting registration for:', email);
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Registration successful, storing token');
        localStorage.setItem('token', data.token);
        setToken(data.token);
        
        // Create complete user object
        const completeUser: User = {
          id: data.user._id || data.user.id,
          _id: data.user._id || data.user.id,
          username: data.user.username,
          email: data.user.email,
          bio: data.user.bio,
          avatar: data.user.avatar,
          locationEnabled: data.user.locationEnabled || true,
          notificationsEnabled: data.user.notificationsEnabled !== false,
          isActive: data.user.isActive || true,
          lastSeen: data.user.lastSeen || new Date().toISOString(),
          createdAt: data.user.createdAt || new Date().toISOString(),
          updatedAt: data.user.updatedAt || new Date().toISOString()
        };
        
        setUser(completeUser);
        setLoading(false);
        return data;
      } else {
        setLoading(false);
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error.message);
      setLoading(false);
      throw error;
    }
  };

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('🔐 Attempting login for:', email);
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Login successful, storing token');
        localStorage.setItem('token', data.token);
        setToken(data.token);
        
        // Create complete user object like in register
        const completeUser: User = {
          id: data.user._id || data.user.id,
          _id: data.user._id || data.user.id,
          username: data.user.username,
          email: data.user.email,
          bio: data.user.bio,
          avatar: data.user.avatar,
          locationEnabled: data.user.locationEnabled || false,
          notificationsEnabled: data.user.notificationsEnabled !== false,
          isActive: data.user.isActive || true,
          lastSeen: data.user.lastSeen || new Date().toISOString(),
          createdAt: data.user.createdAt || new Date().toISOString(),
          updatedAt: data.user.updatedAt || new Date().toISOString()
        };
        
        setUser(completeUser);
        setLoading(false);
        return true;
      } else {
        console.error('❌ Login failed:', data.message);
        setLoading(false);
        return false;
      }
    } catch (error: any) {
      console.error('❌ Login error:', error.message);
      setLoading(false);
      return false;
    }
  }, [API_BASE_URL]);

  const logout = useCallback(() => {
    console.log('🚪 Logging out user');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setLoading(false); // ADD THIS
  }, []);

  const updateUser = useCallback(async (userData: Partial<User>): Promise<boolean> => {
    try {
      console.log('📝 Updating user profile:', userData);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        console.log('✅ Profile updated successfully:', updatedUser);
        setUser(updatedUser.user || updatedUser);
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ Profile update failed:', errorData);
        return false;
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      return false;
    }
  }, [API_BASE_URL]);

  const value: AuthContextType = {
    user,
    token,
    loading, // ADD THIS
    login,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
