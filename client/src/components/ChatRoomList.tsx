import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
  CircularProgress,
  IconButton
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
  EventAvailable,
  Star as StarIcon,
  School,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import { useLocation as useLocationContext } from '../contexts/LocationContext';
import FavoriteButton from './FavoriteButton';

interface ChatRoom {
  id: string;
  _id?: string;
  name: string;
  type: 'location' | 'event' | 'global' | 'school';
  subType?: 'regional' | 'city' | 'neighborhood' | 'general' | 'university' | 'primary' | 'secondary';
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

interface ChatRoomListProps {
  onRoomSelect?: () => void;
}


const ChatRoomList: React.FC<ChatRoomListProps> = ({ onRoomSelect }) => {

  // --- DEBUG PANEL: Show context state at the very top ---
  // This will always render at the top of the page, even before loading guards

  // Always show a debug panel at the very top for troubleshooting
  // IMPORTANT: Only call useAuth/useSocket ONCE at the top!
  const { user, loading: authLoading, token } = useAuth();
  const { 
    rooms, 
    chatRooms, 
    joinRoom, 
    userLocation, 
    currentLocationName, 
    isLocationLoading, 
    locationAccuracy,
    createEventRoom,
    isRoomsLoading
  } = useSocket();
  const { getFavoriteRoomsData } = useChat();
  const { loadNearbySchools, nearbySchools } = useLocationContext();
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  
  // Expanded state für Sektionen
  const [villagesExpanded, setVillagesExpanded] = useState(true);
  const [schoolsExpanded, setSchoolsExpanded] = useState(true);
  const [eventsExpanded, setEventsExpanded] = useState(false);
  const [globalExpanded, setGlobalExpanded] = useState(false);
  
  // Debug-Panel Sichtbarkeit steuern
  const [showDebug, setShowDebug] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = useParams<{ roomId: string }>();

  // Load schools when user location is available
  useEffect(() => {
    if (userLocation && user) {
      console.log('🏫 Triggering school load for location:', userLocation);
      loadNearbySchools();
    }
  }, [userLocation, user, loadNearbySchools]);

  // --- NEW: Robust loading and error guard for user context ---
  // Always render the sidebar UI. Show loading or error state inside the sidebar if needed.

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
    console.log('🔥🔥🔥 ROOM CLICK TRIGGERED!!!', selectedRoomId); 
    console.log('🚪 Navigating to room:', selectedRoomId); 
    console.log('🔗 Current URL before navigation:', window.location.href);
    console.log('🔗 Current React Router location:', location);
    console.log('🔗 Current pathname:', location.pathname);
    console.log('🔗 Current search:', location.search);
    console.log('🔗 Current roomId param:', roomId);
    
    // Close mobile menu if callback provided
    onRoomSelect?.();
    
    // 🔥 UPDATED FOR NEW ROUTE FORMAT: /chat/room/:roomId
    const targetPath = `/chat/room/${selectedRoomId}`;
    console.log('🔗 Target navigation path:', targetPath);
    
    try {
      // Try normal navigation first (not replace)
      console.log('🚀 Calling navigate() with normal navigation:', targetPath);
      navigate(targetPath);
      console.log('✅ navigate() call completed without error');
      
      // Monitor what happens after navigation
      setTimeout(() => {
        console.log('🔗 URL after navigation (10ms):', window.location.href);
        console.log('🔗 Window pathname after navigation (10ms):', window.location.pathname);
        console.log('🔗 Did navigation stick?', window.location.pathname === targetPath);
      }, 10);
      
      setTimeout(() => {
        console.log('🔗 URL after navigation (100ms):', window.location.href);
        console.log('🔗 Window pathname after navigation (100ms):', window.location.pathname);
        console.log('🔗 Did navigation stick?', window.location.pathname === targetPath);
      }, 100);
      
      setTimeout(() => {
        console.log('🔗 URL after navigation (500ms):', window.location.href);
        console.log('🔗 Window pathname after navigation (500ms):', window.location.pathname);
        console.log('🔗 Did navigation stick?', window.location.pathname === targetPath);
        if (window.location.pathname !== targetPath) {
          console.error('❌ NAVIGATION WAS OVERRIDDEN! Something is causing a redirect back to /chat');
        }
      }, 500);
      
    } catch (error) {
      console.error('❌ Error during navigation:', error);
    }
    
    console.log('✅ Navigation function completed, SocketContext will handle room joining');
  };

  // Debug: Logge alle relevanten Daten für die Sidebar
  console.log('🟣 [ChatRoomList] Context rooms:', rooms);
  console.log('🟣 [ChatRoomList] Context chatRooms:', chatRooms);
  console.log('🟣 [ChatRoomList] Aktueller User:', user);
  // Verwende rooms ODER chatRooms - welche auch immer gefüllt sind
  const displayRooms = chatRooms;
  console.log('🟣 [ChatRoomList] displayRooms:', displayRooms);

  // ⭐ FAVORITEN-DATEN LADEN
  const favoriteRoomsData = getFavoriteRoomsData();
  console.log('⭐ [ChatRoomList] Favoriten-Räume:', favoriteRoomsData);

  // DEBUG: Manual reload and state info
  // This will render a debug button at the top for manual reload and state inspection
  // Remove DebugReload if reloadRooms is not available to avoid syntax error
  // If you want to keep a debug panel, just show info:
  const DebugInfo = () => (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="caption" sx={{ color: 'white' }}>
        User: {user?.username || 'none'} | Location: {userLocation ? `${userLocation.latitude},${userLocation.longitude}` : 'none'}
      </Typography>
      <Typography variant="caption" sx={{ color: 'white' }}>
        Rooms: {rooms?.length ?? 0} | ChatRooms: {chatRooms?.length ?? 0}
      </Typography>
    </Box>
  );

  // Ladeanzeige, wenn Räume oder Location noch nicht bereit sind
  const isLoading = isLocationLoading || isRoomsLoading || !chatRooms?.length;

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <CircularProgress color="primary" />
        <Typography variant="h6" sx={{ mt: 2, color: 'primary.main' }}>
          Suche Räume in deiner Nähe ...
        </Typography>
      </Box>
    );
  }


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
      case 'school':
        if (roomSubType === 'university') return <School color="info" />;
        if (roomSubType === 'secondary') return <School color="warning" />;
        if (roomSubType === 'primary') return <School color="success" />;
        return <School color="info" />;
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
      type: (room.type || 'location') as 'location' | 'event' | 'global' | 'school',
      subType: (room.subType || 'neighborhood') as 'regional' | 'city' | 'neighborhood' | 'general' | 'university' | 'primary' | 'secondary' | undefined,
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

  // Room category arrays
  const regionalRooms = convertedRooms.filter(
    (room) => room.type === 'location' && room.subType === 'regional'
  );
  const cityRooms = convertedRooms.filter(
    (room) => room.type === 'location' && room.subType === 'city'
  );
  const allNeighborhoodRooms = convertedRooms.filter(
    (room) => room.type === 'location' && room.subType === 'neighborhood'
  );
  const eventRooms = convertedRooms.filter(
    (room) => room.type === 'event'
  );
  const globalRooms = convertedRooms.filter(
    (room) => room.type === 'global'
  );
  
  // School category arrays
  const schoolRooms = convertedRooms.filter(
    (room) => room.type === 'school'
  );
  const universityRooms = schoolRooms.filter(
    (room) => room.subType === 'university'
  );
  const secondarySchoolRooms = schoolRooms.filter(
    (room) => room.subType === 'secondary'
  );
  const primarySchoolRooms = schoolRooms.filter(
    (room) => room.subType === 'primary'
  );

  // Combined arrays for sections
  const villageRooms = [...regionalRooms, ...cityRooms, ...allNeighborhoodRooms];
  const allSchoolRooms = [...universityRooms, ...secondarySchoolRooms, ...primarySchoolRooms];

  // DEBUG: Zeige alle Räume ungefiltert an
  console.log('🏗️ DEBUG: Zeige alle convertedRooms:', convertedRooms);

  // Debug-Button (nur für Entwickler sichtbar)
  const DebugToggleButton = () => (
    <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10000 }}>
      <Button size="small" variant="outlined" color="secondary" onClick={() => setShowDebug(v => !v)}>
        {showDebug ? 'Debug ausblenden' : 'Debug anzeigen'}
      </Button>
    </Box>
  );

  // Hilfsfunktion für Sektion-Rendering
  const renderRoomSection = (
    title: string, 
    rooms: ChatRoom[], 
    icon: React.ReactNode, 
    expanded: boolean,
    setExpanded: (expanded: boolean) => void
  ) => {
    
    if (rooms.length === 0) return null;
    
    return (
      <Box sx={{ mb: 2 }}>
        <ListItemButton
          onClick={() => setExpanded(!expanded)}
          sx={{
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(255,255,255,0.05)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
            }
          }}
        >
          <ListItemIcon sx={{ color: 'white' }}>
            {icon}
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white' }}>
                {title} ({rooms.length})
              </Typography>
            }
          />
          <IconButton size="small" sx={{ color: 'white' }}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </ListItemButton>
        
        {expanded && (
          <List sx={{ pl: 2 }}>
            {rooms.map((room) => (
              <ListItem key={room.id} disablePadding>
                <ListItemButton
                  onClick={() => handleRoomClick(room.id)}
                  sx={{
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.1)',
                    },
                    '&.Mui-selected': {
                      background: 'rgba(255,255,255,0.2)',
                    }
                  }}
                  selected={roomId === room.id}
                >
                  <ListItemIcon>
                    {getRoomIcon(room.type, room.subType)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {room.name}
                        </Typography>
                        {room.distance && (
                          <Chip
                            label={`${room.distance.toFixed(1)}km`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <People fontSize="small" sx={{ color: 'rgba(255,255,255,0.5)' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          {room.participants} Teilnehmer
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FavoriteButton 
                      roomId={room.id} 
                      roomName={room.name}
                      size="small"
                    />
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    );
  };


  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        backdropFilter: 'blur(10px)',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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

        {/* ⭐ FAVORITEN-SHORTCUTS SEKTION */}
        {favoriteRoomsData.length > 0 && (
          <Box sx={{ mt: 2, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="subtitle2" sx={{ 
              mb: 1, 
              color: '#ffc107',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <StarIcon fontSize="small" />
              Favoriten
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1,
              maxHeight: '120px',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(255, 193, 7, 0.3)',
                borderRadius: '2px',
              },
            }}>
              {favoriteRoomsData.map((room) => (
                <Chip
                  key={room._id}
                  label={room.name}
                  onClick={() => handleRoomClick(room._id)}
                  sx={{
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    color: '#ffc107',
                    borderColor: '#ffc107',
                    fontSize: '0.75rem',
                    height: '28px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 193, 7, 0.2)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Loading/Error State for User */}
        {authLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexDirection: 'column' }}>
            <CircularProgress color="secondary" />
            <Typography sx={{ ml: 2, mt: 2 }}>Lade Benutzerdaten...</Typography>
            <Box sx={{ mt: 2, p: 2, background: 'rgba(0,0,0,0.7)', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: 'orange' }}>
                Debug: user={String(user)} | token={token ? token.slice(0,12)+'...' : 'none'} | authLoading={String(authLoading)}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'red', mt: 2 }}>
              Warte auf Authentifizierung...
            </Typography>
          </Box>
        )}
        {!authLoading && !user && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ color: 'red', mb: 2 }}>
              ❌ Kein Benutzer geladen! Bitte neu einloggen.
            </Typography>
            <Button variant="contained" color="secondary" onClick={() => window.location.reload()} sx={{ mb: 2 }}>
              Seite neu laden
            </Button>
            <Box sx={{ mt: 2, p: 2, background: 'rgba(0,0,0,0.7)', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: 'orange' }}>
                Debug: user={String(user)} | token={token ? token.slice(0,12)+'...' : 'none'} | authLoading={String(authLoading)}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Room Lists */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        backdropFilter: 'blur(10px)',
        color: 'white'
      }}>
        {convertedRooms.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress color="secondary" />
            <Typography sx={{ mt: 2, color: 'rgba(255,255,255,0.7)' }}>
              Lade Chatrooms...
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {/* Villages Sektion */}
            {renderRoomSection(
              'Villages', 
              villageRooms, 
              <LocationOn />, 
              villagesExpanded,
              setVillagesExpanded
            )}
            
            {/* Schools Sektion */}
            {renderRoomSection(
              'Schools & Universities', 
              allSchoolRooms, 
              <School />, 
              schoolsExpanded,
              setSchoolsExpanded
            )}
            
            {/* Events Sektion */}
            {renderRoomSection(
              'Events', 
              eventRooms, 
              <Event />, 
              eventsExpanded,
              setEventsExpanded
            )}
            
            {/* Global Sektion */}
            {renderRoomSection(
              'Global Chats', 
              globalRooms, 
              <Public />, 
              globalExpanded,
              setGlobalExpanded
            )}
          </List>
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
}

export default ChatRoomList;
