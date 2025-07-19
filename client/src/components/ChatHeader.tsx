import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, Menu, MenuItem, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useNavigate } from 'react-router-dom';

// COOLSTES CHATILO LOGO ICON 🚀
const ChatiloIcon = styled('div')(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(2),
  boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 100%)',
    borderRadius: '12px',
  }
}));

const ChatiloSymbol = styled('div')(({ theme }) => ({
  fontSize: '24px',
  fontWeight: 900,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontFamily: '"Inter", sans-serif',
  position: 'relative',
  zIndex: 1,
}));

const GradientAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
  backgroundSize: '400% 400%',
  animation: 'gradientShift 8s ease infinite',
  '@keyframes gradientShift': {
    '0%': {
      backgroundPosition: '0% 50%'
    },
    '50%': {
      backgroundPosition: '100% 50%'
    },
    '100%': {
      backgroundPosition: '0% 50%'
    }
  }
}));

const GradientTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '1.5rem',
  color: 'white', // Verwende normale Farbe statt Gradient
  textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
  letterSpacing: '0.5px',
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,249,255,0.9) 100%)',
  color: '#667eea',
  border: '2px solid rgba(255,255,255,0.3)',
  fontWeight: 700,
  fontSize: '1.1rem',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 15px rgba(255,255,255,0.4)',
  }
}));

interface ChatHeaderProps {
  onMenuToggle: () => void;
  locationName: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatar?: string | null; // CHANGE: Allow null
    profileImage?: string | null; // Alias für avatar
  } | null;
  onLogout: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onMenuToggle, 
  locationName, 
  user, 
  onLogout 
}) => {
  const [userMenuAnchor, setUserMenuAnchor] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    if (onLogout) onLogout();
  };

  const handleSettings = () => {
    handleUserMenuClose();
    navigate('/settings');
  };

  const handleProfile = () => {
    handleUserMenuClose();
    navigate('/profile');
  };

  return (
    <GradientAppBar position="fixed" elevation={0}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuToggle}
          sx={{ 
            mr: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }
          }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <ChatiloIcon>
            <ChatiloSymbol>C</ChatiloSymbol>
          </ChatiloIcon>
          
          <Box>
            <GradientTitle variant="h6">
              CHATILO
            </GradientTitle>
            {locationName && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  fontWeight: 500,
                  display: { xs: 'none', sm: 'flex' }, // Verstecke auf sehr kleinen Screens
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <LocationOnIcon sx={{ fontSize: '0.8rem' }} />
                {locationName}
              </Typography>
            )}
          </Box>
        </Box>
        
        {/* User Area - VEREINFACHT ohne Punkte */}
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              onClick={handleUserMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                padding: '6px 12px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'scale(1.02)',
                }
              }}
            >
              <UserAvatar 
                src={user.avatar || user.profileImage || undefined} // CONVERT null to undefined
                sx={{ width: 36, height: 36, mr: 1 }}
              >
                {user.avatar || user.profileImage ? null : user.username?.charAt(0).toUpperCase()}
              </UserAvatar>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'white', 
                  fontWeight: 600,
                  display: { xs: 'none', sm: 'block' }, // Verstecke Username auf Mobile
                  fontSize: { sm: '0.9rem', md: '1rem' }
                }}
              >
                {user.username}
              </Typography>
            </Box>

            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
                  minWidth: 200,
                  mt: 1,
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(102, 126, 234, 0.1)' }}>
                <Typography variant="subtitle2" fontWeight={700} color="primary">
                  {user.username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              
              <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
                <PersonIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                Profil bearbeiten
              </MenuItem>
              
              <MenuItem onClick={handleSettings} sx={{ py: 1.5 }}>
                <SettingsIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                Einstellungen
              </MenuItem>
              
              <Divider sx={{ my: 0.5 }} />
              
              <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
                <LogoutIcon sx={{ mr: 1.5 }} />
                Abmelden
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </GradientAppBar>
  );
};

export default ChatHeader;
