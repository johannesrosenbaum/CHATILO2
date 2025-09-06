import React, { useState } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import ChatScreen from './ChatScreen';
import CollageGallery from './CollageGallery';

interface FlipPageChatProps {
  roomId?: string;
  roomName?: string;
}

const FlipPageChat = ({ roomId, roomName }: FlipPageChatProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // 📄 Blatt-Wende-Funktionen
  const flipToGallery = () => {
    setIsFlipped(true);
  };

  const flipToChat = () => {
    setIsFlipped(false);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        perspective: '1200px', // 3D-Perspektive für den Flip-Effekt
        overflow: 'hidden',
        backgroundColor: '#f5f5f5', // Hintergrund sichtbar während Flip
      }}
    >
      {/* 📄 Das "Blatt Papier" - 3D Flip Container */}
      <motion.div
        animate={{
          rotateY: isFlipped ? 180 : 0,
        }}
        transition={{
          duration: 0.8,
          ease: [0.25, 0.1, 0.25, 1], // Smooth ease-in-out
        }}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
        }}
      >
        {/* 🖼️ Vorderseite: Chat */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
            // Leichter Schatten für 3D-Effekt
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <ChatScreen 
            roomId={roomId}
            onShowGallery={flipToGallery}
            hideThreeDotMenu={true}
          />
        </Box>

        {/* 🎨 Rückseite: Galerie */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)', // Rückseite ist um 180° gedreht
            // Leichter Schatten für 3D-Effekt
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <CollageGallery 
            roomId={roomId || ''}
            roomName={roomName || 'Chat'}
            onBackToChat={flipToChat}
            isVisible={true}
          />
        </Box>
      </motion.div>
    </Box>
  );
};

export default FlipPageChat;
