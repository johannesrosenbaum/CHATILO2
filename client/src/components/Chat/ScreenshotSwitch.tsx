import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box } from '@mui/material';
import ChatScreen from './ChatScreen';
import CollageGallery from './CollageGallery';

interface ScreenshotSwitchProps {
  roomId?: string;
  initialView?: 'chat' | 'gallery';
}

const ScreenshotSwitch = ({ 
  roomId, 
  initialView = 'chat' 
}: ScreenshotSwitchProps) => {
  const [currentView, setCurrentView] = useState<'chat' | 'gallery'>(initialView);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleShowGallery = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentView('gallery');
      setIsFlipping(false);
    }, 500); // Hälfte der Animation
  };

  const handleCloseGallery = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentView('chat');
      setIsFlipping(false);
    }, 500); // Hälfte der Animation
  };

  return (
    <Box 
      sx={{ 
        height: '100vh', 
        overflow: 'hidden',
        perspective: '1500px', // 3D-Perspektive
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ 
            scale: 1,
            rotateY: currentView === 'gallery' ? -180 : 180,
            z: 0
          }}
          animate={{ 
            // 📱 Screenshot-Flip: Verkleinern → Abheben → Flip → Landen
            scale: isFlipping ? [1, 0.8, 0.8, 1] : 1,
            rotateY: isFlipping ? [
              currentView === 'gallery' ? -180 : 180, 
              currentView === 'gallery' ? -90 : 90, 
              currentView === 'gallery' ? 90 : -90, 
              0
            ] : 0,
            z: isFlipping ? [0, 100, 100, 0] : 0,
          }}
          exit={{ 
            scale: [1, 0.8, 0.8, 0.8],
            rotateY: [0, 45, 90, 180],
            z: [0, 50, 100, 150]
          }}
          transition={{ 
            duration: 1.0,
            ease: [0.25, 0.1, 0.25, 1],
            times: [0, 0.25, 0.75, 1]
          }}
          style={{
            transformOrigin: 'center center',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            width: '100%',
            height: '100%',
            // Schatten für schwebenden Screenshot-Effekt
            filter: isFlipping ? 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' : 'none',
          }}
        >
          {currentView === 'chat' ? (
            <ChatScreen
              roomId={roomId}
              onShowGallery={handleShowGallery}
              hideThreeDotMenu={false}
            />
          ) : (
            <CollageGallery
              roomId={roomId || ''}
              roomName="Galerie"
              onBackToChat={handleCloseGallery}
              isVisible={currentView === 'gallery'}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default ScreenshotSwitch;
