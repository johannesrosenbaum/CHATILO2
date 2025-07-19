import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import type { User } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // User-Objekt normalisieren und typisieren
  const realUser: User | null = user && typeof user === 'object' && 'user' in user ? (user as any).user : (user as User | null);

  // Erweiterte Debug-Ausgaben
  console.log('[ProtectedRoute] Render:', { user, loading });
  console.log('[ProtectedRoute] realUser:', realUser);
  if (realUser && typeof realUser === 'object') {
    const u = realUser as User;
    console.log('[ProtectedRoute] realUser Properties:', {
      id: u.id,
      _id: u._id,
      username: u.username,
      locationEnabled: u.locationEnabled,
      email: u.email
    });
  }

  if (loading) {
    console.log('[ProtectedRoute] Still loading, showing spinner');
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  // Authentifizierung prüfen: id oder _id muss vorhanden sein
  if (!realUser || (typeof realUser !== 'object') || (!(realUser as User).id && !(realUser as User)._id)) {
    console.log('[ProtectedRoute] Kein gültiger User (id oder _id fehlt), redirect zu /login', { realUser });
    return <Navigate to="/login" replace />;
  }

  console.log('[ProtectedRoute] User authenticated, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
