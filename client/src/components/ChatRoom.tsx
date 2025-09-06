import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  IconButton
} from '@mui/material';
import { Send as SendIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';
import { useNavigate, useParams } from 'react-router-dom';
import { formatMessageTime } from '../utils/dateUtils';
import FavoriteButton from './FavoriteButton';
import { getAvatarUrl } from '../utils/avatarUtils';

const ChatRoom: React.FC = () => {
  console.log('🔧 ChatRoom component rendering... NEW LAYOUT ACTIVE!!! 🎨'); // <- GEÄNDERT
  
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { 
    socket, 
    messages, 
    currentRoom, 
    joinRoom, 
    sendMessage, 
    user,
    chatRooms 
  } = useSocket();
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log('🔧 ChatRoom State:');
  console.log('   roomId from URL:', roomId);
  console.log('   currentRoom:', currentRoom);
  console.log('   messages count:', messages?.length || 0);
  console.log('   user:', user?.username);
  console.log('   socket connected:', !!socket);

  // Find current room info
  const currentRoomInfo = chatRooms?.find(room => 
    room._id === roomId || room.id === roomId ||
    room.name.toLowerCase().includes(roomId?.split('_')[1] || '')
  );

  console.log('🔧 Current room info:', currentRoomInfo?.name);

  // Join room on mount or room change
  useEffect(() => {
    if (roomId && socket) {
      console.log('🚪 ChatRoom component: Joining room', roomId);
      joinRoom(roomId); // 🔥 Direkte Verwendung ohne Normalisierung
    }
  }, [roomId, socket, joinRoom]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle message input
  const handleSendMessage = () => {
    if (!inputMessage.trim() || !currentRoom) return;
    console.log('📤 ChatRoom: Sending message:', inputMessage);
    sendMessage(inputMessage.trim());
    setInputMessage('');
    setIsTyping(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleBack = () => {
    navigate('/chat');
  };

  // Format timestamp
  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // 🔥 STARK VERBESSERTE Message-Anzeige - MAXIMALE User-Daten Extraktion
  const getUserDisplayInfo = (message: any) => {
    console.log('🔧 RAW Message object for user extraction:', message);
    console.log('   Available keys:', Object.keys(message));
    
    // 🔥 BEREINIGTER Username-Extraktion - nur notwendige Felder
    const username = message.username || 
                    message.sender?.username || 
                    message.user?.username ||
                    'Unbekannt';
    
    // 🔥 BEREINIGTER UserID-Extraktion - nur notwendige Felder
    const userId = message.userId || 
                  message.sender?._id || 
                  message.sender?.id ||
                  message.user?._id || 
                  message.user?.id ||
                  'unknown';

    console.log('🔧 FINAL Extracted user info:', { 
      username, 
      userId, 
      currentUser: user?.username,
      extractionSource: {
        usernameFrom: message.username ? 'message.username' :
                     message.sender?.username ? 'message.sender.username' :
                     message.user?.username ? 'message.user.username' : 'fallback',
        userIdFrom: message.userId ? 'message.userId' :
                   message.sender?._id ? 'message.sender._id' :
                   message.sender?.id ? 'message.sender.id' :
                   message.user?._id ? 'message.user._id' :
                   message.user?.id ? 'message.user.id' : 'fallback'
      }
    });

    return { username, userId };
  };

  // 🔥 VOLLSTÄNDIG KORRIGIERTE isOwnMessage mit DEBUG
  const isOwnMessage = useCallback((message: any) => {
    const { username: msgUsername, userId: msgUserId } = getUserDisplayInfo(message);
    
    // 🔥 CRITICAL: String-Konvertierung für ALLE User-IDs
    const currentUserId = String(user?._id || user?.id || '');
    const currentUsername = String(user?.username || '');
    const messageUserId = String(msgUserId || '');
    const messageUsername = String(msgUsername || '');
    
    console.log('🔥 FINAL isOwnMessage CHECK:');
    console.log('   Message content:', message.content?.substring(0, 30) + '...');
    console.log('   💡 CURRENT USER:');
    console.log('     - ID (string):', `"${currentUserId}"`);
    console.log('     - Username (string):', `"${currentUsername}"`);
    console.log('   💡 MESSAGE USER:');
    console.log('     - ID (string):', `"${messageUserId}"`);
    console.log('     - Username (string):', `"${messageUsername}"`);
    
    // 🔥 ERWEITERTE CHECKS mit detailliertem Logging
    const idMatch = currentUserId.length > 0 && 
                   messageUserId.length > 0 && 
                   currentUserId === messageUserId;
                   
    const usernameMatch = currentUsername.length > 0 && 
                         messageUsername.length > 0 && 
                         currentUsername === messageUsername;
    
    console.log('   💡 MATCH ANALYSIS:');
    console.log('     - Both IDs available:', currentUserId.length > 0 && messageUserId.length > 0);
    console.log('     - IDs match exactly:', currentUserId === messageUserId);
    console.log('     - ID Match Result:', idMatch);
    console.log('     - Both usernames available:', currentUsername.length > 0 && messageUsername.length > 0);
    console.log('     - Usernames match exactly:', currentUsername === messageUsername);
    console.log('     - Username Match Result:', usernameMatch);
    
    const isOwn = idMatch || usernameMatch;
    
    console.log('   🎯 FINAL DECISION:', isOwn ? '✅ OWN MESSAGE (RIGHT)' : '❌ OTHER MESSAGE (LEFT)');
    console.log('   🎯 Based on:', idMatch ? 'User ID match' : usernameMatch ? 'Username match' : 'No match found');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return isOwn;
  }, [user]);

  // 🔥 NEUER FALLBACK: Wenn currentRoom null ist, verwende roomId
  const activeRoom = currentRoom || roomId;
  
  console.log('🔧 ChatRoom Active Room Analysis:');
  console.log('   currentRoom from context:', currentRoom);
  console.log('   roomId from URL:', roomId);
  console.log('   activeRoom (final):', activeRoom);
  console.log('   messages available:', messages?.length || 0);

  // 🔥 KORRIGIERTE MESSAGE DARSTELLUNG - AUCH OHNE currentRoom
  const shouldShowMessages = messages && messages.length > 0;
  const effectiveRoom = currentRoom || roomId; // Fallback auf roomId

  console.log('🔧 ChatRoom MESSAGE DISPLAY LOGIC:');
  console.log('   messages.length:', messages?.length || 0);
  console.log('   currentRoom:', currentRoom);
  console.log('   roomId from URL:', roomId);
  console.log('   effectiveRoom:', effectiveRoom);
  console.log('   shouldShowMessages:', shouldShowMessages);

  if (!socket) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Verbindung wird hergestellt...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
      {/* ✨ CI-KONFORMES HEADER MIT WEISSEM HINTERGRUND */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2.5, 
          borderRadius: 0,
          background: 'white',
          borderTop: '4px solid transparent',
          borderImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1',
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '0'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={handleBack} 
            edge="start" 
            sx={{ 
              color: '#667eea',
              '&:hover': {
                bgcolor: 'rgba(102, 126, 234, 0.08)',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          {/* Room Avatar mit CI-Gradient */}
          <Avatar
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: '2px solid rgba(102, 126, 234, 0.2)',
              width: 44,
              height: 44,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: 'white',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            {currentRoomInfo?.name?.charAt(0).toUpperCase() || 'R'}
          </Avatar>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h6" 
              noWrap 
              sx={{ 
                fontWeight: 600,
                color: '#2d3748',
                fontSize: '1.1rem'
              }}
            >
              {currentRoomInfo?.name || 'Chat Room'}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#718096',
                fontSize: '0.85rem'
              }}
            >
              {currentRoomInfo?.participants || 0} Teilnehmer • {activeRoom ? 'Online' : 'Verbindung...'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={activeRoom ? 'Verbunden' : 'Verbindung...'}
              size="small"
              sx={{
                bgcolor: activeRoom ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                color: activeRoom ? '#2e7d32' : '#f57c00',
                border: `1px solid ${activeRoom ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 152, 0, 0.3)'}`,
                fontWeight: 500
              }}
            />
            {currentRoomInfo && (
              <FavoriteButton 
                roomId={currentRoomInfo._id || currentRoomInfo.id || ''} 
                roomName={currentRoomInfo.name}
                size="small"
              />
            )}
          </Box>
        </Box>
      </Paper>

      {/* ✨ CLEAN WHITE MESSAGES AREA */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        p: 2,
        bgcolor: 'white',
        position: 'relative'
      }}>
        
        {/* Subtle CI Accent Pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.02,
          background: `
            radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(102, 126, 234, 0.1) 0%, transparent 50%)
          `,
          pointerEvents: 'none'
        }} />
        
        {!shouldShowMessages ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column',
            gap: 3,
            position: 'relative',
            zIndex: 1
          }}>
            {/* Welcome Animation */}
            <Box sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)', opacity: 0.7 },
                '50%': { transform: 'scale(1.05)', opacity: 1 },
                '100%': { transform: 'scale(1)', opacity: 0.7 }
              }
            }}>
              <Typography variant="h3" sx={{ color: 'white' }}>
                💬
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2d3748', mb: 1 }}>
                {effectiveRoom ? 'Willkommen im Chat!' : 'Verbindung wird hergestellt...'}
              </Typography>
              <Typography variant="body1" sx={{ color: '#718096' }}>
                {effectiveRoom 
                  ? 'Schreibe die erste Nachricht und starte die Unterhaltung!' 
                  : `Raum: ${roomId || 'Unbekannt'}`
                }
              </Typography>
            </Box>
          </Box>
        ) : (
          // ✨ CLEAN WHITE MESSAGE BUBBLES
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            {messages.map((message, index) => {
              const { username: displayUsername, userId: msgUserId } = getUserDisplayInfo(message);
              const isOwn = isOwnMessage(message);
              
              console.log('🎨 RENDERING message bubble:', {
                index,
                content: message.content.substring(0, 20) + '...',
                displayUsername,
                isOwn,
                currentUser: user?.username
              });

              return (
                <Box
                  key={message._id || message.id || `msg-${index}`}
                  sx={{
                    display: 'flex',
                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                    mb: 2,
                    px: 1,
                    // 🔥 SMOOTH ANIMATION
                    animation: 'slideIn 0.3s ease-out',
                    '@keyframes slideIn': {
                      '0%': { 
                        opacity: 0, 
                        transform: isOwn ? 'translateX(20px)' : 'translateX(-20px)',
                        scale: 0.95
                      },
                      '100%': { 
                        opacity: 1, 
                        transform: 'translateX(0px)',
                        scale: 1
                      }
                    }
                  }}
                >
                  {/* Avatar für fremde Messages (links) mit CI-Design */}
                  {!isOwn && (
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        width: 36,
                        height: 36,
                        fontSize: '0.9rem',
                        mr: 1.5,
                        alignSelf: 'flex-end',
                        border: '2px solid white',
                        boxShadow: '0 3px 12px rgba(102, 126, 234, 0.3)',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      {displayUsername.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                  
                  {/* ✨ CLEAN WHITE MESSAGE BUBBLE */}
                  <Box
                    sx={{
                      maxWidth: '75%',
                      minWidth: '100px',
                      position: 'relative'
                    }}
                  >
                    {/* Message Bubble */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        position: 'relative',
                        background: isOwn 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'white',
                        color: isOwn ? 'white' : '#2d3748',
                        borderRadius: '18px',
                        boxShadow: isOwn 
                          ? '0 4px 20px rgba(102, 126, 234, 0.25)'
                          : '0 2px 12px rgba(0,0,0,0.08)',
                        border: isOwn ? 'none' : '1px solid rgba(102, 126, 234, 0.1)',
                        // Message tail
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          bottom: '8px',
                          [isOwn ? 'right' : 'left']: '-6px',
                          width: 0,
                          height: 0,
                          borderLeft: isOwn ? '6px solid transparent' : 'none',
                          borderRight: isOwn ? 'none' : '6px solid transparent',
                          borderTop: `6px solid ${isOwn ? '#667eea' : 'white'}`,
                          filter: isOwn ? 'none' : 'drop-shadow(-1px -1px 2px rgba(102, 126, 234, 0.1))'
                        },
                        // Hover effect
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: isOwn 
                            ? '0 6px 25px rgba(102, 126, 234, 0.35)'
                            : '0 4px 18px rgba(102, 126, 234, 0.15)'
                        }
                      }}
                    >
                      {/* Username nur bei fremden Messages */}
                      {!isOwn && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontWeight: 600,
                            color: '#667eea',
                            display: 'block',
                            mb: 0.5,
                            fontSize: '0.75rem'
                          }}
                        >
                          {displayUsername}
                        </Typography>
                      )}
                      
                      {/* Message Content */}
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          wordBreak: 'break-word',
                          lineHeight: 1.4,
                          fontSize: '0.95rem',
                          fontWeight: 400
                        }}
                      >
                        {message.content}
                      </Typography>
                      
                      {/* Timestamp + Status */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: isOwn ? 'flex-end' : 'flex-start',
                        mt: 0.5,
                        gap: 0.5
                      }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            opacity: 0.7,
                            fontSize: '0.7rem',
                            fontWeight: 500
                          }}
                        >
                          {formatMessageTime(message.timestamp || message.createdAt)}
                        </Typography>
                        
                        {/* Message Status (nur für eigene Nachrichten) */}
                        {isOwn && (
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            opacity: 0.8
                          }}>
                            <Typography sx={{ fontSize: '0.8rem' }}>✓✓</Typography>
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  </Box>

                  {/* Avatar für eigene Messages (rechts) */}
                  {isOwn && (
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        width: 36,
                        height: 36,
                        fontSize: '0.9rem',
                        ml: 1.5,
                        alignSelf: 'flex-end',
                        border: '2px solid white',
                        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                      }}
                    >
                      {user?.username?.charAt(0).toUpperCase() || 'I'}
                    </Avatar>
                  )}
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* ✨ CLEAN WHITE MESSAGE INPUT */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2.5, 
          borderRadius: 0,
          background: 'white',
          borderTop: '1px solid rgba(102, 126, 234, 0.1)',
          boxShadow: '0 -4px 20px rgba(102, 126, 234, 0.08)'
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              setIsTyping(e.target.value.length > 0);
            }}
            onKeyPress={handleKeyPress}
            placeholder={`Nachricht an ${currentRoomInfo?.name || 'Chat Room'}...`}
            variant="outlined"
            disabled={!activeRoom}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '25px',
                backgroundColor: 'white',
                border: '2px solid rgba(102, 126, 234, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'white',
                  border: '2px solid rgba(102, 126, 234, 0.2)'
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  border: '2px solid #667eea',
                  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                },
                '& fieldset': { border: 'none' }
              },
              '& .MuiInputBase-input': {
                fontSize: '0.95rem',
                py: 1.5,
                px: 2,
                color: '#2d3748'
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#a0aec0',
                opacity: 1
              }
            }}
          />
          
          <IconButton
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || !activeRoom}
            sx={{
              background: inputMessage.trim() && activeRoom 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
              color: 'white',
              width: 50,
              height: 50,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: inputMessage.trim() && activeRoom 
                  ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                  : 'linear-gradient(135deg, #d0d0d0 0%, #a0a0a0 100%)',
                transform: 'scale(1.05)'
              },
              '&:active': {
                transform: 'scale(0.95)'
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
        
        {/* Status Messages */}
        <Box sx={{ mt: 1, minHeight: '20px' }}>
          {isTyping && activeRoom && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#667eea',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <Box sx={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                bgcolor: '#667eea',
                animation: 'typing 1.4s ease-in-out infinite'
              }} />
              Nachricht wird eingegeben...
            </Typography>
          )}
          
          {!activeRoom && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#f44336',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              ⚠️ Nicht mit dem Raum verbunden
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatRoom;
