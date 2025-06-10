import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Fade,
  Backdrop
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person,
  Settings,
  Info
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const growFromAvatar = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(0.5);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }
  70% { box-shadow: 0 0 0 20px rgba(102, 126, 234, 0); }
  100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
`;

const GlassAppBar = styled(AppBar)(() => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
  color: '#2d3748',
  height: 56, // KLEINER: von 64 auf 56px
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  }
}));

const FixedToolbar = styled(Toolbar)(() => ({
  height: 56, // ANGEPASST: von 64 auf 56px
  minHeight: 56,
  paddingRight: 80,
}));

const LogoIcon = styled(Box)(() => ({
  width: 32,
  height: 32,
  borderRadius: '8px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '14px',
  marginRight: 12,
  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
}));

const OverflowAvatar = styled(Avatar)(() => ({
  width: 64, // GRÖSSER: von 56 auf 64px
  height: 64,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  border: '3px solid rgba(255,255,255,0.9)',
  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'absolute',
  top: 14, // PERFEKT: 3/4 im Header (42px) + 1/4 darunter (16px) = 56/4*3 = 42 - 32 = 10 + padding
  right: 16,
  zIndex: 1000,
  fontSize: '1.5rem', // GRÖSSER: Text im Avatar
  '&:hover': {
    transform: 'scale(1.1)',
    animation: `${pulseGlow} 1.5s infinite`,
  }
}));

const MenuContainer = styled(Box)(() => ({
  position: 'fixed',
  top: 0,
  right: 0,
  left: 0,
  bottom: 0,
  zIndex: 9999,
  pointerEvents: 'none',
}));

const MenuCircle = styled(Box)<{ delay: number; active: boolean; angle: number }>(({ delay, active, angle }) => {
  const avatarX = typeof window !== 'undefined' ? window.innerWidth - 48 : 300;
  const avatarY = 46;
  const radius = 110; // GRÖSSER: von 90 auf 110px für mehr Abstand
  
  const adjustedAngle = angle - 45;
  
  const targetX = avatarX + Math.cos(adjustedAngle * Math.PI / 180) * radius;
  const targetY = avatarY + Math.sin(adjustedAngle * Math.PI / 180) * radius;

  return {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
    backdropFilter: 'blur(20px)',
    border: '2px solid rgba(102, 126, 234, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    pointerEvents: 'auto',
    position: 'absolute',
    left: `${targetX - 24}px`,
    top: `${targetY - 24}px`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    animation: active ? `${growFromAvatar} 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${delay}s both` : 'none',
    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
    transformOrigin: `${avatarX - targetX + 24}px ${avatarY - targetY + 24}px`,
    '&:hover': {
      transform: 'scale(1.1)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
    }
  };
});

interface MobileHeaderProps {
  onMenuClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleAvatarClick = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuItemClick = (action: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      switch (action) {
        case 'profile':
          navigate('/profile');
          break;
        case 'settings':
          navigate('/settings');
          break;
        case 'info':
          console.log('Info modal öffnen');
          break;
      }
    }, 300);
  };

  return (
    <>
      <GlassAppBar position="fixed">
        <FixedToolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <LogoIcon>C</LogoIcon>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '1px'
              }}
            >
              CHATILO
            </Typography>
          </Box>
        </FixedToolbar>

        <OverflowAvatar onClick={handleAvatarClick}>
          {user?.username?.charAt(0)?.toUpperCase() || 'U'}
        </OverflowAvatar>
      </GlassAppBar>

      {menuOpen && (
        <Fade in={menuOpen} timeout={300}>
          <Backdrop
            open={menuOpen}
            onClick={() => setMenuOpen(false)}
            sx={{ zIndex: 9998, backgroundColor: 'rgba(0,0,0,0.1)' }}
          />
        </Fade>
      )}

      {menuOpen && (
        <MenuContainer>
          {/* Profile Circle - mit größerem Abstand */}
          <MenuCircle
            delay={0.1}
            active={menuOpen}
            angle={225} // GEÄNDERT: von 210° auf 225° für mehr Abstand
            onClick={() => handleMenuItemClick('profile')}
          >
            <Person sx={{ color: '#667eea', fontSize: 20 }} />
          </MenuCircle>

          {/* Settings Circle - bleibt zentral */}
          <MenuCircle
            delay={0.2}
            active={menuOpen}
            angle={180} // BLEIBT: 180° (direkt links)
            onClick={() => handleMenuItemClick('settings')}
          >
            <Settings sx={{ color: '#667eea', fontSize: 20 }} />
          </MenuCircle>

          {/* Info Circle - mit größerem Abstand */}
          <MenuCircle
            delay={0.3}
            active={menuOpen}
            angle={135} // GEÄNDERT: von 150° auf 135° für mehr Abstand
            onClick={() => handleMenuItemClick('info')}
          >
            <Info sx={{ color: '#667eea', fontSize: 20 }} />
          </MenuCircle>
        </MenuContainer>
      )}
    </>
  );
};

export default MobileHeader;
