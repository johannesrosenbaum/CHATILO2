import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Box,
  Fade,
  Backdrop
} from '@mui/material';
import {
  Person,
  Settings,
  Info,
  Logout
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
  height: 56,
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
  height: 56,
  minHeight: 56,
  paddingRight: 80,
}));

const LogoIcon = styled(Box)(() => ({
  width: 60, // GRÖSSER: von 40 auf 60px
  height: 60,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 0, // Kein Abstand mehr
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  }
}));

const OverflowAvatar = styled(Avatar)(() => ({
  width: 64,
  height: 64,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  border: '3px solid rgba(255,255,255,0.9)',
  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'absolute',
  top: 14,
  right: 16,
  zIndex: 1000,
  fontSize: '1.5rem',
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
  const radius = 110;
  
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

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
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
        case 'logout':
          logout();
          navigate('/login');
          break;
      }
    }, 300);
  };

  return (
    <>
      <GlassAppBar position="static">
        <FixedToolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <LogoIcon>
              <img 
                src="/Chatilo_pin.png" 
                alt="CHATILO Logo" 
              />
            </LogoIcon>
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
          <MenuCircle
            delay={0.1}
            active={menuOpen}
            angle={225}
            onClick={() => handleMenuItemClick('profile')}
          >
            <Person sx={{ color: '#667eea', fontSize: 20 }} />
          </MenuCircle>

          <MenuCircle
            delay={0.2}
            active={menuOpen}
            angle={180}
            onClick={() => handleMenuItemClick('settings')}
          >
            <Settings sx={{ color: '#667eea', fontSize: 20 }} />
          </MenuCircle>

          <MenuCircle
            delay={0.3}
            active={menuOpen}
            angle={135}
            onClick={() => handleMenuItemClick('info')}
          >
            <Info sx={{ color: '#667eea', fontSize: 20 }} />
          </MenuCircle>

          <MenuCircle
            delay={0.4}
            active={menuOpen}
            angle={90}
            onClick={() => handleMenuItemClick('logout')}
          >
            <Logout sx={{ color: '#667eea', fontSize: 20 }} />
          </MenuCircle>
        </MenuContainer>
      )}
    </>
  );
};

export default Navigation;
