import React, { useState } from 'react';
import { Box, Drawer, AppBar, Toolbar, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChatRoomList from '../components/ChatRoomList';
import ChatInterface from '../components/ChatInterface';
import { useParams } from 'react-router-dom';
import MobileHeader from '../components/MobileHeader';

const ChatPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <MobileHeader onMenuClick={() => setMobileMenuOpen(true)} />
        
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 300,
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            },
          }}
        >
          <ChatRoomList />
        </Drawer>

        {/* Main Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', mt: '64px' }}>
          <ChatInterface />
        </Box>
      </Box>
    );
  }

  // Desktop version
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Mobile Header mit Menu Button */}
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: 1300 }}>
          <Toolbar>
            <IconButton 
              edge="start" 
              color="inherit" 
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">Chatilo</Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Responsive Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? drawerOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: isMobile ? '100%' : 320,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isMobile ? '100%' : 320,
            boxSizing: 'border-box',
            marginTop: isMobile ? '64px' : 0, // Platz für AppBar
          },
        }}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
      >
        <ChatRoomList />
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          width: { md: `calc(100% - ${320}px)` },
          height: '100%',
          display: 'flex', 
          flexDirection: 'column',
          marginTop: isMobile ? '64px' : 0, // Platz für AppBar
        }}
      >
        {roomId ? (
          <ChatInterface />
        ) : (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: 'text.secondary'
          }}>
            Wähle einen Chat-Raum aus
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatPage;
