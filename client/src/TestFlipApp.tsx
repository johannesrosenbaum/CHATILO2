import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import FlipPageChat from './components/Chat/FlipPageChat';

function App() {
  return (
    <Box sx={{ width: '100vw', height: '100vh' }}>
      <FlipPageChat roomId="test-room" roomName="Test Raum" />
    </Box>
  );
}

export default App;
