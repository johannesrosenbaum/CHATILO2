import React, { useState, useRef } from 'react';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ChatScreen from './ChatScreen';
import CollageGallery from './CollageGallery';

interface ScreenshotFlipChatProps {
  roomId?: string;
  roomName?: string;
}

const ScreenshotFlipChat = ({ roomId, roomName }: ScreenshotFlipChatProps) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // 📱 Screenshot-Flip-Effekt starten
  const startScreenshotFlip = () => {
    if (isFlipping) return;
    
    setIsFlipping(true);
    
    // Nach der halben Animation (wenn Screenshot umgedreht ist) Galerie anzeigen
    setTimeout(() => {
      setShowGallery(true);
    }, 600); // Mitte der 1.2s Animation
    
    // Flip beendet
    setTimeout(() => {
      setIsFlipping(false);
    }, 1200);
  };

  // 🔄 Zurück zum Chat
  const flipBackToChat = () => {
    if (isFlipping) return;
    
    setIsFlipping(true);
    
    // Galerie verstecken und Chat zeigen
    setTimeout(() => {
      setShowGallery(false);
    }, 600);
    
    setTimeout(() => {
      setIsFlipping(false);
    }, 1200);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        perspective: '1500px', // 3D-Perspektive für realistischen Effekt
        overflow: 'hidden',
        backgroundColor: '#1a1a1a', // Dunkler Hintergrund für Floating-Effekt
      }}
    >
      {/* 📱 Das "Handy-Screenshot" Container */}
      <motion.div
        ref={chatRef}
        animate={{
          // Screenshot-Effekt: Verkleinern → Flip → Vergrößern
          scale: isFlipping ? [1, 0.85, 0.85, 1] : 1,
          rotateY: showGallery ? 180 : 0,
          y: isFlipping ? [0, -30, -30, 0] : 0, // Leicht abheben
          z: isFlipping ? [0, 100, 100, 0] : 0, // In den Raum hinein
        }}
        transition={{
          duration: 1.2,
          ease: [0.25, 0.1, 0.25, 1],
          times: isFlipping ? [0, 0.3, 0.7, 1] : undefined, // Timing für den Screenshot-Effekt
        }}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
          // Schatten für schwebenden Effekt
          filter: isFlipping ? 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' : 'none',
        }}
      >
        {/* 🖼️ Vorderseite: Chat (Original) */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
            borderRadius: isFlipping ? '12px' : '0px', // Handy-Rounded-Corners beim Flip
            overflow: 'hidden',
            transition: 'border-radius 0.3s ease',
          }}
        >
          <ChatScreen 
            roomId={roomId}
            onShowGallery={startScreenshotFlip}
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
            transform: 'rotateY(180deg)', // Rückseite
            borderRadius: isFlipping ? '12px' : '0px',
            overflow: 'hidden',
            transition: 'border-radius 0.3s ease',
          }}
        >
          {showGallery && (
            <CollageGallery 
              roomId={roomId || ''}
              roomName={roomName || 'Chat'}
              onBackToChat={flipBackToChat}
              isVisible={true}
            />
          )}
        </Box>
      </motion.div>

      {/* 📱 Floating Animation Overlay - Optional für extra Effekte */}
      <AnimatePresence>
        {isFlipping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />
        )}
      </AnimatePresence>
    </Box>
  );
};

export default ScreenshotFlipChat;
