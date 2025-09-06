import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Skeleton,
  Divider,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Event as EventIcon,
  Chat as ChatIcon,
  Group as GroupIcon,
  AccessTime as TimeIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { useChat } from '../../contexts/ChatContext';
import FavoriteButton from '../FavoriteButton';
import { gradients } from '../../theme/theme';

interface Event {
  _id: string;
  roomId: string;
  name: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  organizer: string;
  location: any;
  tags: string[];
  coverImage?: string;
}

const HomeScreen = () => {
  const { user } = useAuth();
  const { currentLocation, isLoading: isLocationLoading } = useLocation();
  const { chatRooms } = useChat();
  const navigate = useNavigate();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Fetch events when location is available
  useEffect(() => {
    const fetchNearbyEvents = async () => {
      if (!currentLocation) return;
      
      setIsLoadingEvents(true);
      try {
        const response = await fetch(
          `/api/events/nearby?latitude=${currentLocation.latitude}&longitude=${currentLocation.longitude}&radius=10000`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchNearbyEvents();
  }, [currentLocation]);

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEventClick = (eventId: string) => {
    navigate(`/chat/room/${eventId}`);
  };

  const handleChatRoomClick = (roomId: string) => {
    navigate(`/chat/room/${roomId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Welcome Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              background: gradients.primary,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              mb: 2,
            }}
          >
            Willkommen, {user?.username}!
          </Typography>
          
          {isLocationLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
              <LocationIcon sx={{ color: '#6366f1', fontSize: 26 }} />
              <Typography variant="h6" color="text.secondary">
                Standort wird ermittelt...
              </Typography>
            </Box>
          ) : currentLocation ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
              <LocationIcon sx={{ color: '#6366f1', fontSize: 26 }} />
              <Typography variant="h6" color="text.primary">
                {currentLocation.address?.city || 'Unbekannte Stadt'}
              </Typography>
            </Box>
          ) : (
            <Typography variant="h6" color="text.secondary">
              Standort nicht verfügbar
            </Typography>
          )}
        </Box>

        {/* Quick Actions */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            startIcon={<AddIcon />}
            onClick={() => navigate('/create-event')}
            variant="contained"
            sx={{
              background: gradients.primary,
              borderRadius: 2,
              px: 3,
              py: 1.5,
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
              },
              transition: 'all 0.2s ease'
            }}
          >
            Event erstellen
          </Button>
        </Box>

        <Grid container spacing={4}>
          {/* Events Section */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <EventIcon sx={{ color: '#667eea', fontSize: 28 }} />
              <Typography variant="h5" fontWeight={600} color="text.primary">
                Events in deiner Nähe
              </Typography>
            </Box>

            {isLoadingEvents ? (
              <Grid container spacing={2}>
                {[1, 2, 3].map((i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Card>
                      <Skeleton variant="rectangular" height={140} />
                      <CardContent>
                        <Skeleton variant="text" sx={{ fontSize: '1.2rem' }} />
                        <Skeleton variant="text" />
                        <Skeleton variant="text" width="60%" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : events.length > 0 ? (
              <Grid container spacing={2}>
                {events.slice(0, 6).map((event) => (
                  <Grid item xs={12} sm={6} key={event._id}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        sx={{
                          cursor: 'pointer',
                          border: '1px solid rgba(102, 126, 234, 0.1)',
                          borderRadius: 2,
                          '&:hover': {
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                        onClick={() => handleEventClick(event._id)}
                      >
                        {event.coverImage && (
                          <CardMedia
                            component="img"
                            height="120"
                            image={event.coverImage}
                            alt={event.name}
                          />
                        )}
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ flex: 1 }}>
                              {event.name}
                            </Typography>
                            <FavoriteButton 
                              roomId={event._id} 
                              roomName={event.name}
                              size="small"
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {formatEventDate(event.startDate)}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <GroupIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {event.currentParticipants}/{event.maxParticipants} Teilnehmer
                            </Typography>
                          </Box>

                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              mb: 1
                            }}
                          >
                            {event.description}
                          </Typography>

                          {event.tags.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {event.tags.slice(0, 3).map((tag) => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  sx={{
                                    background: 'rgba(102, 126, 234, 0.1)',
                                    color: '#667eea',
                                    fontSize: '0.7rem',
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Card sx={{ p: 4, textAlign: 'center', border: '1px solid rgba(102, 126, 234, 0.1)' }}>
                <EventIcon sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
                <Typography variant="h6" color="text.primary" mb={1}>
                  Keine Events in der Nähe
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Erstelle das erste Event in deiner Umgebung!
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/create-event')}
                  variant="contained"
                  sx={{
                    background: gradients.primary,
                    borderRadius: 2,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    },
                  }}
                >
                  Event erstellen
                </Button>
              </Card>
            )}
          </Grid>

          {/* Chat Rooms Sidebar */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <ChatIcon sx={{ color: '#667eea', fontSize: 28 }} />
              <Typography variant="h6" fontWeight={600} color="text.primary">
                Aktive Chat-Räume
              </Typography>
            </Box>

            {chatRooms && chatRooms.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {chatRooms.slice(0, 5).map((room) => (
                  <motion.div
                    key={room._id}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: '1px solid rgba(102, 126, 234, 0.1)',
                        borderRadius: 2,
                        '&:hover': {
                          border: '1px solid rgba(102, 126, 234, 0.3)',
                          background: 'rgba(102, 126, 234, 0.02)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => handleChatRoomClick(room._id)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ flex: 1 }}>
                            {room.name}
                          </Typography>
                          <FavoriteButton 
                            roomId={room._id} 
                            roomName={room.name}
                            size="small"
                          />
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            mb: 1
                          }}
                        >
                          {room.description || `${room.type} Raum`}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={`${room.memberCount || 0} Mitglieder`}
                            size="small"
                            sx={{
                              background: 'rgba(102, 126, 234, 0.1)',
                              color: '#667eea',
                              fontSize: '0.7rem',
                            }}
                          />
                          {room.type === 'event' && (
                            <Chip
                              label="Event"
                              size="small"
                              sx={{
                                background: 'rgba(245, 158, 11, 0.1)',
                                color: '#f59e0b',
                                fontSize: '0.7rem',
                              }}
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                
                <Divider sx={{ my: 1 }} />
                
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                    color: '#667eea',
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: '#667eea',
                      background: 'rgba(102, 126, 234, 0.05)',
                    },
                  }}
                >
                  Alle Chat-Räume anzeigen
                </Button>
              </Box>
            ) : (
              <Card sx={{ p: 3, textAlign: 'center', border: '1px solid rgba(102, 126, 234, 0.1)' }}>
                <ChatIcon sx={{ fontSize: 36, color: '#667eea', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Keine Chat-Räume verfügbar
                </Typography>
              </Card>
            )}
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default HomeScreen;
