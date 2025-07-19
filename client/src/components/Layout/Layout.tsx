import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Chat as ChatIcon,
  Event as EventIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  LocationOn as LocationIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation as useLocationContext } from '../../contexts/LocationContext';
import { theme, gradients } from '../../theme/theme';
import FavoritesSection from './FavoritesSection';
import { getAvatarUrl } from '../../utils/avatarUtils';

interface LayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 280;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { currentLocation, getCurrentLocation } = useLocationContext();

  const menuItems = [
    { text: 'Startseite', icon: <HomeIcon />, path: '/' },
    { text: 'Profil', icon: <PersonIcon />, path: '/profile' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleLocationRequest = async () => {
    try {
      await getCurrentLocation();
    } catch (error) {
      console.error('Location request failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, rgba(15, 15, 15, 0.95) 0%, rgba(25, 25, 25, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          background: gradients.primary,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar
          src={getAvatarUrl(user?.avatar) || user?.profileImage}
          sx={{
            width: 48,
            height: 48,
            border: '2px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {user?.username?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: 'white',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user?.username}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <LocationIcon sx={{ fontSize: 12 }} />
            {currentLocation?.address?.city || 'Standort unbekannt'}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Navigation Menu */}
      <List sx={{ flex: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                mx: 1,
                borderRadius: 2,
                background: location.pathname === item.path
                  ? 'rgba(99, 102, 241, 0.2)'
                  : 'transparent',
                border: location.pathname === item.path
                  ? '1px solid rgba(99, 102, 241, 0.3)'
                  : '1px solid transparent',
                '&:hover': {
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path
                    ? '#6366f1'
                    : 'rgba(255, 255, 255, 0.7)',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiTypography-root': {
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    color: location.pathname === item.path
                      ? '#ffffff'
                      : 'rgba(255, 255, 255, 0.8)',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        
        {/* Favoriten Sektion */}
        <FavoritesSection />
      </List>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Quick Actions */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={() => handleNavigation('/create-event')}
          sx={{
            borderRadius: 2,
            background: 'rgba(236, 72, 153, 0.1)',
            border: '1px solid rgba(236, 72, 153, 0.2)',
            '&:hover': {
              background: 'rgba(236, 72, 153, 0.2)',
              border: '1px solid rgba(236, 72, 153, 0.3)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <ListItemIcon sx={{ color: '#ec4899', minWidth: 40 }}>
            <AddIcon />
          </ListItemIcon>
          <ListItemText
            primary="Event erstellen"
            sx={{
              '& .MuiTypography-root': {
                fontWeight: 600,
                color: '#ffffff',
              },
            }}
          />
        </ListItemButton>

        <ListItemButton
          onClick={handleLocationRequest}
          sx={{
            mt: 1,
            borderRadius: 2,
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            '&:hover': {
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <ListItemIcon sx={{ color: '#3b82f6', minWidth: 40 }}>
            <LocationIcon />
          </ListItemIcon>
          <ListItemText
            primary="Standort aktualisieren"
            sx={{
              '& .MuiTypography-root': {
                fontWeight: 600,
                color: '#ffffff',
              },
            }}
          />
        </ListItemButton>
      </Box>

      {/* Logout */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            '&:hover': {
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <ListItemText
            primary="Abmelden"
            sx={{
              textAlign: 'center',
              '& .MuiTypography-root': {
                fontWeight: 600,
                color: '#ef4444',
              },
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: 'rgba(10, 10, 10, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              background: gradients.primary,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
            }}
          >
            CHATILO
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <Avatar
              src={getAvatarUrl(user?.avatar) || user?.profileImage}
              sx={{
                width: 32,
                height: 32,
                border: '2px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
              }}
              onClick={() => handleNavigation('/profile')}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <AnimatePresence>
          {(sidebarOpen || !isMobile) && (
            <Drawer
              variant={isMobile ? 'temporary' : 'permanent'}
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              ModalProps={{ keepMounted: true }}
              sx={{
                '& .MuiDrawer-paper': {
                  width: drawerWidth,
                  boxSizing: 'border-box',
                  background: 'transparent',
                  border: 'none',
                },
              }}
            >
              <motion.div
                initial={{ x: -drawerWidth }}
                animate={{ x: 0 }}
                exit={{ x: -drawerWidth }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
                {drawerContent}
              </motion.div>
            </Drawer>
          )}
        </AnimatePresence>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          pt: { xs: 8, md: 9 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </Box>
    </Box>
  );
};

export default Layout; 