import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Typography,
  Box,
  Chip,
  Slide,
  AppBar,
  Toolbar,
  Divider,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  FiberManualRecord as OnlineIcon,
  Schedule as OfflineIcon,
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const Transition = React.forwardRef<unknown, TransitionProps & {
  children: React.ReactElement;
}>((props, ref) => {
  // Kein Slide - wir verwenden den Flip-Effekt im Dialog selbst
  return <>{props.children}</>;
});

interface User {
  _id: string;
  username: string;
  avatar?: string;
  isActive: boolean;
  lastSeen: string;
  joinedAt?: string;
}

interface UserListModalProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
}

const UserListModal: React.FC<UserListModalProps> = ({ 
  open, 
  onClose, 
  roomId, 
  roomName 
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (open && roomId) {
      fetchRoomUsers();
    }
  }, [open, roomId]);

  const fetchRoomUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/chat/rooms/${roomId}/users`);
      // Sort users: online first, then by join date
      const sortedUsers = response.data.sort((a: User, b: User) => {
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        return new Date(b.joinedAt || b.lastSeen).getTime() - new Date(a.joinedAt || a.lastSeen).getTime();
      });
      setUsers(sortedUsers);
    } catch (error) {
      console.error('Error fetching room users:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastSeen = (lastSeen: string) => {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Gerade aktiv';
    if (diffInMinutes < 60) return `Vor ${diffInMinutes} Min`;
    if (diffInMinutes < 1440) return `Vor ${Math.floor(diffInMinutes / 60)} Std`;
    return `Vor ${Math.floor(diffInMinutes / 1440)} Tagen`;
  };

  const onlineUsers = users.filter(user => user.isActive);
  const offlineUsers = users.filter(user => !user.isActive);

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1300,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90%',
          maxWidth: '500px',
          maxHeight: '80vh',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px', // 📱 Handy-Screenshot Rounded Corners
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)', // Floating-Schatten
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
          <Typography sx={{ flex: 1, fontWeight: 600 }} variant="h6">
            Mitglieder in {roomName}
          </Typography>
          <Chip 
            label={`${users.length} Mitglieder`}
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 500,
              mr: 2
            }}
          />
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Paper>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 0 }}>
        {loading ? (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '50vh' 
            }}
          >
            <Typography>Lade Mitglieder...</Typography>
          </Box>
        ) : (
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            {/* Online Users Section */}
            {onlineUsers.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box 
                  sx={{ 
                    p: 2, 
                    pb: 1,
                    background: 'rgba(102, 126, 234, 0.05)',
                    borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
                  }}
                >
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600, 
                      color: '#667eea',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <OnlineIcon sx={{ color: '#10b981', fontSize: 12 }} />
                    Online ({onlineUsers.length})
                  </Typography>
                </Box>
                
                <List sx={{ pt: 0 }}>
                  <AnimatePresence>
                    {onlineUsers.map((user, index) => (
                      <motion.div
                        key={user._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ListItem
                          sx={{
                            backgroundColor: user._id === currentUser?._id ? 'rgba(102, 126, 234, 0.08)' : 'transparent',
                            '&:hover': {
                              backgroundColor: 'rgba(102, 126, 234, 0.05)',
                            },
                            transition: 'background-color 0.2s ease',
                            borderLeft: user._id === currentUser?._id ? '4px solid #667eea' : 'none',
                          }}
                        >
                          <ListItemAvatar>
                            <Box sx={{ position: 'relative' }}>
                              <Avatar 
                                src={user.avatar} 
                                alt={user.username}
                                sx={{ 
                                  width: 48, 
                                  height: 48,
                                  border: '2px solid rgba(102, 126, 234, 0.2)',
                                }}
                              >
                                {user.username.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box
                                sx={{
                                  position: 'absolute',
                                  bottom: 2,
                                  right: 2,
                                  width: 12,
                                  height: 12,
                                  backgroundColor: '#10b981',
                                  border: '2px solid white',
                                  borderRadius: '50%',
                                }}
                              />
                            </Box>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                  {user.username}
                                </Typography>
                                {user._id === currentUser?._id && (
                                  <Chip 
                                    label="Du" 
                                    size="small" 
                                    sx={{ 
                                      backgroundColor: '#667eea', 
                                      color: 'white',
                                      fontWeight: 500,
                                      fontSize: '0.7rem',
                                    }} 
                                  />
                                )}
                              </Box>
                            }
                            secondary="Gerade aktiv"
                          />
                        </ListItem>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </List>
              </Box>
            )}

            {/* Offline Users Section */}
            {offlineUsers.length > 0 && (
              <Box>
                <Box 
                  sx={{ 
                    p: 2, 
                    pb: 1,
                    background: 'rgba(113, 128, 150, 0.05)',
                    borderBottom: '1px solid rgba(113, 128, 150, 0.1)',
                  }}
                >
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600, 
                      color: '#718096',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <OfflineIcon sx={{ color: '#9ca3af', fontSize: 12 }} />
                    Offline ({offlineUsers.length})
                  </Typography>
                </Box>
                
                <List sx={{ pt: 0 }}>
                  <AnimatePresence>
                    {offlineUsers.map((user, index) => (
                      <motion.div
                        key={user._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: (onlineUsers.length + index) * 0.05 }}
                      >
                        <ListItem
                          sx={{
                            opacity: 0.7,
                            '&:hover': {
                              backgroundColor: 'rgba(113, 128, 150, 0.05)',
                              opacity: 1,
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <ListItemAvatar>
                            <Box sx={{ position: 'relative' }}>
                              <Avatar 
                                src={user.avatar} 
                                alt={user.username}
                                sx={{ 
                                  width: 48, 
                                  height: 48,
                                  border: '2px solid rgba(113, 128, 150, 0.2)',
                                  filter: 'grayscale(0.3)',
                                }}
                              >
                                {user.username.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box
                                sx={{
                                  position: 'absolute',
                                  bottom: 2,
                                  right: 2,
                                  width: 12,
                                  height: 12,
                                  backgroundColor: '#9ca3af',
                                  border: '2px solid white',
                                  borderRadius: '50%',
                                }}
                              />
                            </Box>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                {user.username}
                              </Typography>
                            }
                            secondary={formatLastSeen(user.lastSeen)}
                          />
                        </ListItem>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </List>
              </Box>
            )}

            {users.length === 0 && !loading && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '50vh',
                  flexDirection: 'column',
                  gap: 2
                }}
              >
                <Typography variant="h6" color="textSecondary">
                  Keine Mitglieder gefunden
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Es sind aktuell keine Benutzer in diesem Raum.
                </Typography>
              </Box>
            )}
          </Box>
        )}
        </Box>
      </Box>
      </motion.div>
    </Box>
  );
};

export default UserListModal;
