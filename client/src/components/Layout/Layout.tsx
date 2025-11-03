import React, { useState, useEffect } from 'react';
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
  Divider,
  useTheme,
  useMediaQuery,
  Collapse,
  Paper,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Chat as ChatIcon,
  Event as EventIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Add as AddIcon,
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation as useLocationContext } from '../../contexts/LocationContext';
import { useChat } from '../../contexts/ChatContext';
import FavoriteButton from '../FavoriteButton';
import { gradients } from '../../theme/theme';
import { getAvatarUrl, getDisplayAvatar } from '../../utils/avatarUtils';
import { ChatRoom } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 320;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [villagesOpen, setVillagesOpen] = useState(false);
  const [schoolsOpen, setSchoolsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { currentLocation, nearbySchools, loadNearbySchools } = useLocationContext();
  const { chatRooms, getFavoriteRoomsData } = useChat();

  // Load schools when location is available (once)
  useEffect(() => {
    if (currentLocation && user && nearbySchools.length === 0) {
      console.log('🏫 Layout: Loading schools for location:', currentLocation);
      loadNearbySchools();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation?.latitude, currentLocation?.longitude, user?.id]);

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

  const handleChatRoomClick = (room: ChatRoom) => {
    navigate(`/chat/room/${room._id}`);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <EventIcon sx={{ color: '#f59e0b', fontSize: 20 }} />;
      default:
        return <ChatIcon sx={{ color: '#6366f1', fontSize: 20 }} />;
    }
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(99, 102, 241, 0.1)',
      }}
    >
      {/* User Profile Header */}
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            src={getDisplayAvatar(user)}
            sx={{
              width: 48,
              height: 48,
              border: '2px solid rgba(99, 102, 241, 0.2)',
              boxShadow: '0 4px 8px rgba(99, 102, 241, 0.1)',
            }}
          >
            {!getAvatarUrl(user?.avatar) && !user?.profileImage && user?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
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
                color: 'text.secondary',
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
      </Box>

      {/* Navigation Menu */}
      <List sx={{ py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                mx: 2,
                borderRadius: 2,
                background: location.pathname === item.path
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)'
                  : 'transparent',
                border: location.pathname === item.path
                  ? '1px solid rgba(99, 102, 241, 0.2)'
                  : '1px solid transparent',
                '&:hover': {
                  background: 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid rgba(99, 102, 241, 0.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path
                    ? '#6366f1'
                    : 'text.secondary',
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
                      ? '#6366f1'
                      : 'text.primary',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* ⭐ FAVORITEN-SHORTCUTS */}
      {getFavoriteRoomsData().length > 0 && (
        <>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography
              variant="caption"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              ⭐ Favoriten
            </Typography>
          </Box>
          <List sx={{ py: 0, px: 2 }}>
            {getFavoriteRoomsData().slice(0, 5).map((room) => (
              <ListItem key={`fav-${room._id}`} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleChatRoomClick(room)}
                  sx={{
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                      border: '1px solid rgba(102, 126, 234, 0.3)',
                      transform: 'translateX(4px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: '#667eea',
                      minWidth: 40,
                    }}
                  >
                    {getRoomIcon(room.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={room.name}
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: 600,
                        color: '#333333',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      },
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: '10px',
                      color: '#667eea',
                      fontWeight: 'bold',
                      lineHeight: 1,
                      opacity: 0.8,
                    }}
                  >
                    ★
                  </Typography>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}

      <Divider sx={{ borderColor: 'rgba(99, 102, 241, 0.1)', mx: 2 }} />

      {/* Villages & Schools Sections */}
      <List sx={{ flex: 1, py: 2 }}>
        {/* Villages Dropdown */}
        <ListItemButton
          onClick={() => setVillagesOpen(!villagesOpen)}
          sx={{
            mx: 2,
            borderRadius: 2,
            '&:hover': {
              background: 'rgba(99, 102, 241, 0.05)',
            },
          }}
        >
          <ListItemIcon sx={{ color: '#6366f1', minWidth: 40 }}>
            <ChatIcon />
          </ListItemIcon>
          <ListItemText
            primary="Villages"
            sx={{
              '& .MuiTypography-root': {
                fontWeight: 600,
                color: 'text.primary',
              },
            }}
          />
          {villagesOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={villagesOpen} timeout="auto" unmountOnExit>
          <Box sx={{ px: 2, py: 1, maxHeight: 300, overflowY: 'auto' }}>
            {chatRooms && chatRooms.length > 0 ? (
              chatRooms.slice(0, 10).map((room) => (
                <motion.div
                  key={room._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    sx={{
                      mb: 1,
                      cursor: 'pointer',
                      border: '1px solid rgba(99, 102, 241, 0.1)',
                      '&:hover': {
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        transform: 'translateX(4px)',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.1)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => handleChatRoomClick(room)}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {getRoomIcon(room.type)}
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                          }}
                        >
                          {room.name}
                        </Typography>
                        <FavoriteButton 
                          roomId={room._id} 
                          roomName={room.name}
                          size="small"
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          display: 'block',
                          mb: 1,
                        }}
                      >
                        {room.description || `${room.type} in der Nähe`}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`${room.memberCount || 0} Mitglieder`}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.7rem',
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: '#6366f1',
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  textAlign: 'center',
                  py: 2,
                }}
              >
                Keine Villages verfügbar
              </Typography>
            )}
          </Box>
        </Collapse>

        {/* Schools/Universities Dropdown */}
        <ListItemButton
          onClick={() => setSchoolsOpen(!schoolsOpen)}
          sx={{
            mx: 2,
            mt: 1,
            borderRadius: 2,
            '&:hover': {
              background: 'rgba(34, 197, 94, 0.05)',
            },
          }}
        >
          <ListItemIcon sx={{ color: '#22c55e', minWidth: 40 }}>
            <SchoolIcon />
          </ListItemIcon>
          <ListItemText
            primary="Schools & Universities"
            sx={{
              '& .MuiTypography-root': {
                fontWeight: 600,
                color: 'text.primary',
              },
            }}
          />
          {schoolsOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={schoolsOpen} timeout="auto" unmountOnExit>
          <Box sx={{ px: 2, py: 1, maxHeight: 300, overflowY: 'auto' }}>
            {nearbySchools && nearbySchools.length > 0 ? (
              nearbySchools.slice(0, 10).map((school, index) => (
                <motion.div
                  key={`school-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    sx={{
                      mb: 1,
                      cursor: 'pointer',
                      border: '1px solid rgba(34, 197, 94, 0.1)',
                      '&:hover': {
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        transform: 'translateX(4px)',
                        boxShadow: '0 2px 8px rgba(34, 197, 94, 0.1)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => {
                      // TODO: Navigate to school chat room
                      console.log('School clicked:', school);
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <SchoolIcon sx={{ color: '#22c55e', fontSize: 20 }} />
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                          }}
                        >
                          {school.name}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          display: 'block',
                          mb: 1,
                        }}
                      >
                        {school.type || 'school'} • {(school.distance / 1000).toFixed(1)} km
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  textAlign: 'center',
                  py: 2,
                }}
              >
                Keine Schools verfügbar
              </Typography>
            )}
          </Box>
        </Collapse>

        {/* Create Event Button */}
        <ListItem disablePadding sx={{ mt: 2 }}>
          <ListItemButton
            onClick={() => handleNavigation('/create-event')}
            sx={{
              mx: 2,
              borderRadius: 2,
              background: gradients.primary,
              color: '#ffffff',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon sx={{ color: '#ffffff', minWidth: 40 }}>
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
        </ListItem>
      </List>

      <Divider sx={{ borderColor: 'rgba(99, 102, 241, 0.1)', mx: 2 }} />

      {/* Logout */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: 'text.secondary',
            '&:hover': {
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Abmelden"
            sx={{
              '& .MuiTypography-root': {
                fontWeight: 500,
              },
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#ffffff' }}>
      {/* Clean Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          background: '#ffffff',
          borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="primary"
              aria-label="open drawer"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              edge="start"
            >
              <MenuIcon />
            </IconButton>
            
            {/* Chatilo Logo with Gradient */}
            <Typography
              variant="h5"
              sx={{
                background: gradients.primary,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                fontSize: '1.5rem',
              }}
            >
              Chatilo.
            </Typography>
          </Box>

          {/* User Avatar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={getDisplayAvatar(user)}
              sx={{
                width: 36,
                height: 36,
                border: '2px solid rgba(99, 102, 241, 0.2)',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(99, 102, 241, 0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                },
              }}
              onClick={() => navigate('/profile')}
            >
              {!getAvatarUrl(user?.avatar) && !user?.profileImage && user?.username?.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Collapsible Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          width: sidebarOpen ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            marginTop: '64px',
            height: 'calc(100vh - 64px)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          marginTop: '64px',
          marginLeft: sidebarOpen && !isMobile ? 0 : 0,
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;