import React, { useState, useRef } from 'react';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ChatScreen from './ChatScreen';
import CollageGallery from './CollageGallery';

interface SlideshowChatProps {
  roomId?: string;
  roomName?: string;
}

const SlideshowChat = ({ roomId, roomName }: SlideshowChatProps) => {
  const [currentView, setCurrentView] = useState<'chat' | 'gallery'>('chat');
  const [isFlipping, setIsFlipping] = useState(false);

  const switchToGallery = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentView('gallery');
      setIsFlipping(false);
    }, 600);
  };

  const switchToChat = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentView('chat');
      setIsFlipping(false);
    }, 600);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        perspective: '1000px',
      }}
    >
      <AnimatePresence mode="wait">
        {currentView === 'chat' ? (
          <motion.div
            key="chat"
            initial={false}
            animate={{ 
              rotateY: 0,
              scale: 1,
              opacity: 1
            }}
            exit={{ 
              rotateY: -90,
              scale: 0.8,
              opacity: 0.7
            }}
            transition={{
              duration: 0.6,
              ease: [0.4, 0.0, 0.2, 1]
            }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              transformOrigin: 'center left',
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
            }}
          >
            <ChatScreen onShowGallery={switchToGallery} />
          </motion.div>
        ) : (
          <motion.div
            key="gallery"
            initial={{ 
              rotateY: 90,
              scale: 0.8,
              opacity: 0.7
            }}
            animate={{ 
              rotateY: 0,
              scale: 1,
              opacity: 1
            }}
            exit={{ 
              rotateY: 90,
              scale: 0.8,
              opacity: 0.7
            }}
            transition={{
              duration: 0.6,
              ease: [0.4, 0.0, 0.2, 1]
            }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              transformOrigin: 'center right',
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
            }}
          >
            <CollageGallery
              roomId={roomId || ''}
              roomName={roomName || 'Chatraum'}
              onBackToChat={switchToChat}
              isVisible={currentView === 'gallery'}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default SlideshowChat;
