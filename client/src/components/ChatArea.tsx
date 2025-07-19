import React from 'react';
import {
  Box,
  Typography,
  Paper
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import ChatInput from './ChatInput';
import MessageItem from './MessageItem';
import { useSocket } from '../contexts/SocketContext';
import CircularProgress from '@mui/material/CircularProgress';

const ChatArea: React.FC = () => {
  const { currentRoom, messages, isLoadingMessages } = useSocket();
  const { user } = useAuth();

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      {/* Header */}
      <Paper sx={{ p: 2, borderRadius: 0 }}>
        <Typography variant="h6">
          {currentRoom ? `Chat: ${currentRoom}` : 'Wähle einen Chat-Raum'}
        </Typography>
      </Paper>

      {/* Messages Container */}
      <Box sx={{ 
        flex: 1, 
        p: 2, 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        {isLoadingMessages ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            flex: 1,
            color: 'text.secondary'
          }}>
            <Typography variant="body1">
              Noch keine Nachrichten. Schreibe die erste! 📝
            </Typography>
          </Box>
        ) : (
          messages.map((message) => (
            <MessageItem 
              key={message._id || message.id || Math.random()} 
              message={message}
            />
          ))
        )}
      </Box>

      {/* Chat Input - NEU HINZUGEFÜGT */}
      {/* {currentRoom && <ChatInput />} */}
    </Box>
  );
};

export default ChatArea;