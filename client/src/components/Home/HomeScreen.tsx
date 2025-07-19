import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Skeleton,
  Alert,
  Fab,
  CircularProgress,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Event as EventIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  Add as AddIcon,
  People as PeopleIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { ChatRoom as TypesChatRoom } from '../../types';
import type { ChatRoom } from '../../contexts/SocketContext';
import { theme, gradients } from '../../theme/theme';
import FavoriteButton from '../FavoriteButton';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'local' | 'events' | 'education'>('local');

  // Nearby-Rooms aus dem Context holen
  const { chatRooms, isRoomsLoading, isLocationLoading } = useSocket();
  const { currentLocation } = useLocation();

  // Handler müssen vor renderTabs deklariert werden!
  const handleChatRoomClick = (room: ChatRoom) => {
    navigate(`/chat/${room._id}`);
  };

  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  // Hilfsfunktion für Raum-Icon
  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <EventIcon />;
      case 'school':
      case 'university':
        return <SchoolIcon />;
      default:
        return <ChatIcon />;
    }
  };

  // Hilfsfunktion für Raum-Beschreibung
  const getRoomDescription = (room: ChatRoom) => {
    // Wenn eine Beschreibung vorhanden ist, verwende diese
    if (room.description) {
      return room.description;
    }

    // Basierend auf dem Typ eine passende Beschreibung generieren
    switch (room.type) {
      case 'location':
        if (room.location?.city) {
          return `Lokaler Chat für ${room.location.city}`;
        } else if (room.location?.address) {
          return `Lokaler Chat für ${room.location.address}`;
        } else {
          return 'Lokaler Chat in deiner Nähe';
        }
      case 'event':
        return 'Event-Chat für Teilnehmer';
      case 'global':
        return 'Überregionaler Chat für ganz Deutschland';
      default:
        return 'Chatraum in deiner Nähe';
    }
  };

  // Debug-Ausgabe
  console.log('NearbyChatRooms (aus Context):', chatRooms);
  
  // Debug einzelner Räume
  if (chatRooms && chatRooms.length > 0) {
    console.log('🔧 Chat Room Debug:');
    chatRooms.forEach((room, index) => {
      console.log(`   Room ${index + 1}:`, {
        name: room.name,
        type: room.type,
        subType: room.subType,
        description: room.description,
        location: room.location,
        participants: room.participants
      });
    });
  }

  // Ladeanzeige, wenn noch geladen wird
  const isLoading = isRoomsLoading || isLocationLoading;
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

  // --- Tabs und Header immer anzeigen ---
  const renderTabs = (
    <Box sx={{ display: 'flex', gap: 1, mb: 4, justifyContent: 'center' }}>
      {[{ key: 'local', label: 'Lokal', icon: <ChatIcon /> }, { key: 'events', label: 'Events', icon: <EventIcon /> }, { key: 'education', label: 'Bildung', icon: <SchoolIcon /> }].map((tab) => (
        <Button
          key={tab.key}
          variant={activeTab === tab.key ? 'contained' : 'outlined'}
          onClick={() => setActiveTab(tab.key as any)}
          startIcon={tab.icon}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            background: activeTab === tab.key ? gradients.primary : 'transparent',
            border: activeTab === tab.key ? 'none' : '2px solid rgba(255, 255, 255, 0.2)',
            color: activeTab === tab.key ? '#fff' : 'rgba(255,255,255,0.8)',
            fontWeight: 700,
            boxShadow: activeTab === tab.key ? '0 2px 12px 0 #db2777' : 'none',
            '&:hover': {
              background: activeTab === tab.key ? 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)' : 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
            },
          }}
        >
          {tab.label}
        </Button>
      ))}
    </Box>
  );

  // Tab-Filter-Logik
  const filteredRooms = chatRooms?.filter((room: ChatRoom) => {
    switch (activeTab) {
      case 'local':
        return room.type === 'location' && room.subType !== 'regional';
      case 'events':
        return room.type === 'event';
      case 'education':
        // Für Bildung verwenden wir event-Räume als Fallback
        return room.type === 'event';
      default:
        return true;
    }
  }) || [];

  // Regionalen Raum extrahieren (immer anzeigen, unabhängig vom Tab)
  const regionalRoom = chatRooms?.find((room: ChatRoom) => {
    return room.subType === 'regional';
  });
  // Nur die ersten 5 lokalen Räume (ohne regionalen)
  const localRooms = filteredRooms.slice(0, 5);

  // --- NEU: Header, Tabs und Buttons immer oben ---
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            background: gradients.primary,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          Willkommen bei CHATILO
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}
        >
          Entdecke Chaträume in deiner Nähe
        </Typography>
        {/* Location Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
          <LocationIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
          <Typography
            variant="body1"
            sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}
          >
            {currentLocation?.address?.city || 'Standort wird ermittelt...'}
          </Typography>
        </Box>
      </Box>
      {renderTabs}
      {/* Event/Bildung erstellen Button unter den Tabs */}
      {activeTab === 'events' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            sx={{ fontWeight: 700, borderRadius: 2, minWidth: 220 }}
            onClick={handleCreateEvent}
          >
            Event erstellen
          </Button>
        </Box>
      )}
      {activeTab === 'education' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ fontWeight: 700, borderRadius: 2, minWidth: 220 }}
            // TODO: Bildungserstellungs-Modal öffnen
            onClick={() => alert('Bildungsraum erstellen (bald verfügbar)')}
          >
            Bildungsraum erstellen
          </Button>
        </Box>
      )}
      {/* Grid oder Hinweis */}
      {filteredRooms.length === 0 ? (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            Keine Chaträume gefunden
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            {activeTab === 'local' && 'Aktiviere deinen Standort, um lokale Chaträume zu finden'}
            {activeTab === 'events' && 'Noch keine Events in deiner Nähe. Erstelle das erste Event!'}
            {activeTab === 'education' && 'Keine Bildungsräume gefunden.'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Regionaler Raum als erste Kachel */}
          {regionalRoom ? (
            <Grid item xs={12} sm={6} md={4} key={regionalRoom._id || 'regional'}>
              <Card
                onClick={() => handleChatRoomClick(regionalRoom as ChatRoom)}
                sx={{
                  border: '2.5px solid #00bcd4',
                  boxShadow: '0 0 16px 0 #00bcd4',
                  background: 'rgba(0, 188, 212, 0.08)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  height: 200,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 30px rgba(0, 188, 212, 0.3)',
                    border: '2.5px solid #00bcd4',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)',
                  },
                }}
              >
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 24, marginRight: 8 }}>🌍</span>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {regionalRoom.name}
                      </Typography>
                      <Chip label="Regional" color="info" size="small" sx={{ ml: 2, fontWeight: 700 }} />
                    </Box>
                    <FavoriteButton 
                      roomId={regionalRoom._id || (regionalRoom as any).id || ''} 
                      roomName={regionalRoom.name}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2">
                    {regionalRoom.description || 'Regionaler Chat für deine Umgebung'}
                  </Typography>
                  <Typography variant="caption">
                    Mitglieder: {regionalRoom?.participants ?? 'n/a'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#00bcd4', fontWeight: 700 }}>
                    {(regionalRoom as any).distance ? `${(regionalRoom as any).distance.toFixed(1)} km entfernt` : 'Entfernung unbekannt'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            <Grid item xs={12} sm={6} md={4} key="global-fallback">
              <Card
                onClick={() => handleChatRoomClick({
                  _id: 'global_de',
                  name: 'Deutschland-Chat',
                  type: 'global',
                  isActive: true,
                  location: { type: 'Point', coordinates: [10.0, 51.0] }, // Mittelpunkt Deutschland als Dummy
                  description: 'Überregionaler Chat für ganz Deutschland',
                  participants: 0
                } as ChatRoom)}
                sx={{
                  border: '2.5px solid #6366f1',
                  boxShadow: '0 0 16px 0 #6366f1',
                  background: 'rgba(99, 102, 241, 0.08)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  height: 200,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 30px rgba(99, 102, 241, 0.3)',
                    border: '2.5px solid #6366f1',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)',
                  },
                }}
              >
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <span style={{ fontSize: 24, marginRight: 8 }}>🇩🇪</span>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Deutschland-Chat
                    </Typography>
                    <Chip label="Überregional" color="primary" size="small" sx={{ ml: 2, fontWeight: 700 }} />
                  </Box>
                  <Typography variant="body2">
                    Überregionaler Chat für ganz Deutschland
                  </Typography>
                  <Typography variant="caption">
                    Mitglieder: unbekannt
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 700 }}>
                    Für alle Nutzer in Deutschland
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
          {/* Lokale Räume als Kacheln */}
          {localRooms.map((room: ChatRoom, idx: number) => (
            <Grid item xs={12} sm={6} md={4} key={room._id || idx}>
                              <Card
                  onClick={() => handleChatRoomClick(room)}
                sx={{
                  background: 'rgba(30, 30, 30, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  height: 200,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 16px 40px 0 rgba(79, 70, 229, 0.35)',
                    border: '1.5px solid #6366f1',
                    // Kein Gradient mehr!
                  },
                }}
              >
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ background: '#6366f1', mr: 2 }}>{getRoomIcon(room.type)}</Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {room.name}
                      </Typography>
                      <Chip 
                        label={
                          room.type === 'event' ? 'Event' :
                          room.type === 'global' ? 'Überregional' :
                          room.subType === 'regional' ? 'Regional' :
                          'Lokal'
                        } 
                        size="small" 
                        sx={{ ml: 1 }} 
                      />
                    </Box>
                    <FavoriteButton 
                      roomId={room._id || (room as any).id || ''} 
                      roomName={room.name}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2">
                    {getRoomDescription(room)}
                  </Typography>
                  <Typography variant="caption">
                    Mitglieder: {room.participants ?? 'n/a'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#4f46e5', fontWeight: 700 }}>
                    {(room as any).distance ? `${(room as any).distance.toFixed(1)} km entfernt` : 'Entfernung unbekannt'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default HomeScreen; 