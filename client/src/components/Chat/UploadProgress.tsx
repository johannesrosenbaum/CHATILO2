import React from 'react';
import { Box, CircularProgress, Typography, Paper, Fade } from '@mui/material';
import { motion } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface UploadProgressProps {
  isVisible: boolean;
  fileName?: string;
  progress?: number;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ 
  isVisible, 
  fileName = 'Datei',
  progress = 0 
}) => {
  if (!isVisible) return null;

  return (
    <Fade in={isVisible} timeout={300}>
      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        sx={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1500,
          p: 3,
          minWidth: 280,
          maxWidth: 400,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        elevation={24}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            color: 'white',
          }}
        >
          {/* Upload Icon mit Animation */}
          <Box
            component={motion.div}
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600,
                mb: 0.5,
                color: 'white'
              }}
            >
              Upload läuft...
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.9,
                mb: 1,
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.85)'
              }}
            >
              {fileName}
            </Typography>

            {/* Progress Bar */}
            <Box sx={{ position: 'relative', mt: 1 }}>
              <Box
                sx={{
                  height: 4,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Box
                  component={motion.div}
                  initial={{ width: 0 }}
                  animate={{ 
                    width: progress > 0 ? `${progress}%` : '100%'
                  }}
                  transition={{ 
                    duration: progress > 0 ? 0.3 : 2,
                    repeat: progress > 0 ? 0 : Infinity,
                    ease: progress > 0 ? "easeOut" : "easeInOut"
                  }}
                  sx={{
                    height: '100%',
                    background: progress > 0 
                      ? 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)'
                      : 'linear-gradient(90deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.6) 100%)',
                    borderRadius: 2,
                  }}
                />
              </Box>
              
              {progress > 0 && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    position: 'absolute',
                    right: 0,
                    top: -18,
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}
                >
                  {Math.round(progress)}%
                </Typography>
              )}
            </Box>
          </Box>

          {/* Spinner */}
          <CircularProgress 
            size={24} 
            thickness={4}
            sx={{ 
              color: 'white',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }} 
          />
        </Box>

        {/* Animated background effect */}
        <Box
          component={motion.div}
          animate={{
            background: [
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 3,
            zIndex: -1,
          }}
        />
      </Paper>
    </Fade>
  );
};

export default UploadProgress;
