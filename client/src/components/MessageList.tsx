import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Chip,
} from '@mui/material';
import {
  FavoriteOutlined,
  Favorite,
  VolumeUp,
  GetApp,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { getAvatarUrl } from '../utils/avatarUtils';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
    avatar?: string;
  };
  chatRoom: string;
  media?: {
    type: 'audio' | 'video' | 'image' | 'file';
    url: string;
    filename: string;
  };
  likes: string[];
  likesCount: number;
  createdAt: string;
}

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const { user } = useAuth();
  const { likeMessage } = useSocket();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isMyMessage = (message: Message) => {
    return message.sender.id === user?.id;
  };

  const isLikedByMe = (message: Message) => {
    return message.likes.includes(user?.id || '');
  };

  const handleLike = (messageId: string) => {
    likeMessage(messageId);
  };

  const renderMedia = (media: Message['media']) => {
    if (!media) return null;

    switch (media.type) {
      case 'image':
        return (
          <Box sx={{ mt: 1, maxWidth: 300 }}>
            <img
              src={media.url}
              alt={media.filename}
              style={{
                width: '100%',
                borderRadius: 8,
                cursor: 'pointer',
              }}
              onClick={() => window.open(media.url, '_blank')}
            />
          </Box>
        );

      case 'video':
        return (
          <Box sx={{ mt: 1, maxWidth: 300 }}>
            <video
              controls
              style={{
                width: '100%',
                borderRadius: 8,
              }}
            >
              <source src={media.url} type="video/mp4" />
            </video>
          </Box>
        );

      case 'audio':
        return (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <VolumeUp color="primary" />
            <audio controls style={{ maxWidth: 250 }}>
              <source src={media.url} type="audio/mpeg" />
            </audio>
          </Box>
        );

      case 'file':
        return (
          <Box sx={{ mt: 1 }}>
            <Chip
              icon={<GetApp />}
              label={media.filename}
              clickable
              onClick={() => window.open(media.url, '_blank')}
              color="primary"
              variant="outlined"
            />
          </Box>
        );

      default:
        return null;
    }
  };

  if (messages.length === 0) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Typography color="text.secondary">
          Noch keine Nachrichten. Starte die Unterhaltung!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      {messages.map((message) => (
        <Box
          key={message.id}
          sx={{
            display: 'flex',
            justifyContent: isMyMessage(message) ? 'flex-end' : 'flex-start',
            mb: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: isMyMessage(message) ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: 1,
              maxWidth: '70%',
            }}
          >
            <Avatar
              sx={{ width: 32, height: 32 }}
              src={getAvatarUrl(message.sender.avatar)}
            >
              {message.sender.username.substring(0, 1).toUpperCase()}
            </Avatar>

            <Paper
              elevation={1}
              sx={{
                p: 2,
                bgcolor: isMyMessage(message) ? 'primary.main' : 'white',
                color: isMyMessage(message) ? 'white' : 'text.primary',
                borderRadius: 2,
                borderTopLeftRadius: isMyMessage(message) ? 2 : 0,
                borderTopRightRadius: isMyMessage(message) ? 0 : 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 'bold',
                    opacity: isMyMessage(message) ? 0.9 : 0.7,
                  }}
                >
                  {message.sender.username}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    ml: 1,
                  }}
                >
                  {formatTime(message.createdAt)}
                </Typography>
              </Box>

              {message.content && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {message.content}
                </Typography>
              )}

              {renderMedia(message.media)}

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mt: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleLike(message.id)}
                    sx={{
                      color: isLikedByMe(message)
                        ? 'error.main'
                        : isMyMessage(message)
                        ? 'white'
                        : 'text.secondary',
                    }}
                  >
                    {isLikedByMe(message) ? (
                      <Favorite fontSize="small" />
                    ) : (
                      <FavoriteOutlined fontSize="small" />
                    )}
                  </IconButton>
                  {message.likesCount > 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.8,
                        color: isMyMessage(message) ? 'white' : 'text.secondary',
                      }}
                    >
                      {message.likesCount}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default MessageList;
