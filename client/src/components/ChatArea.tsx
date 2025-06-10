import React, { useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper
} from '@mui/material';
import { useSocket, Message } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

const ChatArea: React.FC = () => {
  const { messages, currentRoom } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentRoom) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100%"
        p={3}
      >
        <Typography variant="h6" color="text.secondary" mb={2}>
          Willkommen bei CHATILO
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Wähle einen Chat-Raum aus der Liste, um zu beginnen
        </Typography>
      </Box>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100%"
        p={3}
      >
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Nachrichten werden geladen...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        overflowY: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >
      {messages.map((message: Message, index: number) => (
        <Box
          key={message._id || message.id || `msg-${index}`}
          sx={{
            display: 'flex',
            justifyContent: (message.sender?._id || message.userId) === (user?._id || user?.id) ? 'flex-end' : 'flex-start',
            mb: 2,
          }}
        >
          <Paper
            elevation={1}
            sx={{
              maxWidth: '70%',
              backgroundColor: (message.sender?._id || message.userId) === (user?._id || user?.id)
                ? 'primary.main' 
                : 'background.paper',
              color: (message.sender?._id || message.userId) === (user?._id || user?.id)
                ? 'primary.contrastText' 
                : 'text.primary',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography variant="caption" color="inherit" sx={{ opacity: 0.7, display: 'block', mb: 0.5 }}>
              {message.sender?.username || message.username || 'Unbekannt'}
            </Typography>
            
            {/* IMAGE RENDERING */}
            {message.type === 'image' && message.mediaUrl && (
              <Box sx={{ mb: 1 }}>
                <Box
                  component="img"
                  src={message.mediaUrl} 
                  alt="Geteiltes Bild"
                  sx={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px', 
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                />
              </Box>
            )}
            
            {/* VIDEO RENDERING */}
            {message.type === 'video' && message.mediaUrl && (
              <Box sx={{ mb: 1 }}>
                <video 
                  controls
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px', 
                    borderRadius: '8px'
                  }}
                >
                  <source src={message.mediaUrl} type="video/mp4" />
                  Dein Browser unterstützt das Video-Element nicht.
                </video>
              </Box>
            )}
            
            {/* TEXT CONTENT */}
            <Typography variant="body2">
              {message.content}
            </Typography>
            
            <Typography variant="caption" color="inherit" sx={{ opacity: 0.5, display: 'block', mt: 0.5 }}>
              {message.createdAt || message.timestamp ? 
                new Date(message.createdAt || message.timestamp).toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Jetzt'
              }
            </Typography>
          </Paper>
        </Box>
      ))}
      
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default ChatArea;