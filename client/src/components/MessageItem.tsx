import React, { useState } from 'react';
import { Box, Typography, Paper, Avatar, IconButton } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Message } from '../contexts/SocketContext';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Determine if this message is from the current user
  const isOwnMessage = (message.sender?._id || message.userId) === (user?._id || user?.id);
  
  // Get username from message
  const senderName = message.sender?.username || message.username || 'Unbekannt';
  
  // Format timestamp
  const formatTime = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Detect media content (images and videos)
  const imageRegex = /https?:\/\/.*\.(jpg|jpeg|png|gif|webp)/i;
  const videoRegex = /https?:\/\/.*\.(mp4|webm|ogg|mov)/i;
  
  const hasImage = imageRegex.test(message.content);
  const hasVideo = videoRegex.test(message.content);
  
  // Extract URLs safely (never returns null)
  const getImageUrl = (): string => {
    const match = message.content.match(imageRegex);
    return match ? match[0] : '';
  };
  
  const getVideoUrl = (): string => {
    const match = message.content.match(videoRegex);
    return match ? match[0] : '';
  };
  
  // Get clean text without media links
  const getCleanText = () => {
    let text = message.content;
    if (hasImage) {
      text = text.replace(imageRegex, '');
    }
    if (hasVideo) {
      text = text.replace(videoRegex, '');
    }
    return text.trim();
  };

  const handleOpenImage = () => {
    // Add implementation
    console.log('Opening image...');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          maxWidth: '70%',
          flexDirection: isOwnMessage ? 'row-reverse' : 'row'
        }}
      >
        {/* Avatar */}
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: isOwnMessage ? 'primary.main' : 'secondary.main',
            fontSize: '0.8rem'
          }}
        >
          {senderName.charAt(0).toUpperCase()}
        </Avatar>

        {/* Message Bubble */}
        <Paper
          elevation={1}
          sx={{
            p: 1.5,
            backgroundColor: isOwnMessage ? 'primary.main' : 'background.paper',
            color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
            borderRadius: 2,
            borderTopLeftRadius: isOwnMessage ? 2 : 0.5,
            borderTopRightRadius: isOwnMessage ? 0.5 : 2,
          }}
        >
          {/* Sender Name (only for other users) */}
          {!isOwnMessage && (
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block', 
                fontWeight: 'bold',
                opacity: 0.8,
                mb: 0.5 
              }}
            >
              {senderName}
            </Typography>
          )}

          {/* Image Content */}
          {message.type === 'image' && message.mediaUrl && (
            <Box sx={{ mb: 1 }}>
              <img 
                src={message.mediaUrl} 
                alt="Shared image"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '300px', 
                  borderRadius: '8px',
                  display: 'block'
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Box>
          )}

          {/* Video Content */}
          {message.type === 'video' && message.mediaUrl && (
            <Box sx={{ mb: 1 }}>
              <video 
                controls
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '300px', 
                  borderRadius: '8px',
                  display: 'block'
                }}
              >
                <source src={message.mediaUrl} type="video/mp4" />
                Dein Browser unterstützt das Video-Element nicht.
              </video>
            </Box>
          )}

          {/* Text Content */}
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
            {message.content}
          </Typography>

          {/* Timestamp */}
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              textAlign: isOwnMessage ? 'left' : 'right',
              opacity: 0.6,
              mt: 0.5,
              fontSize: '0.7rem'
            }}
          >
            {formatTime(message.createdAt || message.timestamp)}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default MessageItem;
