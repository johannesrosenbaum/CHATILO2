import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, AuthState, UpdateProfileData } from '../types';

// Konfiguriere axios baseURL für Backend
axios.defaults.baseURL = 'http://localhost:1113';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  refreshUser: () => Promise<void>;
  loading: boolean; // Alias für isLoading
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TOKEN'; payload: string | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios defaults
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (state.token) {
        try {
          const response = await axios.get('/api/auth/me');
          console.log('🔧 Auth check response:', response.data);
          
          // Handle both response structures
          const userData = response.data.user || response.data;
          dispatch({ type: 'SET_USER', payload: userData });
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔧 AuthContext: Starting login for:', email);
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await axios.post('/api/auth/login', { email, password });
      console.log('🔧 AuthContext: Login response received:', response.data);
      
      // Korrigierte Struktur - direkt aus response.data
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      dispatch({ type: 'SET_TOKEN', payload: token });
      dispatch({ type: 'SET_USER', payload: user });
      
      console.log('✅ AuthContext: User set successfully:', user);

      toast.success('Willkommen zurück!');
    } catch (error: any) {
      console.error('❌ AuthContext: Login failed:', error);
      const message = error.response?.data?.message || 'Login fehlgeschlagen';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      throw error;
    }
  };

  const register = async (email: string, password: string, username: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await axios.post('/api/auth/register', {
        email,
        password,
        username,
      });
      // Korrigierte Struktur - direkt aus response.data
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      dispatch({ type: 'SET_TOKEN', payload: token });
      dispatch({ type: 'SET_USER', payload: user });

      toast.success('Account erfolgreich erstellt!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registrierung fehlgeschlagen';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    toast.success('Erfolgreich abgemeldet');
  };

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Separate handling for avatar upload and profile data
      let updatedUser = null;
      if (data.profileImage && data.profileImage instanceof File) {
        // Upload avatar first
        const avatarFormData = new FormData();
        avatarFormData.append('avatar', data.profileImage);
        
        const avatarResponse = await axios.post('/api/auth/avatar', avatarFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        console.log('✅ Avatar uploaded successfully:', avatarResponse.data);
        
        // Update user with new avatar data
        if (avatarResponse.data.success && avatarResponse.data.user) {
          updatedUser = avatarResponse.data.user;
          dispatch({ type: 'SET_USER', payload: updatedUser });
        }
      }

      // Update profile data (excluding profileImage)
      const { profileImage, ...profileData } = data;
      const updateData: any = {};
      
      if (profileData.username) updateData.username = profileData.username;
      if (profileData.firstName) updateData.firstName = profileData.firstName;
      if (profileData.lastName) updateData.lastName = profileData.lastName;
      if (profileData.bio) updateData.bio = profileData.bio;
      if (profileData.preferences) updateData.preferences = profileData.preferences;

      if (Object.keys(updateData).length > 0) {
        const response = await axios.put('/api/auth/me', updateData);
        console.log('✅ Profile updated successfully:', response.data);
        
        // Update user with new data
        if (response.data.success && response.data.user) {
          // Merge with existing user data if avatar was already updated
          const finalUser = updatedUser ? { ...response.data.user, avatar: updatedUser.avatar } : response.data.user;
          dispatch({ type: 'SET_USER', payload: finalUser });
        }
      }

      toast.success('Profil erfolgreich aktualisiert!');
    } catch (error: any) {
      console.error('❌ Profile update failed:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Profil-Update fehlgeschlagen';
      toast.error(message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const refreshUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      console.log('🔧 Refresh user response:', response.data);
      
      // Handle both response structures
      const userData = response.data.user || response.data;
      dispatch({ type: 'SET_USER', payload: userData });
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    loading: state.isLoading, // Alias für isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
