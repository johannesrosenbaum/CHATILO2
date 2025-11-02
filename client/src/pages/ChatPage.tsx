import React, { useState, useEffect } from 'react';
import { Box, Drawer, AppBar, Toolbar, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChatRoomList from '../components/ChatRoomList/ChatRoomList';
import ChatInterface from '../components/ChatInterface';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import MobileHeader from '../components/MobileHeader';

const ChatPage: React.FC = () => {
  const { roomId } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  console.log('🔧 ChatPage DEBUGGING:');
  console.log('   roomId from socket:', roomId);
  console.log('   location.pathname:', location.pathname);
  console.log('   window.location.pathname:', window.location.pathname);

  // Enhanced debug logging
  useEffect(() => {
    console.log('🔧 ChatPage - Current state:', {
      roomId,
      pathname: location.pathname,
      windowPathname: window.location.pathname,
      hasRoomId: !!roomId,
      locationSearch: location.search,
      locationHash: location.hash,
      locationKey: location.key
    });
  }, [roomId, location]);

  // NOTE: No redirect logic needed here anymore since routing handles it

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Immer die ChatRoomList anzeigen
  return (
    <Box display="flex" height="100vh">
      {/* Sidebar oder Drawer für Raumliste */}
      <Box width={isMobile ? 0 : 320} flexShrink={0} display={isMobile ? 'none' : 'block'}>
        <ChatRoomList />
      </Box>
      {/* Hauptbereich: ChatInterface nur wenn Raum ausgewählt */}
      <Box flexGrow={1} display="flex" flexDirection="column">
        {roomId ? <ChatInterface /> : (
          <Box display="flex" alignItems="center" justifyContent="center" flexGrow={1}>
            <Typography variant="h6" color="textSecondary">
              Bitte wähle einen Chatraum aus der Liste aus.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatPage;
