
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import AIWelcome from '../components/AIWelcome';
import ChatRoomList from '../components/ChatRoomList/ChatRoomList';
import { SocketProvider } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading: loading, user } = useAuth();
  console.log('🏠 WelcomePage component rendering...');

  // Debug: Zeige an, wenn die WelcomePage gerendert wird
  React.useEffect(() => {
    console.log('🏠 [DEBUG] WelcomePage MOUNTED');
    return () => console.log('🏠 [DEBUG] WelcomePage UNMOUNTED');
  }, []);

  // Handler für Raum-Auswahl
  const handleRoomSelect = (roomId?: string) => {
    console.log('🏠 [DEBUG] handleRoomSelect aufgerufen mit:', roomId);
    if (roomId) {
      navigate(`/chat/room/${roomId}`);
    }
  };

  if (loading || !user) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <CircularProgress color="primary" />
        <Typography variant="h6" sx={{ mt: 2, color: 'primary.main' }}>
          Lade Benutzerinformationen ...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Chat Room List Sidebar */}
      <Box
        sx={{
          width: 320,
          flexShrink: 0,
          borderRight: '1px solid rgba(0,0,0,0.12)',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        }}
      >
        <ChatRoomList onRoomSelect={handleRoomSelect} />
      </Box>

      {/* Welcome Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <AIWelcome 
          userLocation={{
            name: 'Region Dedenbach',
            lat: 50.466877,
            lng: 7.27928
          }}
          nearbyPlaces={['Dedenbach', 'Burgbrohl', 'Brohl-Lützing', 'Niederzissen']}
        />
      </Box>
    </Box>
  );
};

export default WelcomePage;
