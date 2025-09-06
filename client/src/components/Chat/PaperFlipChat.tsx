import React, { useState } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import ChatScreen from './ChatScreen';
import CollageGallery from './CollageGallery';

interface PaperFlipChatProps {
  roomId?: string;
  roomName?: string;
}

const PaperFlipChat = ({ roomId, roomName }: PaperFlipChatProps) => {
  const [showGallery, setShowGallery] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  // 📄 Blatt umdrehen
  const flipToGallery = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setShowGallery(true);
    setTimeout(() => setIsFlipping(false), 800);
  };

  const flipToChat = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setShowGallery(false);
    setTimeout(() => setIsFlipping(false), 800);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        perspective: '1500px', // 3D-Perspektive
        backgroundColor: '#ffffff', // Weißer Hintergrund
        overflow: 'hidden',
      }}
    >
      {/* 📄 Das komplette "Blatt Papier" */}
      <motion.div
        animate={{
          rotateY: showGallery ? 180 : 0,
          scale: isFlipping ? 0.9 : 1,
          y: isFlipping ? -20 : 0,
        }}
        transition={{
          duration: 0.8,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
          borderRadius: isFlipping ? '12px' : '0px',
          overflow: 'hidden',
          boxShadow: isFlipping ? '0 25px 80px rgba(0,0,0,0.15)' : 'none',
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
            transform: 'rotateY(180deg)', // Rückseite ist gespiegelt
          }}
        >
          {showGallery && (
            <CollageGallery 
              roomId={roomId || ''}
              roomName={roomName || 'Chat'}
              onBackToChat={flipToChat}
              isVisible={true}
            />
          )}
        </Box>
      </motion.div>
    </Box>
  );
};

export default PaperFlipChat;
