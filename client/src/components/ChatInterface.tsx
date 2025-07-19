import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip
} from '@mui/material';
import { Send as SendIcon, ArrowBack as ArrowBackIcon, PhotoCamera, Videocam, AttachFile } from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';
import '../styles/mobile-chat.css';

const ChatInterface: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  
  // 🚨 EINDEUTIGER DEBUG MARKER - SOLLTE IN CONSOLE ERSCHEINEN
  console.log('🚨🚨🚨 CHATINTERFACE.TSX LÄDT - MODERNES UI SOLLTE SICHTBAR SEIN! 🚨🚨🚨');
  console.log('🎨 Wenn du das siehst aber nicht das moderne UI, dann ist ein anderes Problem da!');

  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const { currentRoom, messages, sendMessage, socket, chatRooms, user, joinRoom } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  console.log('🔧 ChatInterface rendering with:');
  console.log('   currentRoom:', currentRoom);
  console.log('   messages count:', messages?.length || 0);
  console.log('   user:', user?.username);
  console.log('   chatRooms count:', chatRooms?.length || 0);

  // Auto scroll when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when room changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentRoom]);

  // Join room when roomId changes
  useEffect(() => {
    if (roomId && socket && joinRoom) {
      console.log('🚪 ChatInterface: Joining room', roomId);
      joinRoom(roomId);
    }
  }, [roomId, socket, joinRoom]);

  // 🔥 VERBESSERTE User-Daten Extraktion
  const getUserDisplayInfo = (message: any) => {
    console.log('🔧 RAW Message object for user extraction:', message);
    console.log('   Available keys:', Object.keys(message));
    
    const username = message.username || 
                    message.sender?.username || 
                    message.user?.username ||
                    'Unbekannt';
    
    const userId = message.userId || 
                  message.sender?._id || 
                  message.sender?.id ||
                  message.user?._id || 
                  message.user?.id ||
                  'unknown';

    return { username, userId };
  };

  // 🔥 VOLLSTÄNDIG KORRIGIERTE isOwnMessage mit DEBUG
  const isOwnMessage = useCallback((message: any) => {
    const { username: msgUsername, userId: msgUserId } = getUserDisplayInfo(message);
    
    const currentUserId = String(user?._id || user?.id || '');
    const currentUsername = String(user?.username || '');
    const messageUserId = String(msgUserId || '');
    const messageUsername = String(msgUsername || '');
    
    const idMatch = currentUserId.length > 0 && 
                   messageUserId.length > 0 && 
                   currentUserId === messageUserId;
                   
    const usernameMatch = currentUsername.length > 0 && 
                         messageUsername.length > 0 && 
                         currentUsername === messageUsername;
    
    return idMatch || usernameMatch;
  }, [user]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentRoom) return;
    console.log('📤 ChatInterface: Sending message:', newMessage);
    sendMessage(newMessage.trim());
    setNewMessage('');
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBack = () => {
    navigate('/chat');
  };

  const formatMessageTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    // For demo, using a sample image
    setTimeout(() => {
      const imageUrl = 'https://picsum.photos/400/300';
      sendMessage(`📷 Bild geteilt: ${imageUrl}`);
      setIsUploading(false);
      
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }, 2000);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    // For demo, using a sample video
    setTimeout(() => {
      const videoUrl = 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4';
      sendMessage(`🎥 Video geteilt: ${videoUrl}`);
      setIsUploading(false);
      
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
    }, 2000);
  };

  // Find current room info
  const currentRoomInfo = chatRooms?.find(room => room._id === currentRoom || room.id === currentRoom);
  const isEffectivelyConnected = !!socket && !!currentRoom;
  const participantCount = currentRoomInfo?.participants || 1;

  return (
    <Box sx={{ 
      height: { xs: '100vh', md: '100vh' }, 
      width: { xs: '100vw', md: 'auto' },
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#f0f2f5',
      position: 'relative',
      overflow: 'hidden',
      margin: 0,
      padding: 0
    }} className="chat-interface-container">
      {/* 🎨 MODERN HEADER */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 1.5, sm: 2 }, 
          borderRadius: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          zIndex: 100
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <IconButton onClick={handleBack} edge="start" sx={{ color: 'white' }}>
            <ArrowBackIcon />
          </IconButton>
          
          {/* Room Avatar */}
          <Avatar
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              width: { xs: 35, sm: 40 },
              height: { xs: 35, sm: 40 },
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            {currentRoomInfo?.name?.charAt(0).toUpperCase() || 'R'}
          </Avatar>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
              {currentRoomInfo?.name || 'Chat Room'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {participantCount} Teilnehmer • {isEffectivelyConnected ? 'Online' : 'Verbindung...'}
            </Typography>
          </Box>
          
          <Chip 
            label={isEffectivelyConnected ? 'Verbunden' : 'Verbindung...'}
            size="small"
            sx={{
              bgcolor: isEffectivelyConnected ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
              color: isEffectivelyConnected ? '#4CAF50' : '#FF9800',
              border: `1px solid ${isEffectivelyConnected ? 'rgba(76, 175, 80, 0.5)' : 'rgba(255, 152, 0, 0.5)'}`
            }}
          />
        </Box>
      </Paper>

      {/* 🎨 MODERN MESSAGES AREA */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        p: { xs: 1, sm: 2 },
        pb: { xs: '80px', sm: 2 }, // Extra bottom padding on mobile for fixed input
        background: 'linear-gradient(180deg, #f0f2f5 0%, #e3f2fd 100%)',
        position: 'relative',
        minHeight: 0,
        maxHeight: { xs: 'calc(100vh - 140px)', sm: 'calc(100vh - 200px)' }
      }} className="messages-container">
        
        {/* Background Pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          pointerEvents: 'none'
        }} />
        
        {!messages || messages.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column',
            gap: 3
          }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
              {isEffectivelyConnected ? 'Willkommen im Chat!' : 'Verbindung wird hergestellt...'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isEffectivelyConnected 
                ? 'Schreibe die erste Nachricht und starte die Unterhaltung!' 
                : `Raum: ${roomId || 'Unbekannt'}`
              }
            </Typography>
          </Box>
        ) : (
          <Box>
            {messages.map((message, index) => {
              const { username: displayUsername } = getUserDisplayInfo(message);
              const isOwn = isOwnMessage(message);
              
              return (
                <Box
                  key={message._id || message.id || `msg-${index}`}
                  sx={{
                    display: 'flex',
                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                    mb: 2
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '75%',
                      background: isOwn 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                      color: isOwn ? 'white' : '#333',
                      borderRadius: '18px'
                    }}
                  >
                    {!isOwn && (
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#9c27b0', display: 'block', mb: 0.5 }}>
                        {displayUsername}
                      </Typography>
                    )}
                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                      {message.content}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.5, display: 'block' }}>
                      {formatMessageTime(message.timestamp || message.createdAt)}
                    </Typography>
                  </Paper>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* 🎨 MODERN MESSAGE INPUT */}
      <Paper 
        sx={{ 
          p: { xs: 1.5, sm: 2 }, 
          borderRadius: 0,
          position: { xs: 'fixed', md: 'static' },
          bottom: { xs: 0, md: 'auto' },
          left: { xs: 0, md: 'auto' },
          right: { xs: 0, md: 'auto' },
          zIndex: { xs: 1000, md: 'auto' },
          borderTop: { xs: '1px solid #e0e0e0', md: 'none' },
          boxShadow: { xs: '0 -2px 8px rgba(0,0,0,0.1)', md: 'none' }
        }} 
        className="chat-input-container"
      >
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 1.5 }, 
          alignItems: 'flex-end',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          {/* Upload buttons */}
          <IconButton
            onClick={() => imageInputRef.current?.click()}
            disabled={!isEffectivelyConnected || isUploading}
            sx={{ 
              color: '#667eea',
              display: { xs: 'none', sm: 'inline-flex' } // Hide on very small screens
            }}
            title="Bild hochladen"
          >
            <PhotoCamera />
          </IconButton>
          
          <IconButton
            onClick={() => videoInputRef.current?.click()}
            disabled={!isEffectivelyConnected || isUploading}
            sx={{ 
              color: '#667eea',
              display: { xs: 'none', sm: 'inline-flex' } // Hide on very small screens
            }}
            title="Video hochladen"
          >
            <Videocam />
          </IconButton>
          
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              setIsTyping(e.target.value.length > 0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Nachricht eingeben..."
            variant="outlined"
            disabled={!isEffectivelyConnected}
            ref={inputRef}
            className="chat-input"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '25px',
                fontSize: { xs: '16px', sm: '14px' } // Prevents zoom on iOS
              },
              '& .MuiInputBase-input': {
                padding: { xs: '12px 16px', sm: '14px 16px' }
              }
            }}
          />
          
          <IconButton
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isEffectivelyConnected}
            sx={{
              background: newMessage.trim() && isEffectivelyConnected 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : '#e0e0e0',
              color: 'white',
              width: { xs: 45, sm: 50 },
              height: { xs: 45, sm: 50 },
              minWidth: { xs: 45, sm: 50 },
              flexShrink: 0
            }}
          >
            <SendIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
          </IconButton>
        </Box>
      </Paper>

      {/* Hidden file inputs */}
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />
      <input
        type="file"
        accept="video/*"
        ref={videoInputRef}
        style={{ display: 'none' }}
        onChange={handleVideoUpload}
      />
    </Box>
  );
};

export default ChatInterface;
