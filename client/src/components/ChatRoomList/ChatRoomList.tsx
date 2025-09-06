import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Badge,
  IconButton,
  Divider,
  Chip,
  Switch,
  FormControlLabel,
  TextField,
  InputAdornment,
  Collapse,
  Paper,
} from '@mui/material';
import {
  LocationOn,
  Event,
  People,
  Star,
  StarBorder,
  Search,
  ExpandMore,
  ExpandLess,
  Visibility,
  VisibilityOff,
  Public,
  School,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket, ChatRoom } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { gradients } from '../../theme/theme';

interface ChatRoomListProps {
  onRoomSelect?: () => void;
}

const ChatRoomList = ({ onRoomSelect }: ChatRoomListProps) => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const { rooms, chatRooms } = useSocket();

  // Lokale States
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hiddenRooms, setHiddenRooms] = useState<string[]>([]);
  const [showHidden, setShowHidden] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{
    favorites: boolean;
    local: boolean;
    events: boolean;
    education: boolean;
  }>({
    favorites: true,
    local: true,
    events: false,
    education: false,
  });

  // Favoriten aus localStorage laden
  useEffect(() => {
    const savedFavorites = localStorage.getItem(`chatilo_favorites_${user?.id}`);
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    const savedHidden = localStorage.getItem(`chatilo_hidden_${user?.id}`);
    if (savedHidden) {
      setHiddenRooms(JSON.parse(savedHidden));
    }
  }, [user?.id]);

  // Favoriten speichern
  const toggleFavorite = (roomId: string) => {
    const newFavorites = favorites.includes(roomId)
      ? favorites.filter(id => id !== roomId)
      : [...favorites, roomId];
    
    setFavorites(newFavorites);
    localStorage.setItem(`chatilo_favorites_${user?.id}`, JSON.stringify(newFavorites));
  };

  // Raum verstecken/anzeigen
  const toggleRoomVisibility = (roomId: string) => {
    const newHidden = hiddenRooms.includes(roomId)
      ? hiddenRooms.filter(id => id !== roomId)
      : [...hiddenRooms, roomId];
    
    setHiddenRooms(newHidden);
    localStorage.setItem(`chatilo_hidden_${user?.id}`, JSON.stringify(newHidden));
  };

  // Section expandieren/kollabieren
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Raum ID extrahieren
  const getRoomId = (room: ChatRoom): string => {
    return room._id || room.id || '';
  };

  // Raum Klick Handler
  const handleRoomClick = (room: ChatRoom) => {
    const roomId = getRoomId(room);
    navigate(`/chat/room/${roomId}`);
    onRoomSelect?.();
  };

  // Räume filtern und sortieren
  const allRooms = chatRooms || [];
  
  // Nach Suchbegriff filtern
  const filteredRooms = allRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Räume kategorisieren
  const favoriteRooms = filteredRooms
    .filter(room => favorites.includes(getRoomId(room)))
    .filter(room => !hiddenRooms.includes(getRoomId(room)) || showHidden);

  const localRooms = filteredRooms
    .filter(room => room.type === 'location' && !favorites.includes(getRoomId(room)))
    .filter(room => !hiddenRooms.includes(getRoomId(room)) || showHidden);

  const eventRooms = filteredRooms
    .filter(room => room.type === 'event' && !favorites.includes(getRoomId(room)))
    .filter(room => !hiddenRooms.includes(getRoomId(room)) || showHidden);

  const educationRooms = filteredRooms
    .filter(room => room.type === 'global' && !favorites.includes(getRoomId(room))) // Using 'global' instead of 'education'
    .filter(room => !hiddenRooms.includes(getRoomId(room)) || showHidden);

  const hiddenRoomsList = allRooms.filter(room => hiddenRooms.includes(getRoomId(room)));

  // Raum Icon
  const getRoomIcon = (room: ChatRoom) => {
    switch (room.type) {
      case 'event':
        return <Event sx={{ color: '#f59e0b' }} />;
      case 'global':
        return <School sx={{ color: '#10b981' }} />;
      default:
        return <LocationOn sx={{ color: '#6366f1' }} />;
    }
  };

  // Raum Item Component
  const RoomItem = ({ 
    room, 
    showControls = true 
  }) => {
    const roomId = getRoomId(room);
    const isActive = roomId === roomId;
    const isFavorite = favorites.includes(roomId);
    const isHidden = hiddenRooms.includes(roomId);

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
      >
        <ListItem
          disablePadding
          sx={{
            mb: 0.5,
            borderRadius: 2,
            overflow: 'hidden',
            border: isActive ? '2px solid #6366f1' : '1px solid transparent',
            bgcolor: isActive ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
          }}
        >
          <ListItemButton
            onClick={() => handleRoomClick(room)}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                bgcolor: 'rgba(99, 102, 241, 0.05)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: '#f3f4f6',
                  border: '2px solid #e5e7eb',
                }}
              >
                {getRoomIcon(room)}
              </Avatar>
            </ListItemIcon>

            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 500,
                      color: '#1f2937',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                    }}
                  >
                    {room.name}
                  </Typography>
                  {room.subType === 'regional' && (
                    <Chip
                      label="Regional"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        bgcolor: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                      }}
                    />
                  )}
                </Box>
              }
              secondary={
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#6b7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      mb: 0.5,
                    }}
                  >
                    {room.description || 'Kein Chat-Verlauf'}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      {room.participants || 0} Mitglieder
                    </Typography>
                    {room.distance && (
                      <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                        {room.distance.toFixed(1)} km
                      </Typography>
                    )}
                  </Box>
                </Box>
              }
            />

            {showControls && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(roomId);
                  }}
                  sx={{ color: isFavorite ? '#f59e0b' : '#9ca3af' }}
                >
                  {isFavorite ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRoomVisibility(roomId);
                  }}
                  sx={{ color: '#9ca3af' }}
                >
                  {isHidden ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </Box>
            )}
          </ListItemButton>
        </ListItem>
      </motion.div>
    );
  };

  // Section Header Component
  const SectionHeader = ({ 
    title, 
    count, 
    expanded, 
    onToggle,
    icon
  }: { 
    title: string; 
    count: number; 
    expanded: boolean; 
    onToggle: () => void;
    icon: React.ReactNode;
  }) => (
    <ListItem disablePadding>
      <ListItemButton onClick={onToggle} sx={{ py: 1, px: 2 }}>
        <ListItemIcon sx={{ minWidth: 40 }}>
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151' }}>
              {title} ({count})
            </Typography>
          }
        />
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
    </ListItem>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        bgcolor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e5e7eb' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', mb: 2 }}>
          Chaträume
        </Typography>
        
        {/* Suchfeld */}
        <TextField
          size="small"
          placeholder="Räume durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#9ca3af' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#f9fafb',
              borderRadius: 2,
            },
          }}
        />

        {/* Versteckte Räume Toggle */}
        {hiddenRoomsList.length > 0 && (
          <FormControlLabel
            control={
              <Switch
                checked={showHidden}
                onChange={(e) => setShowHidden(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                Versteckte anzeigen ({hiddenRoomsList.length})
              </Typography>
            }
            sx={{ mt: 1 }}
          />
        )}
      </Box>

      {/* Raum Liste */}
      <List sx={{ height: 'calc(100% - 140px)', overflow: 'auto', py: 1 }}>
        {/* Favoriten */}
        {favoriteRooms.length > 0 && (
          <>
            <SectionHeader
              title="Favoriten"
              count={favoriteRooms.length}
              expanded={expandedSections.favorites}
              onToggle={() => toggleSection('favorites')}
              icon={<Star sx={{ color: '#f59e0b' }} />}
            />
            <Collapse in={expandedSections.favorites}>
              <AnimatePresence>
                {favoriteRooms.map((room) => (
                  <RoomItem key={getRoomId(room)} room={room} />
                ))}
              </AnimatePresence>
            </Collapse>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* Lokale Räume */}
        {localRooms.length > 0 && (
          <>
            <SectionHeader
              title="Lokal"
              count={localRooms.length}
              expanded={expandedSections.local}
              onToggle={() => toggleSection('local')}
              icon={<LocationOn sx={{ color: '#6366f1' }} />}
            />
            <Collapse in={expandedSections.local}>
              <AnimatePresence>
                {localRooms.map((room) => (
                  <RoomItem key={getRoomId(room)} room={room} />
                ))}
              </AnimatePresence>
            </Collapse>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* Events */}
        {eventRooms.length > 0 && (
          <>
            <SectionHeader
              title="Events"
              count={eventRooms.length}
              expanded={expandedSections.events}
              onToggle={() => toggleSection('events')}
              icon={<Event sx={{ color: '#f59e0b' }} />}
            />
            <Collapse in={expandedSections.events}>
              <AnimatePresence>
                {eventRooms.map((room) => (
                  <RoomItem key={getRoomId(room)} room={room} />
                ))}
              </AnimatePresence>
            </Collapse>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* Bildung */}
        {educationRooms.length > 0 && (
          <>
            <SectionHeader
              title="Bildung"
              count={educationRooms.length}
              expanded={expandedSections.education}
              onToggle={() => toggleSection('education')}
              icon={<School sx={{ color: '#10b981' }} />}
            />
            <Collapse in={expandedSections.education}>
              <AnimatePresence>
                {educationRooms.map((room) => (
                  <RoomItem key={getRoomId(room)} room={room} />
                ))}
              </AnimatePresence>
            </Collapse>
          </>
        )}

        {/* Keine Räume */}
        {filteredRooms.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              {searchQuery ? 'Keine Räume gefunden' : 'Keine Chaträume verfügbar'}
            </Typography>
          </Box>
        )}
      </List>
    </Paper>
  );
};

export default ChatRoomList;
