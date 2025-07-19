import React, { useState, useEffect, useCallback } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  Box,
  Chip,
} from '@mui/material';
import {
  Star as StarIcon,
  Chat as ChatIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { favoritesService } from '../../services/favoritesService';
import toast from 'react-hot-toast';

interface FavoriteRoom {
  _id: string;
  name: string;
  description?: string;
  createdBy?: {
    username: string;
  };
}

const FavoritesSection: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteRoom[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { chatRooms } = useChat();

  // Lokale Speicherung für Favoriten (Fallback)
  const getLocalFavorites = (): string[] => {
    try {
      const stored = localStorage.getItem('localFavorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const setLocalFavorites = (favorites: string[]) => {
    try {
      localStorage.setItem('localFavorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Fehler beim Speichern der lokalen Favoriten:', error);
    }
  };

  const loadFavorites = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const serverFavorites = await favoritesService.getFavorites();
      setFavorites(serverFavorites);
      
      // Lokale Speicherung mit Server-Daten synchronisieren
      const serverFavoriteIds = serverFavorites.map(fav => fav._id);
      setLocalFavorites(serverFavoriteIds);
    } catch (error) {
      console.error('Fehler beim Laden der Favoriten:', error);
      // Fallback: Lokale Speicherung verwenden
      const localFavorites = getLocalFavorites();
      if (localFavorites.length > 0) {
        // Chat-Room-Daten aus dem Context holen
        const favoriteRooms = localFavorites
          .map(id => chatRooms.find(room => room._id === id))
          .filter(Boolean) as FavoriteRoom[];
        
        if (favoriteRooms.length > 0) {
          setFavorites(favoriteRooms);
        } else {
          // Fallback: Nur IDs anzeigen
          setFavorites(localFavorites.map(id => ({ _id: id, name: `Chatraum ${id}` })));
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, chatRooms]);

  useEffect(() => {
    loadFavorites();
  }, [user, chatRooms]);

  // Event-Listener für Favoriten-Updates
  useEffect(() => {
    const handleFavoritesUpdate = () => {
      loadFavorites();
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, [loadFavorites]);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleFavoriteClick = (roomId: string) => {
    navigate(`/chat/${roomId}`);
  };

  const handleRemoveFavorite = async (roomId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      await favoritesService.removeFromFavorites(roomId);
      setFavorites(prev => prev.filter(fav => fav._id !== roomId));
      toast.success('Aus Favoriten entfernt');
      
      // Lokale Speicherung aktualisieren
      const localFavorites = getLocalFavorites();
      const updatedLocalFavorites = localFavorites.filter(id => id !== roomId);
      localStorage.setItem('localFavorites', JSON.stringify(updatedLocalFavorites));
    } catch (error) {
      console.error('Fehler beim Entfernen aus Favoriten:', error);
      toast.error('Fehler beim Entfernen aus Favoriten');
    }
  };

  // Zeige immer die Favoriten-Sektion an, auch wenn leer
  // if (favorites.length === 0) {
  //   return null; // Zeige nichts an, wenn keine Favoriten vorhanden
  // }

  return (
    <Box>
      {/* Favoriten Header */}
      <ListItemButton
        onClick={handleToggleExpand}
        sx={{
          mx: 1,
          borderRadius: 2,
          background: 'rgba(255, 215, 0, 0.1)',
          border: '1px solid rgba(255, 215, 0, 0.2)',
          '&:hover': {
            background: 'rgba(255, 215, 0, 0.15)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
          },
          transition: 'all 0.2s ease',
        }}
      >
        <ListItemIcon sx={{ color: '#ffd700', minWidth: 40 }}>
          <StarIcon />
        </ListItemIcon>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#ffffff' }}>
                Favoriten
              </Typography>
              <Chip
                label={favorites.length}
                size="small"
                sx={{
                  backgroundColor: '#ffd700',
                  color: '#000',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 20,
                }}
              />
            </Box>
          }
        />
        {isExpanded ? <ExpandLess sx={{ color: '#ffd700' }} /> : <ExpandMore sx={{ color: '#ffd700' }} />}
      </ListItemButton>

      {/* Favoriten Liste */}
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {favorites.length === 0 ? (
            <ListItem sx={{ pl: 4, pr: 1 }}>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontStyle: 'italic',
                      textAlign: 'center',
                      py: 2,
                    }}
                  >
                    Keine Favoriten vorhanden
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            favorites.map((favorite) => (
            <ListItem
              key={favorite._id}
              disablePadding
              sx={{ pl: 4, pr: 1 }}
            >
              <ListItemButton
                onClick={() => handleFavoriteClick(favorite._id)}
                sx={{
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  },
                  transition: 'all 0.2s ease',
                  mb: 0.5,
                }}
              >
                <ListItemIcon sx={{ color: '#ffd700', minWidth: 40 }}>
                  <ChatIcon />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {favorite.name}
                    </Typography>
                  }
                  secondary={
                    favorite.createdBy && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.7rem',
                        }}
                      >
                        von {favorite.createdBy.username}
                      </Typography>
                    )
                  }
                />
                {/* <IconButton
                  size="small"
                  onClick={(e) => handleRemoveFavorite(favorite._id, e)}
                  sx={{
                    color: '#ffd700',
                    '&:hover': {
                      color: '#ffed4e',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <StarIcon fontSize="small" />
                </IconButton> */}
              </ListItemButton>
            </ListItem>
            ))
          )}
        </List>
      </Collapse>
    </Box>
  );
};

export default FavoritesSection; 