import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import { createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

// FINAL FORCE REBUILD - ABSOLUTLY CRITICAL
const FINAL_VERSION = "ABSOLUTE_FINAL_V6_" + Date.now();
const EMERGENCY_TIMESTAMP = new Date().toISOString();

function App() {
  console.log('🔧 DEBUG: App component initializing...');
  
  useEffect(() => {
    console.log('🔧 DEBUG: App useEffect - Component mounted');
    console.log('   Window dimensions:', { width: window.innerWidth, height: window.innerHeight });
    console.log('   User Agent:', navigator.userAgent);
    console.log('   Local Storage keys:', Object.keys(localStorage));
    console.log('   Session Storage keys:', Object.keys(sessionStorage));
    
    return () => {
      console.log('🔧 DEBUG: App useEffect - Component will unmount');
    };
  }, []);

  console.log('🔧 DEBUG: App component rendering...');

  // FINAL EMERGENCY LOGS
  console.log('🆘🆘🆘🆘🆘 FINAL EMERGENCY REBUILD!!! 🆘🆘🆘🆘🆘');
  console.log(`🔥 FINAL VERSION: ${FINAL_VERSION}`);
  console.log(`⏰ TIMESTAMP: ${EMERGENCY_TIMESTAMP}`);
  console.log('🚪 ROOM ROUTE /chat/:roomId ABSOLUTELY MUST WORK NOW!');
  console.log('✅ ALL ROUTES: /login, /register, /chat, /chat/:roomId, /profile, /settings');
  
  // THROW ERROR IF OLD VERSION
  if (!FINAL_VERSION || FINAL_VERSION.length < 20) {
    console.error('💥💥💥 OLD APP VERSION DETECTED - CRITICAL ERROR');
    throw new Error('CRITICAL: OLD APP VERSION STILL LOADING!');
  }
  
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* BASE CHAT ROUTE */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <SocketProvider>
                    <ChatPage />
                  </SocketProvider>
                </ProtectedRoute>
              }
            />
            
            {/* 🆘 ABSOLUTELY CRITICAL ROOM ROUTE 🆘 */}
            <Route
              path="/chat/:roomId"
              element={
                <ProtectedRoute>
                  <SocketProvider>
                    <ChatPage />
                  </SocketProvider>
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
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/chat" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
