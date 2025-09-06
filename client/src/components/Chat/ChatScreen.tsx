import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Fab,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  Videocam as VideoIcon,
  Mic as MicIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  Info as InfoIcon,
  Collections as GalleryIcon,
  LocationOn as LocationIcon,
  EmojiEmotions as EmojiIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { useLocation } from '../../contexts/LocationContext';
import MessageItem from '../MessageItem';
import ChatInput from '../ChatInput';
import ImageGallery from '../ImageGallery';
import LoadingSpinner from '../LoadingSpinner';
import UserListModal from './UserListModal';
import CollageGallery from './CollageGallery';
import LoadMoreMessages from './LoadMoreMessages';
import UploadProgress from './UploadProgress';

interface ChatScreenProps {
  roomId?: string;
  onShowGallery?: () => void;
  hideThreeDotMenu?: boolean;
}

const ChatScreen = ({ roomId: propRoomId, onShowGallery, hideThreeDotMenu }: ChatScreenProps) => {
  const { roomId: paramRoomId } = useParams<{ roomId: string }>();
  const actualRoomId = propRoomId || paramRoomId;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentLocation } = useLocation();
  const {
    activeChatRoom,
    messages,
    isLoading,
    error,
    sendMessage,
    joinChatRoom,
    leaveChatRoom,
    loadMessages,
    loadMoreMessages,
    typingUsers,
    messagesPagination,
  } = useChat();

  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState<string>('');
  const [showGallery, setShowGallery] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // Screenshot + flip states
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [galleryMounted, setGalleryMounted] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, actualRoomId]);

  // Join room when component mounts or roomId changes - USE REF to avoid dependencies hell
  const hasJoinedRoom = useRef<string | null>(null);
  
  useEffect(() => {
    if (!actualRoomId || !user) return;
    
    // Verhindere mehrfache Joins für den gleichen Raum
    if (hasJoinedRoom.current === actualRoomId) {
      console.log('ChatScreen: Room already joined, skipping');
      return;
    }
    
    console.log('ChatScreen: Joining room', actualRoomId, 'current active:', activeChatRoom?._id);
    
    // Nur joinen wenn es ein neuer Raum ist
    if (activeChatRoom?._id !== actualRoomId) {
      joinChatRoom(actualRoomId);
    }
    
    // Nachrichten immer laden (auch für bestehende Räume)
    loadMessages(actualRoomId);
    
    // Markiere Raum als "joined"
    hasJoinedRoom.current = actualRoomId;
    
    // Cleanup nur bei Unmount oder wenn sich die roomId ändert
    return () => {
      console.log('ChatScreen: Cleanup for room', actualRoomId);
      // Reset hasJoinedRoom wenn Component unmounted wird
      if (hasJoinedRoom.current === actualRoomId) {
        hasJoinedRoom.current = null;
      }
    };
  }, [actualRoomId, user?._id]); // Nur essenzielle Dependencies

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChatRoom || !user) return;
    setIsSending(true);
    try {
      await sendMessage(newMessage.trim(), 'text');
      setNewMessage('');
      toast.success('Nachricht gesendet');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Fehler beim Senden der Nachricht');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !activeChatRoom || !user) return;
    const file = files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Datei zu groß (max. 10MB)');
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Nicht unterstützter Dateityp');
      return;
    }
    
    setIsSending(true);
    setUploadingFileName(file.name);
    
    try {
      await sendMessage('', file.type.startsWith('image/') ? 'image' : 'video', file);
      toast.success('Medien gesendet');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Fehler beim Hochladen der Datei');
    } finally {
      setIsSending(false);
      setUploadingFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleBackClick = () => {
    navigate('/');
  };

  const handleOpenGallery = useCallback(async () => {
    console.log('[ChatScreen] handleOpenGallery called');
    // capture screenshot of chat area if possible
    try {
      if (chatAreaRef.current) {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(chatAreaRef.current, {
           scale: Math.min(2, window.devicePixelRatio || 2),
           useCORS: true,
           logging: false,
         });
         const dataUrl = canvas.toDataURL('image/png');
         setSnapshot(dataUrl);
       } else {
         setSnapshot(null);
       }
     } catch (err) {
      console.error('Screenshot failed:', err);
      setSnapshot(null);
    }

    console.log('[ChatScreen] Setting gallery states');
    // show overlay and start mounting gallery after half the animation
    setOverlayVisible(true);
    setShowGallery(true);
    setGalleryMounted(false);
    // mount gallery after a bit (half animation) to avoid flash
    window.setTimeout(() => {
      console.log('[ChatScreen] Mounting gallery after delay');
      setGalleryMounted(true);
    }, 300); // Reduced delay to 300ms
  }, []);

  const handleCloseGallery = useCallback(() => {
    console.log('[ChatScreen] handleCloseGallery called - starting close sequence');
    
    // First unmount the gallery component
    setGalleryMounted(false);
    
    // Then start the reverse animation by setting showGallery to false
    setTimeout(() => {
      console.log('[ChatScreen] Starting reverse animation');
      setShowGallery(false);
    }, 50);
    
    // Finally clear overlay and snapshot after animation completes
    setTimeout(() => {
      console.log('[ChatScreen] Clearing overlay and snapshot');
      setOverlayVisible(false);
      setSnapshot(null);
    }, 650); // 600ms animation + 50ms buffer
  }, []);
  
  // Close on Escape and on outside click
  useEffect(() => {
    if (!overlayVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseGallery();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [overlayVisible]);

  // Ensure gallery states are properly reset when component unmounts
  useEffect(() => {
    return () => {
      setShowGallery(false);
      setOverlayVisible(false);
      setGalleryMounted(false);
      setSnapshot(null);
    };
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        }}
      >
        <LoadingSpinner />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  // WICHTIG: Kein "Chatraum nicht gefunden" mehr! Der Raum wird asynchron geladen.
  if (!actualRoomId) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        }}
      >
        <Alert severity="warning" sx={{ maxWidth: 400 }}>
          Bitte wählen Sie einen Chatraum aus
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <IconButton
          onClick={handleBackClick}
          sx={{ color: 'white' }}
        >
          <ArrowBackIcon />
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {activeChatRoom?.name || 'Lade Raum...'}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.875rem',
            }}
          >
            {activeChatRoom ? `${activeChatRoom.memberCount} Mitglieder • ${activeChatRoom.type === 'local' ? 'Lokal' : 'Event'}` : 'Lädt...'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Mitglieder">
            <IconButton
              sx={{ color: 'white' }}
              onClick={() => setShowUserList(true)}
              disabled={!activeChatRoom}
            >
              <Badge badgeContent={activeChatRoom?.memberCount || 0} color="secondary">
                <PeopleIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Galerie">
            <IconButton
              sx={{ color: 'white' }}
              onClick={handleOpenGallery}
              disabled={!activeChatRoom}
            >
              <GalleryIcon />
            </IconButton>
          </Tooltip>

          {/* 3-Punkte-Menü nur anzeigen wenn hideThreeDotMenu nicht true ist */}
          {!hideThreeDotMenu && (
            <Tooltip title="Mehr Optionen">
              <IconButton
                sx={{ color: 'white' }}
                onClick={handleMenuOpen}
              >
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              background: 'white',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              borderRadius: 2,
            },
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText>Raum-Info</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            if (onShowGallery) {
              onShowGallery();
            } else {
              handleOpenGallery();
            }
            handleMenuClose();
          }}>
            <ListItemIcon>
              <GalleryIcon />
            </ListItemIcon>
            <ListItemText>Galerie</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <LocationIcon />
            </ListItemIcon>
            <ListItemText>Standort</ListItemText>
          </MenuItem>
        </Menu>
      </Paper>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          ref={chatAreaRef}
          sx={{
            height: '100%',
            overflowY: 'auto',
            px: 2,
            py: 1,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0, 0, 0, 0.05)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '3px',
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.3)',
              },
            },
          }}
        >
          {/* Load More Messages Button */}
          {activeChatRoom && messagesPagination[activeChatRoom._id] && (
            <LoadMoreMessages
              onLoadMore={() => loadMoreMessages(activeChatRoom._id)}
              isLoading={messagesPagination[activeChatRoom._id]?.isLoading || false}
              hasMore={messagesPagination[activeChatRoom._id]?.hasMore || false}
              currentMessagesCount={(messages[activeChatRoom._id] || []).length}
            />
          )}

          <AnimatePresence>
            {activeChatRoom && (messages[activeChatRoom._id] || []).map((message, index) => (
              <motion.div
                key={message._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MessageItem
                  message={message}
                  isOwnMessage={message.userId === user?._id}
                  showAvatar={index === 0 || (activeChatRoom && messages[activeChatRoom._id][index - 1]?.userId !== message.userId)}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {activeChatRoom && (typingUsers[activeChatRoom._id] || []).length > 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                color: 'rgba(0, 0, 0, 0.6)',
              }}
            >
              <CircularProgress size={16} />
              <Typography variant="body2">
                {(typingUsers[activeChatRoom._id] || []).join(', ')} schreibt...
              </Typography>
            </Box>
          )}

          <Box ref={messagesEndRef} />
        </Box>
      </Box>

      {/* Input Area */}
      <Paper
        elevation={0}
        sx={{
          background: 'transparent',
          backdropFilter: 'none',
          border: 'none',
          borderTop: 'none',
          boxShadow: 'none',
          p: 2,
        }}
      >
        <ChatInput
          value={newMessage}
          onChange={setNewMessage}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
          onFileUpload={handleFileUpload}
          isSending={isSending}
          fileInputRef={fileInputRef}
          placeholder="Nachricht schreiben..."
        />
      </Paper>

      {/* Hidden file input */}
      <Box
        component="input"
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileUpload}
        sx={{ display: 'none' }}
      />

      {/* Liquid Portal Gallery Effect */}
      <AnimatePresence>
        {(showGallery || galleryMounted) && (
          <motion.div
            key="liquid-portal"
            initial={{ 
              opacity: 0,
              scale: 0.8,
              filter: "blur(20px)"
            }}
            animate={{ 
              opacity: 1,
              scale: 1,
              filter: "blur(0px)"
            }}
            exit={{ 
              opacity: 0,
              scale: 1.1,
              filter: "blur(10px)"
            }}
            transition={{ 
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier for smooth morphing
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1500,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Animated Background Particles */}
            <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    scale: 0,
                    opacity: 0
                  }}
                  animate={{ 
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    scale: [0, 1, 0.8, 1],
                    opacity: [0, 0.6, 0.3, 0.6]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeInOut"
                  }}
                  style={{
                    position: 'absolute',
                    width: 4 + Math.random() * 8,
                    height: 4 + Math.random() * 8,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(2px)',
                  }}
                />
              ))}
            </Box>

            {/* Liquid Portal Container */}
            <motion.div
              initial={{ 
                scale: 0,
                rotateZ: -180,
                borderRadius: "50%"
              }}
              animate={{ 
                scale: showGallery ? 1 : 0,
                rotateZ: 0,
                borderRadius: showGallery ? "20px" : "50%"
              }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              style={{
                width: '90vw',
                maxWidth: '600px',
                height: '85vh',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 25px 50px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {/* Portal Rim Glow */}
              <motion.div
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  position: 'absolute',
                  inset: -2,
                  borderRadius: '22px',
                  background: 'linear-gradient(45deg, #667eea, #764ba2, #f093fb, #667eea)',
                  backgroundSize: '400% 400%',
                  zIndex: -1,
                  opacity: 0.6,
                  filter: 'blur(1px)',
                }}
              />

              {/* Close Button */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.6, duration: 0.4, type: "spring", stiffness: 200 }}
              >
                <IconButton
                  onClick={handleCloseGallery}
                  sx={{ 
                    position: 'absolute', 
                    top: 16, 
                    right: 16, 
                    zIndex: 1600, 
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: '#667eea',
                    border: '2px solid rgba(102, 126, 234, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,1)',
                      transform: 'scale(1.1)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                    },
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </motion.div>

              {/* Portal Content */}
              <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                {/* Loading State */}
                {!galleryMounted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))',
                      zIndex: 10
                    }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <Box sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 30px rgba(102, 126, 234, 0.4)'
                      }}>
                        <GalleryIcon sx={{ color: 'white', fontSize: 28 }} />
                      </Box>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: '#667eea', 
                          fontWeight: 600,
                          mt: 3,
                          textAlign: 'center'
                        }}
                      >
                        Portal öffnet sich...
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#666', 
                          mt: 1,
                          textAlign: 'center',
                          maxWidth: 250
                        }}
                      >
                        Entdecke die magische Galerie
                      </Typography>
                    </motion.div>
                  </motion.div>
                )}

                {/* Gallery Content */}
                {galleryMounted && (
                  <motion.div
                    initial={{ 
                      opacity: 0, 
                      scale: 0.95,
                      filter: "blur(10px)"
                    }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      filter: "blur(0px)"
                    }}
                    transition={{ 
                      delay: 0.3, 
                      duration: 0.6,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <CollageGallery
                      roomId={activeChatRoom._id}
                      roomName={activeChatRoom.name}
                      onBackToChat={handleCloseGallery}
                      isVisible={galleryMounted}
                      hideBackButton={true}
                    />
                  </motion.div>
                )}
              </Box>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User List Modal */}
      {showUserList && activeChatRoom && (
        <UserListModal
          open={showUserList}
          onClose={() => setShowUserList(false)}
          roomId={activeChatRoom._id}
          roomName={activeChatRoom.name}
        />
      )}

      {/* Upload Progress Indicator */}
      <UploadProgress
        isVisible={isSending}
        fileName={uploadingFileName}
      />
    </Box>
  );
};

export default ChatScreen;
