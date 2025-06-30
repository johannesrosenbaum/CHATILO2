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
  
  const messageUserId = message.sender?._id || message.sender?.id || message.userId;
  const currentUserId = user?.id || user?._id;
  const isOwnMessage = messageUserId === currentUserId;
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

  const renderMediaContent = () => {
    if (!message.mediaUrl) return null;

    switch (message.type) {
      case 'image':
      case 'gif':
        return (
          <Box sx={{ mt: 1, maxWidth: 300 }}>
            <img
              src={message.mediaUrl}
              alt="Shared image"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: 8,
                cursor: 'pointer'
              }}
              onClick={() => window.open(message.mediaUrl, '_blank')}
            />
          </Box>
        );
      
      case 'video':
        return (
          <Box sx={{ mt: 1, maxWidth: 300 }}>
            <video
              src={message.mediaUrl}
              controls
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: 8
              }}
            />
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Paper
        sx={{
          maxWidth: '70%',
          backgroundColor: isOwnMessage ? 'primary.main' : 'background.paper',
          color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
          borderRadius: 2,
          padding: 1.5,
        }}
      >
        {!isOwnMessage && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            {senderName}
          </Typography>
        )}
        
        {message.content && (
          <Typography variant="body1">
            {message.content}
          </Typography>
        )}
        
        {renderMediaContent()}
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {formatTime(message.createdAt || message.timestamp)}
        </Typography>
      </Paper>
    </Box>
  );
};

export default MessageItem;
