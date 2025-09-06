import React, { useState } from 'react';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ChatScreen from './ChatScreen';
import CollageGallery from './CollageGallery';

interface FlipBookChatProps {
  roomId?: string;
  roomName?: string;
}

const FlipBookChat: React.FC<FlipBookChatProps> = ({ roomId, roomName }) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const openGallery = () => {
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        perspective: '1500px',
        transformStyle: 'preserve-3d',
        backgroundColor: '#1a1a1a', // Dunkler Hintergrund für den 3D-Effekt
      }}
    >
      {/* Chat Seite (Vorderseite) */}
      <motion.div
        animate={{
          rotateY: isGalleryOpen ? -180 : 0,
        }}
        transition={{
          duration: 1.4,
          ease: [0.23, 1, 0.32, 1], // Smooth cubic-bezier
          type: "tween"
        }}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transformOrigin: 'left center',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          zIndex: isGalleryOpen ? 1 : 2,
          boxShadow: isGalleryOpen 
            ? '0 0 0 rgba(0,0,0,0)' 
            : '5px 0 20px rgba(0,0,0,0.3)',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            background: 'white',
            borderRight: '2px solid #e2e8f0',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: -10,
              width: '10px',
              height: '100%',
              background: 'linear-gradient(to right, rgba(0,0,0,0.1), transparent)',
              zIndex: 10,
            }
          }}
        >
          <ChatScreen onShowGallery={openGallery} />
        </Box>
      </motion.div>

      {/* Galerie Seite (Rückseite) */}
      <motion.div
        animate={{
          rotateY: isGalleryOpen ? 0 : 180,
        }}
        transition={{
          duration: 1.4,
          ease: [0.23, 1, 0.32, 1],
          type: "tween"
        }}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transformOrigin: 'left center',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          zIndex: isGalleryOpen ? 2 : 1,
          boxShadow: isGalleryOpen 
            ? '5px 0 20px rgba(0,0,0,0.3)' 
            : '0 0 0 rgba(0,0,0,0)',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderLeft: '2px solid #e2e8f0',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: -10,
              width: '10px',
              height: '100%',
              background: 'linear-gradient(to left, rgba(0,0,0,0.1), transparent)',
              zIndex: 10,
            }
          }}
        >
          <CollageGallery
            roomId={roomId || ''}
            roomName={roomName || 'Chatraum'}
            onBackToChat={closeGallery}
            isVisible={isGalleryOpen}
          />
        </Box>
      </motion.div>

      {/* Buchrücken-Effekt */}
      <motion.div
        animate={{
          opacity: isGalleryOpen ? 0.8 : 0,
          scaleX: isGalleryOpen ? 1 : 0,
        }}
        transition={{
          duration: 0.7,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '8px',
          height: '100%',
          background: 'linear-gradient(to right, #2d3748, #4a5568)',
          zIndex: 3,
          transformOrigin: 'left center',
          boxShadow: '2px 0 8px rgba(0,0,0,0.4)',
        }}
      />

      {/* Schatten-Effekt während der Rotation */}
      <motion.div
        animate={{
          opacity: Math.abs(isGalleryOpen ? 0.5 : 0),
        }}
        transition={{
          duration: 0.7,
        }}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3), transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
};

export default FlipBookChat;
