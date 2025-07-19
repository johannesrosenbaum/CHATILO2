import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { theme, gradients } from '../../theme/theme';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

const LoadingScreen: React.FC<{ onReady?: () => void }> = ({ onReady }) => {
  const { user } = useAuth();
  const { isLocationLoading, isRoomsLoading, userLocation, chatRooms } = useSocket();
  const [minTimeReached, setMinTimeReached] = React.useState(false);

  // Starte Standortermittlung und Room-Laden beim Mounten
  React.useEffect(() => {
    const timer = setTimeout(() => setMinTimeReached(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Prüfe, ob alles geladen ist
  React.useEffect(() => {
    if (
      minTimeReached &&
      user &&
      !isLocationLoading &&
      !isRoomsLoading &&
      userLocation &&
      chatRooms && chatRooms.length > 0
    ) {
      if (onReady) onReady();
    }
  }, [minTimeReached, user, isLocationLoading, isRoomsLoading, userLocation, chatRooms, onReady]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        },
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <Box
          sx={{
            width: 120,
            height: 120,
            mx: 'auto',
            mb: 4,
            background: gradients.primary,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)',
            position: 'relative',
          }}
        >
          <LocationIcon sx={{ fontSize: 60, color: 'white' }} />
          
          {/* Rotating border */}
          <Box
            component={motion.div}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            sx={{
              position: 'absolute',
              top: -4,
              left: -4,
              right: -4,
              bottom: -4,
              border: '3px solid transparent',
              borderTop: '3px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
            }}
          />
        </Box>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            background: gradients.primary,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            textAlign: 'center',
          }}
        >
          CHATILO
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
            mb: 4,
          }}
        >
          Verbinde dich mit Menschen in deiner Nähe
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            size={40}
            thickness={4}
            sx={{
              color: '#6366f1',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 500,
              }}
            >
              Lade...
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {/* Floating particles */}
      {[...Array(6)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: [0, Math.random() * 200 - 100],
            y: [0, Math.random() * 200 - 100],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: index * 0.5,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            width: 8,
            height: 8,
            background: gradients.primary,
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
      ))}
    </Box>
  );
};

export default LoadingScreen; 