import React from 'react';
import {
  Box,
  Typography,
  Container,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { gradients } from '../../theme/theme';

const HomeScreen = () => {
  const { user } = useAuth();
  const { currentLocation, isLoading: isLocationLoading } = useLocation();

  return (
    <Container maxWidth="lg" sx={{ py: 4, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', width: '100%' }}
      >
        {/* TYPEWRITER EFFECT */}
        <Box sx={{ mb: 8, display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '4rem', md: '6rem', lg: '8rem' },
              fontWeight: 300,
              fontFamily: '"SF Pro Display", "Inter", system-ui, sans-serif',
              letterSpacing: '-0.04em',
              lineHeight: 0.9,
              color: '#1a1a1a',
              margin: 0,
              width: '6ch', // Genug Platz für "hello."
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              borderRight: '3px solid #1a1a1a',
              animation: 'typewriter 1.5s ease-out 0.5s forwards, blink-caret 0.75s step-end 0.5s 3, remove-caret 0.1s 2.25s forwards',
              '@keyframes typewriter': {
                '0%': {
                  width: '0ch',
                },
                '100%': {
                  width: '6ch',
                },
              },
              '@keyframes blink-caret': {
                '0%, 50%': {
                  borderColor: '#1a1a1a',
                },
                '51%, 100%': {
                  borderColor: 'transparent',
                },
              },
              '@keyframes remove-caret': {
                '0%': {
                  borderRight: '3px solid #1a1a1a',
                },
                '100%': {
                  borderRight: 'none',
                },
              },
            }}
          >
            hello.
          </Typography>
        </Box>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {isLocationLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, py: 4 }}>
              <LocationIcon sx={{ color: '#6366f1', fontSize: 26 }} />
              <Typography
                variant="h5"
                sx={{
                  background: gradients.primary,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 600,
                }}
              >
                Standort wird ermittelt...
              </Typography>
            </Box>
          ) : currentLocation ? (
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', mb: 1 }}>
                <LocationIcon sx={{ color: '#6366f1', fontSize: 26 }} />
                <Typography
                  variant="h4"
                  sx={{
                    background: gradients.primary,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 600,
                  }}
                >
                  {currentLocation.address?.city || 'Unbekannte Stadt'}
                </Typography>
              </Box>
              {currentLocation.address?.country && (
                <Typography
                  variant="body1"
                  sx={{
                    color: '#374151',
                    fontWeight: 500,
                  }}
                >
                  {currentLocation.address.country}
                </Typography>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, py: 4 }}>
              <LocationIcon sx={{ color: '#6366f1', fontSize: 26 }} />
              <Typography
                variant="h5"
                sx={{
                  background: gradients.primary,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 600,
                }}
              >
                Standort nicht verfügbar
              </Typography>
            </Box>
          )}
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default HomeScreen;
