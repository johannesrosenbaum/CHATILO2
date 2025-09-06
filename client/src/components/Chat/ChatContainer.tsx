import React, { useState } from 'react';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ChatScreen from './ChatScreen';
import CollageGallery from './CollageGallery';

interface ChatContainerProps {
  roomId?: string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ roomId }): React.ReactElement => {
  const [currentView, setCurrentView] = useState<'chat' | 'gallery'>('chat');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const switchToGallery = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView('gallery');
      setIsTransitioning(false);
    }, 400);
  };

  const switchToChat = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView('chat');
      setIsTransitioning(false);
    }, 400);
  };

  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100%', 
      height: '100vh',
      overflow: 'hidden',
      perspective: '1000px',
      transformStyle: 'preserve-3d'
    }}>
      <AnimatePresence mode="wait">
        {currentView === 'chat' ? (
          <motion.div
            key="chat"
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: -90 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeInOut",
              transformOrigin: "center left"
            }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
            }}
          >
            <ChatScreen onShowGallery={switchToGallery} />
          </motion.div>
        ) : (
          <motion.div
            key="gallery"
            initial={{ rotateY: 90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: 90 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeInOut",
              transformOrigin: "center right"
            }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
            }}
          >
            <CollageGallery 
              roomId={roomId || ''}
              roomName="Chatraum"
              onBackToChat={switchToChat}
              isVisible={currentView === 'gallery'}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default ChatContainer;
