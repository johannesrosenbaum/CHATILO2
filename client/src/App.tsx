import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
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
import HomeScreen from './components/Home/HomeScreenOriginal';
import ChatScreen from './components/Chat/ChatScreen';
import ScreenshotSwitch from './components/Chat/ScreenshotSwitch';
import ChatRoomList from './components/ChatRoomList';
import ProfilePage from './pages/ProfilePage';
import CreateEventPage from './pages/CreateEventPage';
import CreateEventScreen from './components/Events/CreateEventScreen';
import EventDetailsScreen from './components/Events/EventDetailsScreen';

import LoadingScreen from './components/Common/LoadingScreen';
import ErrorBoundary from './components/Common/ErrorBoundary';

// Universeller ChatPageWrapper für /chat/room/:roomId Route
const ChatPageWrapper = () => {
  const params = useParams<{ roomId: string }>();
  
  // Da wir nur noch /chat/room/:roomId Route haben, ist params.roomId immer definiert
  const roomId = params.roomId;

  console.log('🔧 ChatPageWrapper: roomId from params:', roomId);

  return (
    <SocketProvider roomId={roomId}>
      <ChatScreen roomId={roomId} />
    </SocketProvider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
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
const AppContent = () => {
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
          background: '#ffffff',
          position: 'relative',
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
            {/* Route für /chat (ohne roomId) */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatRoomList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-event"
              element={
                <ProtectedRoute>
                  <CreateEventPage />
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
              background: '#ffffff',
              color: '#1f2937',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
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
const App = () => {
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
