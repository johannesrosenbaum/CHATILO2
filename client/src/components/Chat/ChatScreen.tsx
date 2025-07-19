import React, { useState, useEffect, useRef } from 'react';
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

interface ChatScreenProps {}

const ChatScreen: React.FC<ChatScreenProps> = () => {
  const { roomId } = useParams<{ roomId: string }>();
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
    typingUsers,
  } = useChat();

  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, roomId]);

  // Join room when component mounts
  useEffect(() => {
    if (!roomId || !user) return;
    // Nur joinen, wenn der Raum noch nicht aktiv ist!
    if (activeChatRoom?._id !== roomId) {
      joinChatRoom(roomId);
      loadMessages(roomId);
    }
    return () => {
      if (roomId) {
        leaveChatRoom(roomId);
      }
    };
  }, [roomId, user]);

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
    try {
      await sendMessage('', file.type.startsWith('image/') ? 'image' : 'video', file);
      toast.success('Medien gesendet');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Fehler beim Hochladen der Datei');
    } finally {
      setIsSending(false);
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

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
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
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!activeChatRoom) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
        }}
      >
        <Alert severity="warning" sx={{ maxWidth: 400 }}>
          Chatraum nicht gefunden
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
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          background: 'rgba(30, 30, 30, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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
            {activeChatRoom.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem',
            }}
          >
            {activeChatRoom.memberCount} Mitglieder • {activeChatRoom.type === 'local' ? 'Lokal' : 'Event'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Mitglieder">
            <IconButton
              sx={{ color: 'white' }}
              onClick={() => setShowGallery(true)}
            >
              <Badge badgeContent={activeChatRoom.memberCount} color="primary">
                <PeopleIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Mehr Optionen">
            <IconButton
              sx={{ color: 'white' }}
              onClick={handleMenuOpen}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              background: 'rgba(30, 30, 30, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
            },
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <InfoIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText>Raum-Info</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => setShowGallery(true)}>
            <ListItemIcon>
              <GalleryIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText>Galerie</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <LocationIcon sx={{ color: 'white' }} />
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
          sx={{
            height: '100%',
            overflowY: 'auto',
            px: 2,
            py: 1,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '3px',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.5)',
              },
            },
          }}
        >
          <AnimatePresence>
            {(messages[activeChatRoom._id] || []).map((message, index) => (
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
                  showAvatar={index === 0 || (messages[activeChatRoom._id][index - 1]?.userId !== message.userId)}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {(typingUsers[activeChatRoom._id] || []).length > 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              <CircularProgress size={16} />
              <Typography variant="body2">
                {(typingUsers[activeChatRoom._id] || []).join(', ')} schreibt...
              </Typography>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>
      </Box>

      {/* Input Area */}
      <Paper
        elevation={0}
        sx={{
          background: 'rgba(30, 30, 30, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* Image Gallery Modal */}
      {showGallery && (
        <ImageGallery
          onClose={() => setShowGallery(false)}
          roomId={activeChatRoom._id}
        />
      )}
    </Box>
  );
};

export default ChatScreen; 