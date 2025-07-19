import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import theme from './theme/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { LocationProvider } from './contexts/LocationContext';
import { SocketProvider } from './contexts/SocketContext';

// Components
import Layout from './components/Layout/Layout';
import LoginScreen from './components/Auth/LoginScreen';
import RegisterScreen from './components/Auth/RegisterScreen';
import HomeScreen from './components/Home/HomeScreen';
import ChatScreen from './components/Chat/ChatScreen';
import ChatRoomList from './components/ChatRoomList';
import ProfileScreen from './components/Profile/ProfileScreen';
import CreateEventScreen from './components/Events/CreateEventScreen';
import EventDetailsScreen from './components/Events/EventDetailsScreen';

import LoadingScreen from './components/Common/LoadingScreen';
import ErrorBoundary from './components/Common/ErrorBoundary';

// Universeller ChatPageWrapper für alle Chat-Routen
const ChatPageWrapper: React.FC = () => {
  // UNÜBERSEHBARES LOG UND ALERT
  console.log('🚨🚨🚨 [ChatPageWrapper] WIRD GERENDET!');
  const location = useLocation();
  const params = useParams<{ roomId?: string }>();

  // roomId aus /chat/:roomId oder /chat/room/:roomId extrahieren
  let roomId = params.roomId || null;
  if (!roomId) {
    // Fallback: Manuell aus dem Pfad extrahieren
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts[0] === 'chat' && pathParts[1] === 'room' && pathParts[2]) {
      roomId = pathParts[2];
    } else if (pathParts[0] === 'chat' && pathParts[1]) {
      roomId = pathParts[1];
    }
  }
  // FETTES DEBUG-LOG
  console.log('🔥🔥🔥 [ChatPageWrapper] GERENDET! Params:', params, 'location:', location.pathname, 'final roomId:', roomId);
  return (
    <SocketProvider roomId={roomId}>
      <ChatScreen />
    </SocketProvider>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Main App Component
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Simulate initialization
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          },
        }}
      >
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                !isAuthenticated ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LoginScreen />
                  </motion.div>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/register"
              element={
                !isAuthenticated ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RegisterScreen />
                  </motion.div>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <HomeScreen />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* Explizite Route für /chat/room/:roomId */}
            <Route
              path="/chat/room/:roomId"
              element={
                <ProtectedRoute>
                  <ChatPageWrapper />
                </ProtectedRoute>
              }
            />
            {/* Route für /chat/:roomId (optional) */}
            <Route
              path="/chat/:roomId?"
              element={
                <ProtectedRoute>
                  <ChatPageWrapper />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfileScreen />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-event"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CreateEventScreen />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/event/:eventId"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EventDetailsScreen />
                  </Layout>
                </ProtectedRoute>
              }
            />


            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(30, 30, 30, 0.95)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </Box>
    </Router>
  );
};

// Root App Component
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <SocketProvider>
            <LocationProvider>
              <ChatProvider>
                <AppContent />
              </ChatProvider>
            </LocationProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
