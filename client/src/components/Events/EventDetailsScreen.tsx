import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Event as EventIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
  Chat as ChatIcon,
  Share as ShareIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { theme, gradients } from '../../theme/theme';

const EventDetailsScreen: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    // TODO: Fetch event details from API
    const fetchEvent = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEvent({
          _id: eventId,
          name: 'Sommerfest 2024',
          description: 'Ein großartiges Sommerfest mit Live-Musik, Essen und Getränken. Perfekt für die ganze Familie!',
          startDate: '2024-07-15T18:00:00Z',
          endDate: '2024-07-15T23:00:00Z',
          location: {
            coordinates: [13.4050, 52.5200],
          },
          address: {
            street: 'Musterstraße 123',
            city: 'Berlin',
            postalCode: '10115',
          },
          radius: 2000,
          maxParticipants: 500,
          currentParticipants: 127,
          tags: ['Musik', 'Fest', 'Sommer', 'Familie'],
          coverImage: null,
          createdBy: {
            username: 'EventOrganizer',
            profileImage: null,
          },
          chatRoomId: 'chat-room-id',
        });
      } catch (error) {
        console.error('Failed to fetch event:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleJoinEvent = async () => {
    setIsJoining(true);
    try {
      // TODO: Implement join event API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate(`/chat/${event.chatRoomId}`);
    } catch (error) {
      console.error('Failed to join event:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.name,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Event wird geladen...</Typography>
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Kein Event vorhanden</Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>Möchtest du ein Event erstellen?</Typography>
        <Button variant="contained" color="secondary" onClick={() => navigate('/create-event')}>
          Event erstellen
        </Button>
      </Box>
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isPast = endDate < new Date();
  const isFull = event.currentParticipants >= event.maxParticipants;

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <IconButton onClick={() => navigate('/')} sx={{ color: 'white' }}>
            <EventIcon />
          </IconButton>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              background: gradients.primary,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {event.name}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Event Details */}
          <Grid item xs={12} md={8}>
            <Card
              sx={{
                background: 'rgba(30, 30, 30, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {/* Event Status */}
                {isPast && (
                  <Alert
                    severity="warning"
                    sx={{
                      mb: 3,
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#f59e0b',
                    }}
                  >
                    Dieses Event ist bereits vorbei
                  </Alert>
                )}

                {isFull && !isPast && (
                  <Alert
                    severity="error"
                    sx={{
                      mb: 3,
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                    }}
                  >
                    Event ist ausgebucht
                  </Alert>
                )}

                {/* Description */}
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3, lineHeight: 1.6 }}>
                  {event.description}
                </Typography>

                {/* Event Info */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <CalendarIcon sx={{ color: '#6366f1' }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                          Datum & Zeit
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {format(startDate, 'EEEE, dd. MMMM yyyy', { locale: de })}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {format(startDate, 'HH:mm', { locale: de })} - {format(endDate, 'HH:mm', { locale: de })}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <LocationIcon sx={{ color: '#ec4899' }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                          Standort
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {event.address.street}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {event.address.postalCode} {event.address.city}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <GroupIcon sx={{ color: '#10b981' }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                          Teilnehmer
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {event.currentParticipants} / {event.maxParticipants}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <LocationIcon sx={{ color: '#3b82f6' }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                          Radius
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {event.radius >= 1000 ? `${event.radius / 1000} km` : `${event.radius} m`}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                {/* Tags */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {event.tags.map((tag: string) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{
                          background: 'rgba(99, 102, 241, 0.2)',
                          color: '#6366f1',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<ChatIcon />}
                    onClick={handleJoinEvent}
                    disabled={isJoining || isPast || isFull}
                    sx={{
                      background: gradients.primary,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)',
                      },
                      '&:disabled': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.3)',
                      },
                    }}
                  >
                    {isJoining ? 'Beitreten...' : 'Zum Chat beitreten'}
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    onClick={handleShare}
                    sx={{
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      '&:hover': {
                        border: '2px solid rgba(255, 255, 255, 0.4)',
                        background: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    Teilen
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Organizer Info */}
            <Card
              sx={{
                background: 'rgba(30, 30, 30, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                  Veranstalter
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={event.createdBy.profileImage}
                    sx={{
                      width: 48,
                      height: 48,
                      background: gradients.primary,
                    }}
                  >
                    {event.createdBy.username.charAt(0).toUpperCase()}
                  </Avatar>
                  
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                      {event.createdBy.username}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Veranstalter
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card
              sx={{
                background: 'rgba(30, 30, 30, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                  Teilnehmer ({event.currentParticipants})
                </Typography>
                
                <List sx={{ p: 0 }}>
                  {[...Array(Math.min(5, event.currentParticipants))].map((_, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`Teilnehmer ${index + 1}`}
                        sx={{
                          '& .MuiTypography-root': {
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: '0.875rem',
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                  
                  {event.currentParticipants > 5 && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={`+${event.currentParticipants - 5} weitere`}
                        sx={{
                          '& .MuiTypography-root': {
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.875rem',
                            fontStyle: 'italic',
                          },
                        }}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default EventDetailsScreen; 