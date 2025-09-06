import React from 'react';
import { Box, Typography } from '@mui/material';
import ScreenshotFlipChat from './components/Chat/ScreenshotFlipChat';

function App() {
  return (
    <Box sx={{ width: '100vw', height: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* 📱 Screenshot-Flip Chat Demo */}
      <ScreenshotFlipChat roomId="demo-room" roomName="Demo Raum" />
      
      {/* Debug Info */}
      <Box
        sx={{
          position: 'fixed',
          top: 10,
          left: 10,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          zIndex: 9999,
        }}
      >
        📱 Screenshot-Flip Demo - Klicke auf Galerie-Button!
      </Box>
    </Box>
  );
}

export default App;
