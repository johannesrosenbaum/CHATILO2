import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { gradients } from '../../theme/theme';

const HomeScreen = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', width: '100%' }}
      >
        {/* ULTRA PREMIUM Hello Animation - Real Ink Effect */}
        <Box sx={{ mb: 8, display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <Box
            sx={{
              position: 'relative',
              fontSize: { xs: '3rem', md: '4.5rem', lg: '7rem' },
              fontWeight: 800,
              fontFamily: '"Poppins", "Roboto", "Arial", sans-serif',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            {/* Background Text (outline) */}
            <Box
              component="span"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                color: 'transparent',
                WebkitTextStroke: '2px rgba(102, 126, 234, 0.2)',
                zIndex: 1,
              }}
            >
              hello.
            </Box>
            
            {/* Main Text (gradient) */}
            <Box
              component="span"
              sx={{
                position: 'relative',
                background: gradients.primary,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                zIndex: 2,
              }}
            >
              hello.
            </Box>
            
            {/* Gloss Effect */}
            <Box
              component="span"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 40%, transparent 70%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                zIndex: 3,
                animation: 'shimmer 3s infinite',
                '@keyframes shimmer': {
                  '0%': {
                    transform: 'translateX(-100%)',
                    opacity: 0,
                  },
                  '50%': {
                    opacity: 1,
                  },
                  '100%': {
                    transform: 'translateX(100%)',
                    opacity: 0,
                  },
                },
              }}
            >
              hello.
            </Box>
          </Box>
        </Box>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ 
              fontSize: '0.9rem',
              maxWidth: '300px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Willkommen bei deiner personalisierten Chat-Umgebung
          </Typography>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default HomeScreen;
