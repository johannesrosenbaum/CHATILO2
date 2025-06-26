import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  _id?: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  createdAt?: string;
  locationEnabled?: boolean;
  notificationsEnabled?: boolean;
  isActive?: boolean;
  lastSeen?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User | null>;
  register: (username: string, email: string, password: string) => Promise<User | null>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getApiUrl = () => {
  if (window.location.hostname === 'chatilo.de' || window.location.hostname.includes('82.165.140.194')) {
    return 'https://api.chatilo.de';
  }
  return 'http://localhost:1113';
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStoredToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          console.log('👤 Fetching user data...');
          const API_URL = getApiUrl();
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user);
            console.log('✅ User authenticated:', userData.user);
          } else {
            console.log('❌ Token invalid, removing...');
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('❌ Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkStoredToken();
  }, []);

  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const API_URL = getApiUrl();
      console.log('🔗 Register API URL:', API_URL);

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();

      if (data.token) {
        localStorage.setItem('token', data.token);
        const userWithDefaults: User = {
          id: data.user._id || data.user.id,
          _id: data.user._id,
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
        setUser(userWithDefaults);
        setToken(data.token);
        return userWithDefaults;
      }

      throw new Error('No token received');
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const API_URL = getApiUrl();
      console.log('🔗 Login API URL:', API_URL);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      if (data.token) {
        localStorage.setItem('token', data.token);
        const userWithDefaults: User = {
          id: data.user._id || data.user.id,
          _id: data.user._id,
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
        setUser(userWithDefaults);
        setToken(data.token);
        return userWithDefaults;
      }

      throw new Error('No token received');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setError(null);
    console.log('👋 User logged out');
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      if (!token) {
        throw new Error('Not authenticated');
      }

      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
