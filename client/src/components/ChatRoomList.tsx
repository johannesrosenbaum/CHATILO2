import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Badge,
  Tooltip,
  Chip,
  Divider,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress
} from '@mui/material';
import {
  LocationOn,
  Event,
  People,
  Public,
  Group,
  MyLocation,
  Add,
  Schedule,
  EventAvailable
} from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';
import { useNavigate, useParams } from 'react-router-dom';

interface ChatRoom {
  id: string;
  _id?: string;
  name: string;
  type: 'location' | 'event' | 'global';
  subType?: 'regional' | 'city' | 'neighborhood' | 'general';
  participants: number;
  lastMessage?: any;
  // KORRIGIERT: Flexible location property
  location?: {
    type?: string;
    coordinates?: [number, number];
    address?: string;
    city?: string;
    radius?: number;
    latitude?: number;  // Alternative Format
    longitude?: number; // Alternative Format
  };
  event?: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    maxParticipants: number;
  };
  createdBy?: string;
  isActive?: boolean;
  lastActivity?: string;
  distance?: number;
  description?: string;
}

const ChatRoomList: React.FC = () => {
  const { 
    rooms, 
    chatRooms, 
    joinRoom, 
    userLocation, 
    currentLocationName, 
    isLocationLoading, 
    locationAccuracy,
    createEventRoom 
  } = useSocket();
  
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');

  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();

  // Type-safe room ID extraction
  const getRoomId = (room: any): string => {
    const id = room._id || room.id;
    if (!id) {
      console.warn('⚠️ Room without valid ID:', room);
      return 'unknown-room';
    }
    return id;
  };

  const handleRoomClick = (selectedRoomId: string) => {
    console.log('🚪 Navigating to room:', selectedRoomId); 
    joinRoom(selectedRoomId);
    navigate(`/chat/${selectedRoomId}`);
  };

  // Verwende rooms ODER chatRooms - welche auch immer gefüllt sind
  const displayRooms = rooms && rooms.length > 0 ? rooms : chatRooms;

  // KORRIGIERT: getRoomIcon ohne Type Assertion - akzeptiert string types
  const getRoomIcon = (roomType: string, roomSubType?: string) => {
    switch (roomType) {
      case 'location':
        if (roomSubType === 'regional') return <Public color="primary" />;
        if (roomSubType === 'city') return <LocationOn color="primary" />;
        if (roomSubType === 'neighborhood') return <Group color="secondary" />;
        return <LocationOn color="primary" />;
      case 'event':
        return <Event color="secondary" />;
      case 'global':
        return <Public color="action" />;
      default:
        return <Group />;
    }
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateEvent = async () => {
    try {
      await createEventRoom({
        eventName,
        eventDescription,
        startDate: eventStartDate,
        endDate: eventEndDate
      });
      
      setCreateEventOpen(false);
      setEventName('');
      setEventDescription('');
      setEventStartDate('');
      setEventEndDate('');
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  // KORRIGIERT: Sichere Type Conversion ohne "as ChatRoom"
  const convertedRooms = displayRooms?.map((room, index) => {
    console.log('🔍 Processing room:', room.name, 'participants:', room.participants, 'distance:', room.distance, 'type:', room.type, 'subType:', room.subType);
    
    // SICHERE Type Conversion ohne Type Assertions
    const convertedRoom: ChatRoom = {
      ...room,
      id: getRoomId(room),
      type: (room.type || 'location') as 'location' | 'event' | 'global',
      subType: (room.subType || 'neighborhood') as 'regional' | 'city' | 'neighborhood' | 'general' | undefined,
      participants: room.participants || 0,
      distance: room.distance || 0,
      event: room.event ? {
        ...room.event,
        maxParticipants: room.event.maxParticipants ?? 0
      } : undefined,
      description: room.description || undefined,
      // LOCATION MAPPING: Unterstütze beide Formate - KEIN TYPE CONFLICT
      location: room.location ? {
        type: room.location.type || 'Point',
        coordinates: room.location.coordinates || [
          room.location.longitude || 0, 
          room.location.latitude || 0
        ],
        address: room.location.address,
        city: room.location.city,
        radius: room.location.radius,
        latitude: room.location.latitude,
        longitude: room.location.longitude
      } : undefined
    };
    
    return convertedRoom;
  }) || [];

  console.log('🔄 Converted rooms:', convertedRooms.length, convertedRooms.map(r => `${r.name} (type: ${r.type}, subType: ${r.subType})`));

  // KRITISCHER FIX: Filter nur auf 'location' - Server sendet jetzt korrekte Types
  const localRooms = convertedRooms.filter(room => 
    room.type === 'location' // Nur location - neighborhood ist jetzt subType!
  );
  
  const regionalRooms = localRooms.filter(room => 
    room.subType === 'regional'
  );

  // FEHLENDE VARIABLEN:
  const cityRooms = localRooms.filter(room => 
    room.subType === 'city'
  );
  
  const eventRooms = convertedRooms.filter(room => 
    room.type === 'event'
  );
  
  const globalRooms = convertedRooms.filter(room => 
    room.type === 'global'
  );

  // ALLE lokalen Rooms als Neighborhood anzeigen
  const allNeighborhoodRooms = localRooms;

  console.log('🏗️ After type filtering:');
  console.log('   Local rooms:', localRooms.length, localRooms.map(r => r.name));
  console.log('   Event rooms:', eventRooms.length);
  console.log('   Global rooms:', globalRooms.length);

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            CHATILO 🚀
          </Typography>
          {userLocation && (
            <Tooltip title="Standort aktiv">
              <MyLocation color="success" fontSize="small" />
            </Tooltip>
          )}
        </Box>
        
        {/* Loading-State für Standortermittlung */}
        {isLocationLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Standort wird ermittelt...
            </Typography>
          </Box>
        )}
        
        {/* Aktueller Standort - nur wenn nicht loading */}
        {currentLocationName && !isLocationLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'white' }} />
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {currentLocationName}
            </Typography>
            {locationAccuracy && (
              <Chip 
                label={`±${Math.round(locationAccuracy)}m`} 
                size="small" 
                sx={{ 
                  ml: 1, 
                  fontSize: '0.6rem', 
                  height: 16,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white'
                }}
                color={locationAccuracy <= 100 ? 'success' : locationAccuracy <= 500 ? 'warning' : 'default'}
              />
            )}
          </Box>
        )}

        {/* Rooms Loading-State */}
        {convertedRooms.length === 0 && !isLocationLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Chat-Räume werden geladen...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Room Lists */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)'
      }}>
        {/* Regional-Chats */}
        {regionalRooms.length > 0 && (
          <>
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 'bold',
                color: 'white'
              }}>
                🌍 Regional ({regionalRooms.length})
              </Typography>
            </Box>
            <List dense>
              {regionalRooms.map((room, index) => (
                <ListItem key={`regional-${getRoomId(room)}-${index}`} disablePadding>
                  <ListItemButton
                    selected={roomId === getRoomId(room)}
                    onClick={() => handleRoomClick(getRoomId(room))}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      mb: 0.5,
                      background: roomId === getRoomId(room) 
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)'
                        : 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                      color: 'white'
                    }}
                  >
                    <ListItemIcon>
                      <Badge badgeContent={room.participants} color="primary">
                        {getRoomIcon(room.type, room.subType)}
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={room.name}
                      secondary={
                        <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <People fontSize="small" />
                            <Typography component="span" variant="caption">
                              {room.participants || 0} online
                            </Typography>
                          </Box>
                          {room.distance !== undefined && room.distance !== null && (
                            <Chip 
                              label={`${room.distance}km`}
                              size="small" 
                              variant="outlined"
                              sx={{ 
                                height: 16, 
                                fontSize: '0.7rem',
                                borderColor: 'rgba(255,255,255,0.5)',
                                color: 'white'
                              }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.2)' }} />
          </>
        )}

        {/* Stadt-Chats */}
        {cityRooms.length > 0 && (
          <>
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 'bold',
                color: 'white'
              }}>
                🏙️ Stadt ({cityRooms.length})
              </Typography>
            </Box>
            <List dense>
              {cityRooms.map((room, index) => (
                <ListItem key={`city-${getRoomId(room)}-${index}`} disablePadding>
                  <ListItemButton
                    selected={roomId === getRoomId(room)}
                    onClick={() => handleRoomClick(getRoomId(room))}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      mb: 0.5,
                      background: roomId === getRoomId(room) 
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)'
                        : 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                      color: 'white'
                    }}
                  >
                    <ListItemIcon>
                      <Badge badgeContent={room.participants} color="primary">
                        {getRoomIcon(room.type, room.subType)}
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={room.name}
                      secondary={
                        <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <People fontSize="small" />
                            <Typography component="span" variant="caption">
                              {room.participants || 0} online
                            </Typography>
                          </Box>
                          {room.distance !== undefined && room.distance !== null && (
                            <Chip 
                              label={`${room.distance}km`}
                              size="small" 
                              variant="outlined"
                              sx={{ 
                                height: 16, 
                                fontSize: '0.7rem',
                                borderColor: 'rgba(255,255,255,0.5)',
                                color: 'white'
                              }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.2)' }} />
          </>
        )}

        {/* Nachbarschafts-Chats - VERWENDE ALLE NEIGHBORHOOD ROOMS */}
        {allNeighborhoodRooms.length > 0 && (
          <>
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 'bold',
                color: 'white'
              }}>
                🏘️ Nachbarschaft ({allNeighborhoodRooms.length})
              </Typography>
            </Box>
            <List dense>
              {allNeighborhoodRooms.map((room, index) => (
                <ListItem key={`neighborhood-${getRoomId(room)}-${index}`} disablePadding>
                  <ListItemButton
                    selected={roomId === getRoomId(room)}
                    onClick={() => handleRoomClick(getRoomId(room))}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      mb: 0.5,
                      background: roomId === getRoomId(room) 
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)'
                        : 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                      color: 'white'
                    }}
                  >
                    <ListItemIcon>
                      <Badge badgeContent={room.participants} color="secondary">
                        {getRoomIcon(room.type || 'location', room.subType)}
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={room.name}
                      secondary={
                        <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <People fontSize="small" />
                            <Typography component="span" variant="caption">
                              {room.participants || 0} online
                            </Typography>
                          </Box>
                          {room.distance !== undefined && room.distance !== null && (
                            <Chip 
                              label={`${room.distance}km`}
                              size="small" 
                              variant="outlined"
                              sx={{ 
                                height: 16, 
                                fontSize: '0.7rem',
                                borderColor: 'rgba(255,255,255,0.5)',
                                color: 'white'
                              }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.2)' }} />
          </>
        )}

        {/* Event-Chats */}
        {eventRooms.length > 0 && (
          <>
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 'bold',
                color: 'white'
              }}>
                🎉 Events ({eventRooms.length})
              </Typography>
            </Box>
            <List dense>
              {eventRooms.map((room, index) => (
                <ListItem key={`event-${getRoomId(room)}-${index}`} disablePadding>
                  <ListItemButton
                    selected={roomId === getRoomId(room)}
                    onClick={() => handleRoomClick(getRoomId(room))}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      mb: 0.5,
                      background: roomId === getRoomId(room) 
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)'
                        : 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                      color: 'white'
                    }}
                  >
                    <ListItemIcon>
                      <Badge badgeContent={room.participants} color="secondary">
                        <Event color="secondary" />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={room.event?.name || room.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            {room.event?.description || room.description || 'Event beschreibung'}
                          </Typography>
                          {room.event?.startDate && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Schedule fontSize="small" color="action" />
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                {formatEventTime(room.event.startDate)}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.2)' }} />
          </>
        )}

        {/* Global-Chats */}
        {globalRooms.length > 0 && (
          <>
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 'bold',
                color: 'rgba(255,255,255,0.7)'
              }}>
                🌐 Global ({globalRooms.length})
              </Typography>
            </Box>
            <List dense>
              {globalRooms.map((room) => (
                <ListItem key={getRoomId(room)} disablePadding>
                  <ListItemButton
                    selected={roomId === getRoomId(room)}
                    onClick={() => handleRoomClick(getRoomId(room))}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      mb: 0.5,
                      background: roomId === getRoomId(room) 
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)'
                        : 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                      color: 'white'
                    }}
                  >
                    <ListItemIcon>
                      <Badge badgeContent={room.participants} color="primary">
                        <Public color="action" />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={room.name}
                      secondary={
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {room.participants} aktiv weltweit
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* FALLBACK: Zeige alle Rooms wenn keine Kategorisierung funktioniert */}
        {convertedRooms.length > 0 && regionalRooms.length === 0 && cityRooms.length === 0 && allNeighborhoodRooms.length === 0 && eventRooms.length === 0 && (
          <>
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 'bold',
                color: 'white'
              }}>
                📍 Alle Chat-Räume ({convertedRooms.length})
              </Typography>
            </Box>
            <List dense>
              {convertedRooms.map((room, index) => (
                <ListItem key={`all-${getRoomId(room)}-${index}`} disablePadding>
                  <ListItemButton
                    selected={roomId === getRoomId(room)}
                    onClick={() => handleRoomClick(getRoomId(room))}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      mb: 0.5,
                      background: roomId === getRoomId(room) 
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)'
                        : 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                      color: 'white'
                    }}
                  >
                    <ListItemIcon>
                      <Badge badgeContent={room.participants} color="primary">
                        {getRoomIcon(room.type, room.subType)}
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={room.name}
                      secondary={
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <People fontSize="small" />
                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <People fontSize="small" />
                              <span>0 online</span> {/* Zeige "0 online" für neue Räume statt der generierten Teilnehmer */}
                            </Typography>
                          </span>
                          {room.distance !== undefined && room.distance !== null && (
                            <Chip 
                              label={`${room.distance}km`}
                              size="small" 
                              variant="outlined"
                              sx={{ 
                                height: 16, 
                                fontSize: '0.7rem',
                                borderColor: 'rgba(255,255,255,0.5)',
                                color: 'white'
                              }}
                            />
                          )}
                        </span>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.2)' }} />
          </>
        )}

        {convertedRooms.length === 0 && !isLocationLoading && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
              🏠 Keine Chat-Räume verfügbar
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              Standort wird verarbeitet oder Server-Problem
            </Typography>
          </Box>
        )}
      </Box>

      {/* Event erstellen FAB */}
      {userLocation && (
        <Fab
          color="secondary"
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
          onClick={() => setCreateEventOpen(true)}
        >
          <Add />
        </Fab>
      )}

      {/* Event Dialog */}
      <Dialog open={createEventOpen} onClose={() => setCreateEventOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventAvailable color="secondary" />
            Neues Event erstellen
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            margin="normal"
            placeholder="z.B. Rock am Ring 2025"
          />
          <TextField
            fullWidth
            label="Beschreibung"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            margin="normal"
            multiline
            rows={3}
            placeholder="Was ist geplant?"
          />
          <TextField
            fullWidth
            label="Start"
            type="datetime-local"
            value={eventStartDate}
            onChange={(e) => setEventStartDate(e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Ende"
            type="datetime-local"
            value={eventEndDate}
            onChange={(e) => setEventEndDate(e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateEventOpen(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleCreateEvent} 
            variant="contained" 
            color="secondary"
            disabled={!eventName.trim()}
          >
            Event erstellen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatRoomList;
